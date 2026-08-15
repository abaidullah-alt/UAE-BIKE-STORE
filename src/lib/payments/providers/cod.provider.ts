import { randomUUID } from "crypto";
import type { PaymentProvider, PaymentSessionInput, PaymentSession, WebhookResult } from "../provider.interface";

/**
 * COD is modeled as a "payment provider" too, so checkout has exactly one
 * code path regardless of payment method. No money actually moves here —
 * the order is simply marked PENDING and collected on delivery.
 */
export const codProvider: PaymentProvider = {
  name: "cod",

  async createPaymentSession(input: PaymentSessionInput): Promise<PaymentSession> {
    return {
      status: "PENDING",
      providerRef: `cod_${randomUUID()}`,
    };
  },

  verifyWebhookSignature(): boolean {
    // COD has no external webhooks — nothing to verify.
    return true;
  },

  parseWebhookEvent(): WebhookResult {
    throw new Error("COD provider does not emit webhooks");
  },

  async refund(): Promise<{ success: boolean; refundRef?: string }> {
    // COD refunds are handled manually by store staff (cash/bank transfer),
    // tracked via the Refund model, not through this method.
    return { success: true };
  },
};
