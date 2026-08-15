"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/require-admin";
import { PERMISSIONS } from "@/lib/security/permissions";
import { logAdminAction } from "@/lib/security/audit-log";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  setProductStatus,
  type ProductFormData,
} from "@/server/services/admin-product.service";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  sku: z.string().min(2),
  categoryId: z.string().min(1, "Select a category"),
  brandId: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive("Enter a valid price"),
  salePrice: z.coerce.number().positive().optional().or(z.literal(undefined)),
  taxRate: z.coerce.number().min(0).default(5),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.object({ url: z.string().url(), altText: z.string().optional() })).default([]),
  attributes: z
    .array(z.object({ key: z.string(), label: z.string(), value: z.string(), unit: z.string().optional() }))
    .default([]),
  initialStock: z.coerce.number().int().min(0).optional(),
});

export type ProductActionResult = { success: true } | { success: false; error: string };

export async function createProductAction(formData: unknown): Promise<ProductActionResult> {
  await requirePermission(PERMISSIONS.PRODUCTS_EDIT);
  const parsed = productSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid product data" };
  }
  try {
    await createProduct(parsed.data as ProductFormData);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not create product" };
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(id: string, formData: unknown): Promise<ProductActionResult> {
  await requirePermission(PERMISSIONS.PRODUCTS_EDIT);
  const parsed = productSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid product data" };
  }
  try {
    await updateProduct(id, parsed.data as ProductFormData);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not update product" };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  redirect("/admin/products");
}

export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  const session = await requirePermission(PERMISSIONS.PRODUCTS_DELETE);
  try {
    await deleteProduct(id);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not delete product" };
  }
  await logAdminAction({
    userId: (session.user as { id: string }).id,
    action: "product.delete",
    entityType: "Product",
    entityId: id,
  });
  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductStatusAction(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
): Promise<ProductActionResult> {
  await requirePermission(PERMISSIONS.PRODUCTS_EDIT);
  try {
    await setProductStatus(id, status);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not update status" };
  }
  revalidatePath("/admin/products");
  return { success: true };
}
