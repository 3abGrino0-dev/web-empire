import "server-only";

import { cookies, headers } from "next/headers";

import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getActiveLocales,
  getDefaultLocale,
} from "@/localization/repository";

export const LOCALE_COOKIE = "web-empire-locale";

function parseAcceptLanguage(value: string | null): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((part) => {
      const [tag, quality] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), quality: quality ? Number(quality) : 1 };
    })
    .filter((item) => item.tag && Number.isFinite(item.quality))
    .sort((left, right) => right.quality - left.quality)
    .flatMap((item) => {
      const base = item.tag.split("-")[0];
      return item.tag === base ? [base] : [item.tag, base];
    });
}

export async function resolveRequestLocale(): Promise<string> {
  const [cookieStore, requestHeaders, activeLocales] = await Promise.all([
    cookies(),
    headers(),
    getActiveLocales(),
  ]);

  const activeCodes = new Set(activeLocales.map((locale) => locale.code.toLowerCase()));
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (userId) {
    const { data } = await supabase
      .from("user_locale_preferences")
      .select("locales(code)")
      .eq("user_id", userId)
      .maybeSingle();

    const relation = (data as { locales?: { code?: string } | { code?: string }[] } | null)?.locales;
    const preferredCode = Array.isArray(relation) ? relation[0]?.code : relation?.code;
    if (preferredCode && activeCodes.has(preferredCode.toLowerCase())) {
      return preferredCode.toLowerCase();
    }
  }

  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value?.toLowerCase();
  if (cookieLocale && activeCodes.has(cookieLocale)) return cookieLocale;

  const country = requestHeaders.get("x-vercel-ip-country")?.toUpperCase();
  if (country && /^[A-Z]{2}$/.test(country)) {
    const { data } = await supabase
      .from("country_locale_rules")
      .select("locales!country_locale_rules_locale_id_fkey(code)")
      .eq("country_code", country)
      .eq("is_active", true)
      .maybeSingle();

    const relation = (data as { locales?: { code?: string } | { code?: string }[] } | null)?.locales;
    const countryCode = Array.isArray(relation) ? relation[0]?.code : relation?.code;
    if (countryCode && activeCodes.has(countryCode.toLowerCase())) {
      return countryCode.toLowerCase();
    }
  }

  if (country && /^[A-Z]{2}$/.test(country)) {
    const { data: groupMemberships } = await supabase
      .from("country_group_members")
      .select("country_groups(locale_id, priority, is_active, locales!country_groups_locale_id_fkey(code))")
      .eq("country_code", country);

    const groups = (groupMemberships ?? [])
      .flatMap((membership) => {
        const relation = (membership as { country_groups?: unknown }).country_groups;
        return Array.isArray(relation) ? relation : relation ? [relation] : [];
      })
      .map((group) => group as { priority?: number; is_active?: boolean; locales?: { code?: string } | { code?: string }[] })
      .filter((group) => group.is_active !== false)
      .sort((left, right) => Number(left.priority ?? 100) - Number(right.priority ?? 100));

    for (const group of groups) {
      const localeRelation = group.locales;
      const groupCode = Array.isArray(localeRelation) ? localeRelation[0]?.code : localeRelation?.code;
      if (groupCode && activeCodes.has(groupCode.toLowerCase())) return groupCode.toLowerCase();
    }
  }

  for (const language of parseAcceptLanguage(requestHeaders.get("accept-language"))) {
    const base = language.split("-")[0];
    if (activeCodes.has(language)) return language;
    if (activeCodes.has(base)) return base;
  }

  if (activeCodes.has("en")) return "en";

  const defaultLocale = await getDefaultLocale();
  if (activeCodes.has(defaultLocale.code.toLowerCase())) return defaultLocale.code.toLowerCase();

  return activeLocales[0]?.code ?? "en";
}
