import type { Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../../../core/api-response.js';
import { PaymentsService } from '../services/payments.service.js';
import type { AuthenticatedRequest } from '../../auth/types/auth-request.js';

const oneTimeSchema = z.object({
  title: z.string().min(3).max(120),
  amount: z.number().positive(),
  currency: z.string().default('ARS')
});

const subscriptionSchema = z.object({
  planCode: z.string().min(2).max(40),
  title: z.string().min(3).max(120),
  amount: z.number().positive(),
  currency: z.string().default('ARS'),
  period: z.enum(['monthly', 'yearly'])
});

const webhookSchema = z.object({
  topic: z.string().optional(),
  type: z.string().optional(),
  data: z.object({ id: z.union([z.string(), z.number()]).transform(String).optional() }).optional()
});

export class PaymentsController {
  constructor(private readonly service = new PaymentsService()) {}

  createOneTime = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>): Promise<void> => {
    const body = oneTimeSchema.parse(req.body);
    const result = await this.service.createOneTimePayment({
      userId: req.auth!.userId,
      title: body.title,
      amount: body.amount,
      currency: body.currency
    });
    res.status(201).json({ success: true, data: result });
  };

  createSubscription = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>): Promise<void> => {
    const body = subscriptionSchema.parse(req.body);
    const result = await this.service.createSubscription({
      userId: req.auth!.userId,
      planCode: body.planCode,
      title: body.title,
      amount: body.amount,
      currency: body.currency,
      period: body.period
    });
    res.status(201).json({ success: true, data: result });
  };

  getOrderStatus = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>): Promise<void> => {
    const orderIdRaw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    const orderId = z.string().min(1).parse(orderIdRaw);
    const result = await this.service.getOrderStatus(orderId, { userId: req.auth!.userId, role: req.auth!.role });
    res.status(200).json({ success: true, data: result });
  };

  webhook = async (req: Request, res: Response<ApiResponse<unknown>>): Promise<void> => {
    const parsed = webhookSchema.parse(req.body);
    const payload: { topic?: string; type?: string; data?: { id?: string } } = {};
    if (parsed.topic) payload.topic = parsed.topic;
    if (parsed.type) payload.type = parsed.type;
    if (parsed.data?.id) payload.data = { id: parsed.data.id };
    const result = await this.service.processWebhook(payload, req.header('x-signature') ?? undefined);
    res.status(200).json({ success: true, data: result });
  };

  listAdminTransactions = async (_req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>): Promise<void> => {
    const data = await this.service.listAdminTransactions();
    res.status(200).json({ success: true, data });
  };

  listAdminSubscriptions = async (_req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>): Promise<void> => {
    const data = await this.service.listAdminSubscriptions();
    res.status(200).json({ success: true, data });
  };
}
