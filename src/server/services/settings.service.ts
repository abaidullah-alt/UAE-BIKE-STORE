import { prisma } from "@/lib/db/prisma";

// Defaults used whenever a key hasn't been explicitly set by an admin yet
// — the site should always work sensibly even with zero settings configured.
export const SETTING_DEFAULTS = {
  storeName: "UAE Bicycle",
  supportEmail: "meharumarhayat111@gmail.com",
  supportPhone: "+971545951150",
  freeShippingThreshold: "500",
  nearZoneShippingRate: "25",
  nearZoneExpressRate: "45",
  farZoneShippingRate: "40",
  lowStockThreshold: "5",
  defaultTaxRate: "5",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

export async function getAllSettings(): Promise<Record<SettingKey, string>> {
  const rows: { key: string; value: string }[] = await prisma.storeSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));

  // Start from a copy of the defaults (which already has every key), then
  // override with any values actually saved in the database. This avoids
  // building up a Record from an empty object, which TypeScript correctly
  // flags as unsafe since {} doesn't structurally guarantee every key exists.
  const result: Record<SettingKey, string> = { ...SETTING_DEFAULTS };
  for (const key of Object.keys(SETTING_DEFAULTS) as SettingKey[]) {
    const value = map.get(key);
    if (value !== undefined) result[key] = value;
  }
  return result;
}

export async function getSetting(key: SettingKey): Promise<string> {
  const row = await prisma.storeSetting.findUnique({ where: { key } });
  return ((row as { value: string } | null)?.value) ?? SETTING_DEFAULTS[key];
}

export async function updateSettings(values: Partial<Record<SettingKey, string>>) {
  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      prisma.storeSetting.upsert({
        where: { key },
        update: { value: value! },
        create: { key, value: value! },
      })
    )
  );
}
