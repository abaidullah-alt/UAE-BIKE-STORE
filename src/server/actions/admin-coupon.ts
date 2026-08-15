"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createCoupon, toggleCouponActive, deleteCoupon } from "@/server/services/admin-coupon.service";

const couponSchema = z.object({
  code: z.string().min(3, "Enter a coupon code"),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.coerce.number().min(0),
  minOrderValue: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
});

export type AdminActionResult = { success: true } | { success: false; error: string };

export async function createCouponAction(formData: unknown): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = couponSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid coupon" };

  try {
    await createCoupon(parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error && err.message.includes("Unique") ? "That coupon code already exists" : "Could not create coupon" };
  }
  revalidatePath("/admin/marketing/coupons");
  return { success: true };
}

export async function toggleCouponAction(id: string, isActive: boolean): Promise<AdminActionResult> {
  await requireAdmin();
  await toggleCouponActive(id, isActive);
  revalidatePath("/admin/marketing/coupons");
  return { success: true };
}

export async function deleteCouponAction(id: string): Promise<AdminActionResult> {
  await requireAdmin();
  await deleteCoupon(id);
  revalidatePath("/admin/marketing/coupons");
  return { success: true };
}
