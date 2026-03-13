import { Router } from 'express';
import { env } from '../../config/env.js';
import { createRateLimiter } from '../../core/rate-limit-middleware.js';
import { authController } from './controllers/auth.controller.js';
import { requireAuth, requireRoles } from './middleware/auth.middleware.js';

export const authRouter = Router();

const authRateLimiter = createRateLimiter({
  keyPrefix: 'auth',
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX
});

authRouter.post('/register', authRateLimiter, authController.register);
authRouter.get('/verify-email', authController.verifyEmail);
authRouter.post('/login', authRateLimiter, authController.login);
authRouter.post('/google', authRateLimiter, authController.loginWithGoogle);
authRouter.post('/refresh', authRateLimiter, authController.refresh);
authRouter.post('/logout', authRateLimiter, authController.logout);
authRouter.post('/forgot-password', authRateLimiter, authController.forgotPassword);
authRouter.post('/reset-password', authRateLimiter, authController.resetPassword);

authRouter.get('/me', requireAuth, authController.me);
authRouter.post('/change-password', requireAuth, authController.changePassword);
authRouter.post('/logout-all', requireAuth, authController.logoutAll);
authRouter.get('/admin-only', requireAuth, requireRoles('admin'), authController.adminOnly);
