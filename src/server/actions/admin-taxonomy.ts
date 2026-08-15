"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export async function createCategory(formData: unknown) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(formData);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  await prisma.category.create({ data: { ...parsed.data, parentId: parsed.data.parentId || undefined } });
  revalidatePath("/admin/categories");
  return { success: true as const };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return { success: false as const, error: "Cannot delete — category still has products or subcategories" };
  }
  revalidatePath("/admin/categories");
  return { success: true as const };
}

const brandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
});

export async function createBrand(formData: unknown) {
  await requireAdmin();
  const parsed = brandSchema.safeParse(formData);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  await prisma.brand.create({ data: parsed.data });
  revalidatePath("/admin/brands");
  return { success: true as const };
}

export async function deleteBrand(id: string) {
  await requireAdmin();
  try {
    await prisma.brand.delete({ where: { id } });
  } catch {
    return { success: false as const, error: "Cannot delete — brand still has products" };
  }
  revalidatePath("/admin/brands");
  return { success: true as const };
}
