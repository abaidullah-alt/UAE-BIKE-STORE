"use server";

import { checkoutSchema } from "@/lib/validation/checkout";
import { placeOrder } from "@/server/services/order.service";

export type CheckoutResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

export async function submitCheckout(formData: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const order = await placeOrder(parsed.data);
    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not place order" };
  }
}
