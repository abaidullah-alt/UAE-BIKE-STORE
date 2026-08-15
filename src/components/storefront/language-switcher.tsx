"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/server/actions/locale";
import type { Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSwitch() {
    const next: Locale = currentLocale === "en" ? "ar" : "en";
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      className="hidden sm:inline-flex text-sm font-medium text-slate-700 px-2 py-2 hover:text-orange-600"
    >
      {currentLocale === "en" ? "العربية" : "English"}
    </button>
  );
}
