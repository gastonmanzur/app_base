import { randomUUID } from 'node:crypto';
import { AppError } from '../../../core/errors.js';
import { UserRepository } from '../../auth/repositories/user.repository.js';
import { MonetizationConfigRepository } from '../repositories/monetization-config.repository.js';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { SubscriptionRepository } from '../repositories/subscription.repository.js';
import { WebhookEventRepository } from '../repositories/webhook-event.repository.js';
import { MercadoPagoProvider } from '../providers/mercadopago.provider.js';
import type { PaymentProvider } from '../providers/payment-provider.js';

const normalizePaymentStatus = (status: string) => {
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'refunded') return 'refunded';
  if (status === 'in_process') return 'in_process';
  return 'pending';
};

const normalizeSubscriptionStatus = (status: string) => {
  if (status === 'authorized') return 'authorized';
  if (status === 'paused') return 'paused';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'expired') return 'ended';
  return 'pending';
};

export class PaymentsService {
  constructor(
    private readonly configRepository = new MonetizationConfigRepository(),
    private readonly userRepository = new UserRepository(),
    private readonly paymentRepository = new PaymentRepository(),
    private readonly subscriptionRepository = new SubscriptionRepository(),
    private readonly webhookEventRepository = new WebhookEventRepository(),
    private readonly provider: PaymentProvider = new MercadoPagoProvider()
  ) {}

  async createOneTimePayment(input: { userId: string; title: string; amount: number; currency: string }) {
    const config = await this.configRepository.getConfig();
    if (config.monetizationMode === 'subscriptions_only') {
      throw new AppError('PAYMENT_MODE_DISABLED', 409, 'One-time payments are disabled by configuration');
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User not found');
    }

    const externalReference = `ord_${randomUUID()}`;
    const order = await this.paymentRepository.createOrder({
      userId: input.userId,
      type: 'one_time',
      description: input.title,
      amount: input.amount,
      currency: input.currency,
      externalReference
    });

    const checkout = await this.provider.createOneTimePayment({
      externalReference,
      title: input.title,
      amount: input.amount,
      currency: input.currency,
      payerEmail: user.email
    });

    await this.paymentRepository.updateOrderProviderData(String(order._id), {
      providerOrderId: checkout.providerOrderId,
      ...(checkout.preferenceId ? { providerPreferenceId: checkout.preferenceId } : {})
    });

    return {
      orderId: String(order._id),
      externalReference,
      checkoutUrl: checkout.initPoint,
      status: 'pending'
    };
  }

  async createSubscription(input: {
    userId: string;
    planCode: string;
    title: string;
    amount: number;
    currency: string;
    period: 'monthly' | 'yearly';
  }) {
    const config = await this.configRepository.getConfig();
    if (config.monetizationMode === 'one_time_only') {
      throw new AppError('PAYMENT_MODE_DISABLED', 409, 'Subscriptions are disabled by configuration');
    }
    if (config.subscriptionPeriodMode !== 'both' && config.subscriptionPeriodMode !== input.period) {
      throw new AppError('SUBSCRIPTION_PERIOD_DISABLED', 409, `Subscription period '${input.period}' is disabled by configuration`);
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User not found');
    }

    const externalReference = `sub_${randomUUID()}`;
    const subscription = await this.subscriptionRepository.create({
      userId: input.userId,
      planCode: input.planCode,
      title: input.title,
      amount: input.amount,
      currency: input.currency,
      period: input.period,
      externalReference
    });

    const checkout = await this.provider.createSubscription({
      externalReference,
      reason: input.title,
      amount: input.amount,
      currency: input.currency,
      payerEmail: user.email,
      frequency: 1,
      frequencyType: input.period === 'monthly' ? 'months' : 'years'
    });

    await this.subscriptionRepository.updateProviderData(String(subscription._id), {
      providerPreapprovalId: checkout.providerOrderId,
      providerInitPoint: checkout.initPoint
    });

    return {
      subscriptionId: String(subscription._id),
      externalReference,
      checkoutUrl: checkout.initPoint,
      status: 'pending'
    };
  }

  async getOrderStatus(orderId: string, actor: { userId: string; role: 'admin' | 'user' }) {
    const order = await this.paymentRepository.getOrderById(orderId);
    if (!order) {
      throw new AppError('ORDER_NOT_FOUND', 404, 'Order not found');
    }
    if (actor.role !== 'admin' && String(order.userId) !== actor.userId) {
      throw new AppError('FORBIDDEN', 403, 'You cannot access this order');
    }

    return order;
  }

  async processWebhook(payload: { topic?: string; type?: string; data?: { id?: string } }, signatureHeader?: string) {
    const topic = payload.topic ?? payload.type;
    const externalId = payload.data?.id;
    if (!topic || !externalId) {
      throw new AppError('INVALID_WEBHOOK_PAYLOAD', 400, 'Invalid webhook payload');
    }

    if (signatureHeader && !this.validateWebhookSignature(signatureHeader)) {
      throw new AppError('INVALID_WEBHOOK_SIGNATURE', 400, 'Invalid webhook signature');
    }

    const eventKey = `${topic}:${externalId}`;
    const shouldProcess = await this.webhookEventRepository.registerIfFirst('mercadopago', eventKey, topic, payload);
    if (!shouldProcess) {
      return { ignored: true, reason: 'already_processed' as const };
    }

    if (topic === 'payment') {
      const payment = await this.provider.getPaymentStatus(externalId);
      const order = await this.paymentRepository.getOrderByExternalReference(payment.externalReference);
      if (!order) {
        throw new AppError('ORDER_NOT_FOUND', 404, 'Order for webhook payment not found');
      }
      const normalizedStatus = normalizePaymentStatus(payment.status);
      await this.paymentRepository.updateOrderStatus(String(order._id), normalizedStatus);
      await this.paymentRepository.upsertTransaction({
        orderId: String(order._id),
        providerPaymentId: payment.providerPaymentId,
        status: normalizedStatus,
        amount: payment.amount,
        currency: payment.currency,
        ...(payment.statusDetail ? { statusDetail: payment.statusDetail } : {}),
        ...(payment.methodType ? { methodType: payment.methodType } : {}),
        rawPayload: payment.rawPayload
      });
      return { processed: true, topic };
    }

    if (topic === 'subscription_preapproval') {
      const subscription = await this.provider.getSubscriptionStatus(externalId);
      await this.subscriptionRepository.updateStatusByPreapprovalId(
        subscription.providerPreapprovalId,
        normalizeSubscriptionStatus(subscription.status),
        subscription.nextBillingDate ? new Date(subscription.nextBillingDate) : undefined
      );
      return { processed: true, topic };
    }

    return { ignored: true, reason: 'unsupported_topic' as const };
  }

  listAdminTransactions() {
    return this.paymentRepository.listTransactions();
  }

  listAdminSubscriptions() {
    return this.subscriptionRepository.list();
  }

  private validateWebhookSignature(signatureHeader: string): boolean {
    if (!process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      return true;
    }

    return signatureHeader.includes(process.env.MERCADOPAGO_WEBHOOK_SECRET);
  }
}
