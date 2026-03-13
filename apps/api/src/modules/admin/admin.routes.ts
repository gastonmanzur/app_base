import { Router } from 'express';
import { requireAuth, requireRoles } from '../auth/middleware/auth.middleware.js';
import { AdminController } from './admin.controller.js';

const controller = new AdminController();

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRoles('admin'));

adminRouter.get('/dashboard', controller.dashboard);
adminRouter.get('/users', controller.listUsers);
adminRouter.patch('/users/:userId/role', controller.updateUserRole);
adminRouter.get('/payments', controller.listPayments);
adminRouter.get('/subscriptions', controller.listSubscriptions);
adminRouter.post('/notifications/send', controller.sendNotification);
adminRouter.get('/avatars', controller.listAvatars);
adminRouter.delete('/avatars/:userId', controller.deleteAvatar);
adminRouter.get('/monetization-config', controller.getMonetizationConfig);
adminRouter.patch('/monetization-config', controller.updateMonetizationConfig);
