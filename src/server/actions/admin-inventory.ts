"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adjustStock } from "@/server/services/admin-inventory.service";

export type AdminActionResult = { success: true } | { success: false; error: string };

export async function adjustStockAction(variantId: string, delta: number, reason: string): Promise<AdminActionResult> {
  const session = await requireAdmin();
  if (!delta || !reason.trim()) {
    return { success: false, error: "Enter a quantity and reason" };
  }

  try {
    await adjustStock(variantId, delta, reason, (session.user as { id: string }).id);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not adjust stock" };
  }

  revalidatePath("/admin/inventory");
  return { success: true };
}
