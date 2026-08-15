"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth.config";
import { emirates } from "@/lib/validation/checkout";

const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2),
  phone: z.string().regex(/^(?:\+971|0)5\d{8}$/),
  emirate: z.enum(emirates),
  area: z.string().min(2),
  street: z.string().min(2),
  buildingVilla: z.string().min(1),
  apartment: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AddressActionResult = { success: true } | { success: false; error: string };

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  return (session.user as { id: string }).id;
}

export async function createAddress(formData: unknown): Promise<AddressActionResult> {
  const parsed = addressSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const userId = await requireUserId();

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  await prisma.address.create({ data: { ...parsed.data, userId } });
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(addressId: string): Promise<AddressActionResult> {
  const userId = await requireUserId();
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    return { success: false, error: "Address not found" };
  }
  await prisma.address.delete({ where: { id: addressId } });
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function setDefaultAddress(addressId: string): Promise<AddressActionResult> {
  const userId = await requireUserId();
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    return { success: false, error: "Address not found" };
  }
  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  await prisma.address.update({ where: { id: addressId }, data: { isDefault: true } });
  revalidatePath("/account/addresses");
  return { success: true };
}
