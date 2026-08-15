"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-admin";
import { PERMISSIONS } from "@/lib/security/permissions";
import { createFaq, deleteFaq, toggleFaqPublished } from "@/server/services/faq.service";

const faqSchema = z.object({
  question: z.string().min(3, "Enter a question"),
  answer: z.string().min(3, "Enter an answer"),
});

export type FaqActionResult = { success: true } | { success: false; error: string };

export async function createFaqAction(formData: unknown): Promise<FaqActionResult> {
  await requirePermission(PERMISSIONS.MARKETING_EDIT);
  const parsed = faqSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  await createFaq(parsed.data.question, parsed.data.answer);
  revalidatePath("/admin/content");
  revalidatePath("/faq");
  return { success: true };
}

export async function deleteFaqAction(id: string): Promise<FaqActionResult> {
  await requirePermission(PERMISSIONS.MARKETING_EDIT);
  await deleteFaq(id);
  revalidatePath("/admin/content");
  revalidatePath("/faq");
  return { success: true };
}

export async function toggleFaqAction(id: string, isPublished: boolean): Promise<FaqActionResult> {
  await requirePermission(PERMISSIONS.MARKETING_EDIT);
  await toggleFaqPublished(id, isPublished);
  revalidatePath("/admin/content");
  revalidatePath("/faq");
  return { success: true };
}
