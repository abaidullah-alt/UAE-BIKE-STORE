"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-admin";
import { PERMISSIONS } from "@/lib/security/permissions";
import { logAdminAction } from "@/lib/security/audit-log";
import { setCustomerStatus } from "@/server/services/admin-customer.service";

export type AdminActionResult = { success: true } | { success: false; error: string };

export async function setCustomerStatusAction(
  customerId: string,
  status: "ACTIVE" | "SUSPENDED"
): Promise<AdminActionResult> {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_EDIT);
  try {
    await setCustomerStatus(customerId, status);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not update customer" };
  }
  await logAdminAction({
    userId: (session.user as { id: string }).id,
    action: "customer.status_change",
    entityType: "User",
    entityId: customerId,
    metadata: { newStatus: status },
  });
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${customerId}`);
  return { success: true };
}
