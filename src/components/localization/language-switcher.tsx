"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import type { LocaleRecord } from "@/localization/types";

export function LanguageSwitcher({
  locales,
  currentLocale,
  label,
}: {
  locales: LocaleRecord[];
  currentLocale: string;
  label: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function changeLocale(nextLocale: string) {
    if (nextLocale === currentLocale || pending) return;
    setPending(true);

    try {
      await fetch("/api/localization/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });

      const segments = pathname.split("/").filter(Boolean);
      if (segments.length && segments[0] === currentLocale) {
        segments[0] = nextLocale;
      } else {
        segments.unshift(nextLocale);
      }

      router.push(`/${segments.join("/")}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <label className="language-switcher" aria-label={label}>
      <span aria-hidden="true">◎</span>
      <select
        value={currentLocale}
        disabled={pending}
        onChange={(event) => void changeLocale(event.target.value)}
      >
        {locales.map((locale) => (
          <option key={locale.id} value={locale.code}>
            {locale.native_name}
          </option>
        ))}
      </select>
    </label>
  );
}
