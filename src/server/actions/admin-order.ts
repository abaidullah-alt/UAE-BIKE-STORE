"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-admin";
import { PERMISSIONS } from "@/lib/security/permissions";
import { logAdminAction } from "@/lib/security/audit-log";
import { updateOrderStatus, updateShipmentTracking } from "@/server/services/admin-order.service";
import { prisma } from "@/lib/db/prisma";

const orderStatuses = [
  "PENDING", "PAYMENT_PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED",
  "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED",
  "REFUND_REQUESTED", "REFUNDED",
] as const;

export type AdminActionResult = { success: true } | { success: false; error: string };

export async function updateOrderStatusAction(orderId: string, status: string): Promise<AdminActionResult> {
  const session = await requirePermission(PERMISSIONS.ORDERS_EDIT);
  const parsed = z.enum(orderStatuses).safeParse(status);
  if (!parsed.success) return { success: false, error: "Invalid status" };

  await updateOrderStatus(orderId, parsed.data);

  await logAdminAction({
    userId: (session.user as { id: string }).id,
    action: "order.status_change",
    entityType: "Order",
    entityId: orderId,
    metadata: { newStatus: parsed.data },
  });

  // Keep the shipment record roughly in sync for the statuses that map cleanly.
  const shipmentStatusMap: Partial<Record<(typeof orderStatuses)[number], "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED">> = {
    SHIPPED: "SHIPPED",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
  };
  const mapped = shipmentStatusMap[parsed.data];
  if (mapped) {
    try {
      await updateShipmentTracking(orderId, { status: mapped });
    } catch {
      // No shipment record — fine, ignore.
    }
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return { success: true };
}

const trackingSchema = z.object({
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
});

export async function updateTrackingAction(orderId: string, formData: unknown): Promise<AdminActionResult> {
  await requirePermission(PERMISSIONS.ORDERS_EDIT);
  const parsed = trackingSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: "Invalid tracking info" };

  try {
    await updateShipmentTracking(orderId, parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not update tracking" };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
  return { success: true };
}

export async function markRefundAction(paymentId: string, amount: number, reason?: string): Promise<AdminActionResult> {
  const session = await requirePermission(PERMISSIONS.ORDERS_REFUND);
  if (amount <= 0) return { success: false, error: "Enter a valid refund amount" };

  await prisma.$transaction(async (tx) => {
    await tx.refund.create({ data: { paymentId, amount, reason, status: "COMPLETED" } });
    const payment = await tx.payment.findUnique({ where: { id: paymentId }, include: { refunds: true } });
    if (!payment) return;
    const totalRefunded = payment.refunds.reduce((sum, r) => sum + Number(r.amount), 0) + amount;
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: totalRefunded >= Number(payment.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED" },
    });
  });

  await logAdminAction({
    userId: (session.user as { id: string }).id,
    action: "payment.refund",
    entityType: "Payment",
    entityId: paymentId,
    metadata: { amount, reason },
  });

  revalidatePath("/admin/orders");
  return { success: true };
}

/**
 * Confirms cash was actually collected for a Cash-on-Delivery order.
 * Without this, COD payments sit at "PENDING" forever with no way to
 * mark them as actually settled once the courier hands over the cash.
 */
export async function markPaymentPaidAction(paymentId: string): Promise<AdminActionResult> {
  const session = await requirePermission(PERMISSIONS.ORDERS_EDIT);

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { success: false, error: "Payment not found" };
  if (payment.status === "PAID") return { success: false, error: "Already marked as paid" };
  if (payment.status === "REFUNDED" || payment.status === "PARTIALLY_REFUNDED") {
    return { success: false, error: "Can't mark a refunded payment as paid" };
  }

  await prisma.payment.update({ where: { id: paymentId }, data: { status: "PAID" } });

  await logAdminAction({
    userId: (session.user as { id: string }).id,
    action: "payment.mark_paid",
    entityType: "Payment",
    entityId: paymentId,
  });

  revalidatePath("/admin/orders");
  return { success: true };
}
