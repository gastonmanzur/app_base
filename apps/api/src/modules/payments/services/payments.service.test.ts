import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../core/errors.js';
import { PaymentsService } from './payments.service.js';

describe('PaymentsService', () => {
  it('rejects one-time payment when mode is subscriptions_only', async () => {
    const service = new PaymentsService(
      { getConfig: vi.fn().mockResolvedValue({ monetizationMode: 'subscriptions_only', subscriptionPeriodMode: 'both' }) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

    await expect(service.createOneTimePayment({ userId: 'u1', title: 'Plan', amount: 10, currency: 'ARS' })).rejects.toBeInstanceOf(AppError);
  });

  it('creates one-time payment when enabled', async () => {
    const createOrder = vi.fn().mockResolvedValue({ _id: 'ord1' });
    const service = new PaymentsService(
      { getConfig: vi.fn().mockResolvedValue({ monetizationMode: 'both', subscriptionPeriodMode: 'both' }) } as never,
      { findById: vi.fn().mockResolvedValue({ _id: 'u1', email: 'user@test.com' }) } as never,
      { createOrder, updateOrderProviderData: vi.fn() } as never,
      {} as never,
      {} as never,
      {
        createOneTimePayment: vi.fn().mockResolvedValue({ providerOrderId: 'mp1', preferenceId: 'mp1', initPoint: 'https://checkout' })
      } as never
    );

    const result = await service.createOneTimePayment({ userId: 'u1', title: 'Plan', amount: 10, currency: 'ARS' });
    expect(createOrder).toHaveBeenCalled();
    expect(result.checkoutUrl).toContain('checkout');
  });

  it('creates subscription when mode and period are enabled', async () => {
    const service = new PaymentsService(
      { getConfig: vi.fn().mockResolvedValue({ monetizationMode: 'both', subscriptionPeriodMode: 'both' }) } as never,
      { findById: vi.fn().mockResolvedValue({ _id: 'u1', email: 'user@test.com' }) } as never,
      {} as never,
      { create: vi.fn().mockResolvedValue({ _id: 'sub1' }), updateProviderData: vi.fn() } as never,
      {} as never,
      { createSubscription: vi.fn().mockResolvedValue({ providerOrderId: 'pre1', initPoint: 'https://checkout-sub' }) } as never
    );

    const result = await service.createSubscription({
      userId: 'u1',
      planCode: 'pro_monthly',
      title: 'Plan Pro mensual',
      amount: 1990,
      currency: 'ARS',
      period: 'monthly'
    });

    expect(result.checkoutUrl).toContain('checkout-sub');
  });

  it('rejects invalid webhook payload', async () => {
    const service = new PaymentsService({} as never, {} as never, {} as never, {} as never, {} as never, {} as never);
    await expect(service.processWebhook({ topic: 'payment' })).rejects.toBeInstanceOf(AppError);
  });

  it('processes webhook idempotently', async () => {
    const service = new PaymentsService(
      {} as never,
      {} as never,
      {
        getOrderByExternalReference: vi.fn().mockResolvedValue({ _id: 'ord1' }),
        updateOrderStatus: vi.fn(),
        upsertTransaction: vi.fn()
      } as never,
      {} as never,
      { registerIfFirst: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false) } as never,
      {
        getPaymentStatus: vi.fn().mockResolvedValue({
          providerPaymentId: '123',
          externalReference: 'ref',
          status: 'approved',
          amount: 10,
          currency: 'ARS'
        })
      } as never
    );

    const first = await service.processWebhook({ topic: 'payment', data: { id: '123' } });
    const second = await service.processWebhook({ topic: 'payment', data: { id: '123' } });

    expect(first).toEqual({ processed: true, topic: 'payment' });
    expect(second).toEqual({ ignored: true, reason: 'already_processed' });
  });

  it('propagates provider errors', async () => {
    const service = new PaymentsService(
      { getConfig: vi.fn().mockResolvedValue({ monetizationMode: 'both', subscriptionPeriodMode: 'both' }) } as never,
      { findById: vi.fn().mockResolvedValue({ _id: 'u1', email: 'user@test.com' }) } as never,
      { createOrder: vi.fn().mockResolvedValue({ _id: 'ord1' }) } as never,
      {} as never,
      {} as never,
      { createOneTimePayment: vi.fn().mockRejectedValue(new AppError('PAYMENT_PROVIDER_ERROR', 502, 'boom')) } as never
    );

    await expect(service.createOneTimePayment({ userId: 'u1', title: 'Plan', amount: 10, currency: 'ARS' })).rejects.toBeInstanceOf(AppError);
  });
});
