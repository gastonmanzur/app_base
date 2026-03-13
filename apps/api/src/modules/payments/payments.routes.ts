import { Router } from 'express';
import { requireAuth, requireRoles } from '../auth/middleware/auth.middleware.js';
import { PaymentsController } from './controllers/payments.controller.js';

const controller = new PaymentsController();

export const paymentsRouter = Router();

paymentsRouter.post('/webhooks/mercadopago', controller.webhook);

paymentsRouter.post('/one-time', requireAuth, controller.createOneTime);
paymentsRouter.post('/subscriptions', requireAuth, controller.createSubscription);
paymentsRouter.get('/orders/:orderId', requireAuth, controller.getOrderStatus);

paymentsRouter.get('/admin/transactions', requireAuth, requireRoles('admin'), controller.listAdminTransactions);
paymentsRouter.get('/admin/subscriptions', requireAuth, requireRoles('admin'), controller.listAdminSubscriptions);
