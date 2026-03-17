import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './services/auth.service.js';

const baseUser = {
  _id: { toString: () => 'u1' },
  email: 'john@example.com',
  provider: 'local' as const,
  passwordHash: '$2a$12$4olHQ0YuV78f7u5d5cLjN.urRZA9E6xM8AYrWf8YhNfA0xB7GhGCu',
  role: 'user' as const,
  emailVerified: true
};

describe('AuthService', () => {
  it('rejects provider conflict on local register', async () => {
    const service = new AuthService(
      { findByEmail: async () => ({ ...baseUser, provider: 'google' }), create: async () => baseUser } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

    await expect(service.registerLocal('john@example.com', 'Password123')).rejects.toMatchObject({
      code: 'PROVIDER_CONFLICT'
    });
  });

  it('rejects invalid credentials on local login', async () => {
    const service = new AuthService(
      { findByEmail: async () => ({ ...baseUser, passwordHash: '$2a$12$invalid.invalid.invalid.invalid.invalid' }) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

    await expect(service.loginLocal('john@example.com', 'Password123')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS'
    });
  });

  it('returns generic response on forgot password for unknown user', async () => {
    const service = new AuthService(
      { findByEmail: async () => null } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

    await expect(service.forgotPassword('unknown@example.com')).resolves.toBeUndefined();
  });

  it('rejects google login when local account already exists', async () => {
    const service = new AuthService(
      { findByEmail: vi.fn().mockResolvedValue(baseUser) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { verifyIdToken: vi.fn().mockResolvedValue({ email: 'john@example.com', googleId: 'gid-1', emailVerified: true, picture: null }) } as never
    );

    await expect(service.loginWithGoogle('id-token')).rejects.toMatchObject({ code: 'PROVIDER_CONFLICT' });
  });

  it('rotates refresh token on refresh session', async () => {
    const sessions = {
      findActiveByHash: vi.fn().mockResolvedValue({ userId: { toString: () => 'u1' } }),
      revokeByHash: vi.fn(),
      create: vi.fn()
    };

    const users = {
      findById: vi.fn().mockResolvedValue(baseUser),
      updateLastLogin: vi.fn()
    };

    const service = new AuthService(users as never, sessions as never, {} as never, undefined, {} as never, {} as never);

    const result = await service.refreshSession('refresh-token-1234567890');

    expect(result.accessToken).toBeTypeOf('string');
    expect(result.refreshToken).toBeTypeOf('string');
    expect(sessions.revokeByHash).toHaveBeenCalledTimes(1);
    expect(sessions.create).toHaveBeenCalledTimes(1);
  });

  it('revokes all sessions on logoutAll', async () => {
    const sessions = {
      revokeAllByUserId: vi.fn()
    };
    const service = new AuthService({} as never, sessions as never, {} as never, {} as never, {} as never, {} as never);
    await service.logoutAll('u1');
    expect(sessions.revokeAllByUserId).toHaveBeenCalledWith('u1');
  });
});
