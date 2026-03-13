import bcrypt from 'bcryptjs';
import type { UserRole } from '@starter/shared-types';
import { AppError } from '../../../core/errors.js';
import { env } from '../../../config/env.js';
import { ActionTokenRepository } from '../repositories/action-token.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { GoogleAuthService } from './google-auth.service.js';
import { MailService } from './mail.service.js';
import { TokenService } from './token.service.js';

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    provider: 'local' | 'google';
    emailVerified: boolean;
  };
}

export class AuthService {
  constructor(
    private readonly users = new UserRepository(),
    private readonly sessions = new SessionRepository(),
    private readonly actionTokens = new ActionTokenRepository(),
    private readonly tokenService = new TokenService(),
    private readonly mailService = new MailService(),
    private readonly googleAuth = new GoogleAuthService()
  ) {}

  async registerLocal(email: string, password: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.users.findByEmail(normalizedEmail);
    if (existing && existing.provider !== 'local') {
      throw new AppError('PROVIDER_CONFLICT', 409, 'This email is already registered with Google sign-in');
    }
    if (existing) {
      throw new AppError('EMAIL_ALREADY_EXISTS', 409, 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.users.create({
      email: normalizedEmail,
      provider: 'local',
      passwordHash,
      emailVerified: false
    });

    await this.createAndSendVerifyEmail(user._id.toString(), user.email);
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(token);
    const actionToken = await this.actionTokens.findActiveByHash(tokenHash, 'verify_email');
    if (!actionToken) {
      throw new AppError('INVALID_TOKEN', 400, 'Verification token is invalid or expired');
    }

    await this.users.markEmailVerified(actionToken.userId.toString());
    await this.actionTokens.consumeByHash(tokenHash);
  }

  async loginLocal(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.users.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password');
    }
    if (user.provider !== 'local') {
      throw new AppError('PROVIDER_CONFLICT', 409, 'This account uses Google sign-in');
    }
    if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password');
    }
    if (!user.emailVerified) {
      throw new AppError('EMAIL_NOT_VERIFIED', 403, 'Verify your email before logging in');
    }

    return this.createSession(user._id.toString(), user.email, user.role, user.provider, user.emailVerified);
  }

  async loginWithGoogle(idToken: string): Promise<AuthResult> {
    const profile = await this.googleAuth.verifyIdToken(idToken);
    const existing = await this.users.findByEmail(profile.email);

    if (existing && existing.provider !== 'google') {
      throw new AppError('PROVIDER_CONFLICT', 409, 'This email is already registered with email/password');
    }

    const user =
      existing ??
      (await this.users.create({
        email: profile.email,
        provider: 'google',
        googleId: profile.googleId,
        emailVerified: profile.emailVerified
      }));

    return this.createSession(user._id.toString(), user.email, user.role, user.provider, user.emailVerified);
  }

  async refreshSession(refreshToken: string): Promise<AuthResult> {
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const currentSession = await this.sessions.findActiveByHash(tokenHash);
    if (!currentSession) {
      throw new AppError('INVALID_REFRESH_TOKEN', 401, 'Refresh token is invalid or expired');
    }

    await this.sessions.revokeByHash(tokenHash);
    const user = await this.users.findById(currentSession.userId.toString());
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User not found');
    }

    return this.createSession(user._id.toString(), user.email, user.role, user.provider, user.emailVerified);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.sessions.revokeByHash(this.tokenService.hashToken(refreshToken));
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessions.revokeAllByUserId(userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findByEmail(email.toLowerCase().trim());
    if (!user || user.provider !== 'local') {
      return;
    }

    const rawToken = this.tokenService.generateRefreshToken();
    const tokenHash = this.tokenService.hashToken(rawToken);
    await this.actionTokens.consumeByUser(user._id.toString(), 'reset_password');
    await this.actionTokens.create({
      userId: user._id.toString(),
      tokenHash,
      type: 'reset_password',
      expiresAt: this.tokenService.getResetPasswordExpiryDate()
    });

    const resetUrl = `${env.WEB_BASE_URL}/reset-password?token=${rawToken}`;
    await this.mailService.sendResetPassword(user.email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(token);
    const actionToken = await this.actionTokens.findActiveByHash(tokenHash, 'reset_password');
    if (!actionToken) {
      throw new AppError('INVALID_TOKEN', 400, 'Reset token is invalid or expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.users.updatePasswordHash(actionToken.userId.toString(), passwordHash);
    await this.actionTokens.consumeByHash(tokenHash);
    await this.sessions.revokeAllByUserId(actionToken.userId.toString());
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user || user.provider !== 'local' || !user.passwordHash) {
      throw new AppError('FORBIDDEN', 403, 'Password change is only available for local accounts');
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new AppError('INVALID_CREDENTIALS', 401, 'Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.users.updatePasswordHash(userId, passwordHash);
    await this.sessions.revokeAllByUserId(userId);
  }

  async getProfile(userId: string): Promise<{ id: string; email: string; role: UserRole; provider: 'local' | 'google' }> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User not found');
    }

    return { id: user._id.toString(), email: user.email, role: user.role, provider: user.provider };
  }

  private async createAndSendVerifyEmail(userId: string, email: string): Promise<void> {
    const rawToken = this.tokenService.generateRefreshToken();
    await this.actionTokens.consumeByUser(userId, 'verify_email');
    await this.actionTokens.create({
      userId,
      tokenHash: this.tokenService.hashToken(rawToken),
      type: 'verify_email',
      expiresAt: this.tokenService.getEmailVerificationExpiryDate()
    });

    const verifyUrl = `${env.APP_BASE_URL}/api/auth/verify-email?token=${rawToken}`;
    await this.mailService.sendVerifyEmail(email, verifyUrl);
  }

  private async createSession(
    userId: string,
    email: string,
    role: UserRole,
    provider: 'local' | 'google',
    emailVerified: boolean
  ): Promise<AuthResult> {
    const refreshToken = this.tokenService.generateRefreshToken();
    const refreshHash = this.tokenService.hashToken(refreshToken);
    await this.sessions.create({
      userId,
      tokenHash: refreshHash,
      expiresAt: this.tokenService.getRefreshExpiryDate()
    });
    await this.users.updateLastLogin(userId);

    const accessToken = this.tokenService.generateAccessToken({ sub: userId, role, email });

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, role, provider, emailVerified }
    };
  }
}
