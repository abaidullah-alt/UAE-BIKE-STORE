"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/require-admin";
import { PERMISSIONS } from "@/lib/security/permissions";
import { updateSettings, type SettingKey } from "@/server/services/settings.service";

const settingsSchema = z.object({
  storeName: z.string().min(1).optional(),
  supportEmail: z.string().email().optional(),
  supportPhone: z.string().optional(),
  freeShippingThreshold: z.coerce.number().min(0).optional(),
  nearZoneShippingRate: z.coerce.number().min(0).optional(),
  nearZoneExpressRate: z.coerce.number().min(0).optional(),
  farZoneShippingRate: z.coerce.number().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});

export type SettingsActionResult = { success: true } | { success: false; error: string };

export async function updateSettingsAction(formData: unknown): Promise<SettingsActionResult> {
  await requirePermission(PERMISSIONS.SETTINGS_EDIT);

  const parsed = settingsSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  }

  const values: Partial<Record<SettingKey, string>> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) values[key as SettingKey] = String(value);
  }

  await updateSettings(values);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/shipping");
  revalidatePath("/contact");
  revalidatePath("/checkout");
  return { success: true };
}
