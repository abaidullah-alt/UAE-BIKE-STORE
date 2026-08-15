import { prisma } from "@/lib/db/prisma";
import type { CouponType } from "@prisma/client";

export async function listCoupons() {
  return prisma.coupon.findMany({ orderBy: { id: "desc" } });
}

export interface CouponFormData {
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  usageLimit?: number;
  expiresAt?: string;
}

export async function createCoupon(data: CouponFormData) {
  return prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minOrderValue: data.minOrderValue,
      usageLimit: data.usageLimit,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    },
  });
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  await prisma.coupon.update({ where: { id }, data: { isActive } });
}

export async function deleteCoupon(id: string) {
  await prisma.coupon.delete({ where: { id } });
}

/** Validates a coupon code against an order subtotal and returns the discount amount, or an error. */
export async function validateCoupon(code: string, subtotal: number): Promise<{ coupon: Awaited<ReturnType<typeof prisma.coupon.findUnique>>; discount: number } | { error: string }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) return { error: "Invalid or inactive coupon code" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: "This coupon has expired" };
  if (coupon.startsAt && coupon.startsAt > new Date()) return { error: "This coupon is not active yet" };
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return { error: "This coupon has reached its usage limit" };
  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return { error: `Minimum order of AED ${coupon.minOrderValue} required for this coupon` };
  }

  let discount = 0;
  if (coupon.type === "PERCENTAGE") discount = subtotal * (Number(coupon.value) / 100);
  else if (coupon.type === "FIXED_AMOUNT") discount = Number(coupon.value);
  // FREE_SHIPPING is applied separately against the shipping total in the order service.

  return { coupon, discount: Math.min(discount, subtotal) };
}
