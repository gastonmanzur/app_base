import { Router } from 'express';
import { requireAuth, requireRoles } from '../auth/middleware/auth.middleware.js';
import { pushController } from './controllers/push.controller.js';

export const pushRouter = Router();

pushRouter.post('/devices', requireAuth, pushController.register);
pushRouter.patch('/devices/token', requireAuth, pushController.refresh);
pushRouter.delete('/devices', requireAuth, pushController.unregister);
pushRouter.get('/devices', requireAuth, pushController.listMine);

pushRouter.post('/admin/send', requireAuth, requireRoles('admin'), pushController.sendAdmin);
