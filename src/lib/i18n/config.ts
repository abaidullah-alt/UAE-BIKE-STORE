import { cookies } from "next/headers";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

const dictionaries: Record<Locale, typeof en> = { en, ar };

const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === "ar" ? "ar" : "en";
}

export async function getDictionary(): Promise<typeof en> {
  const locale = await getLocale();
  return dictionaries[locale];
}

export function isRtl(locale: Locale) {
  return locale === "ar";
}

export { LOCALE_COOKIE };
