import { Router } from 'express';
import { authController } from './controllers/auth.controller.js';
import { requireAuth, requireRoles } from './middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.get('/verify-email', authController.verifyEmail);
authRouter.post('/login', authController.login);
authRouter.post('/google', authController.loginWithGoogle);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);

authRouter.get('/me', requireAuth, authController.me);
authRouter.post('/change-password', requireAuth, authController.changePassword);
authRouter.post('/logout-all', requireAuth, authController.logoutAll);
authRouter.get('/admin-only', requireAuth, requireRoles('admin'), authController.adminOnly);
