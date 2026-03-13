import { SubscriptionModel, type subscriptionStatuses } from '../models/subscription.model.js';

export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export class SubscriptionRepository {
  create(input: {
    userId: string;
    planCode: string;
    title: string;
    amount: number;
    currency: string;
    period: 'monthly' | 'yearly';
    externalReference: string;
    metadata?: Record<string, unknown>;
  }) {
    return SubscriptionModel.create(input);
  }

  updateProviderData(subscriptionId: string, data: { providerPreapprovalId?: string; providerInitPoint?: string }) {
    return SubscriptionModel.findByIdAndUpdate(subscriptionId, data, { new: true });
  }

  updateStatusByPreapprovalId(providerPreapprovalId: string, status: SubscriptionStatus, nextBillingDate?: Date) {
    return SubscriptionModel.findOneAndUpdate(
      { provider: 'mercadopago', providerPreapprovalId },
      { status, ...(nextBillingDate ? { nextBillingDate } : {}) },
      { new: true }
    );
  }

  getById(subscriptionId: string) {
    return SubscriptionModel.findById(subscriptionId).lean();
  }

  list(limit = 50) {
    return SubscriptionModel.find().sort({ createdAt: -1 }).limit(limit).lean();
  }
}
