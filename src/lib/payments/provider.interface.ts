export interface PaymentSessionInput {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
}

export interface PaymentSession {
  /** "cod" providers return status PAID/PENDING immediately with no redirect. */
  status: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED";
  providerRef: string;
  /** Present for providers that redirect the customer to a hosted payment page. */
  redirectUrl?: string;
}

export interface WebhookResult {
  orderId: string;
  status: "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  providerRef: string;
  rawPayload: unknown;
}

/**
 * Every payment provider (COD, Telr, Stripe, Network International, ...)
 * implements this interface. Checkout and webhook code only ever talk to
 * PaymentService, never to a specific provider directly — this is what lets
 * the actual UAE gateway be swapped in later without touching business logic.
 */
export interface PaymentProvider {
  readonly name: string;
  createPaymentSession(input: PaymentSessionInput): Promise<PaymentSession>;
  verifyWebhookSignature(payload: unknown, headers: Headers): boolean;
  parseWebhookEvent(payload: unknown): WebhookResult;
  refund(providerRef: string, amount: number): Promise<{ success: boolean; refundRef?: string }>;
}
