import { Router } from 'express';
import { env } from '../../config/env.js';
import { createRateLimiter } from '../../core/rate-limit-middleware.js';
import { requireAuth, requireRoles } from '../auth/middleware/auth.middleware.js';
import { pushController } from './controllers/push.controller.js';

export const pushRouter = Router();

const pushRateLimiter = createRateLimiter({
  keyPrefix: 'push',
  windowMs: env.PUSH_RATE_LIMIT_WINDOW_MS,
  max: env.PUSH_RATE_LIMIT_MAX
});

pushRouter.post('/devices', requireAuth, pushRateLimiter, pushController.register);
pushRouter.patch('/devices/token', requireAuth, pushRateLimiter, pushController.refresh);
pushRouter.delete('/devices', requireAuth, pushRateLimiter, pushController.unregister);
pushRouter.get('/devices', requireAuth, pushController.listMine);

pushRouter.post('/admin/send', requireAuth, requireRoles('admin'), pushController.sendAdmin);
