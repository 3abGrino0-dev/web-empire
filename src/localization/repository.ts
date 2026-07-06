import "server-only";

import { cache } from "react";

import type {
  LocaleRecord,
  SiteIdentity,
  UiMessages,
} from "@/localization/types";
import { withEnglishFallback } from "@/localization/messages";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getActiveLocales = cache(async (): Promise<LocaleRecord[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("locales")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return (data ?? []) as LocaleRecord[];
});

export async function getLocaleByCode(code: string): Promise<LocaleRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("locales")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as LocaleRecord | null;
}

export async function getDefaultLocale(): Promise<LocaleRecord> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("locales")
    .select("*")
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("sort_order")
    .limit(1)
    .single();

  if (error) throw new Error(error.message);
  return data as LocaleRecord;
}

export async function getUiMessages(locale: LocaleRecord): Promise<UiMessages> {
  const supabase = await createSupabaseServerClient();

  const localeIds = [locale.id];
  if (locale.fallback_locale_id) localeIds.unshift(locale.fallback_locale_id);

  const { data, error } = await supabase
    .from("ui_translations")
    .select("locale_id, translation_key, translation_value")
    .in("locale_id", localeIds);

  if (error) throw new Error(error.message);

  const messages: UiMessages = {};
  for (const localeId of localeIds) {
    for (const row of data ?? []) {
      if (row.locale_id === localeId) {
        messages[row.translation_key] = row.translation_value;
      }
    }
  }

  return withEnglishFallback(messages);
}

export async function getSiteIdentity(locale: LocaleRecord): Promise<SiteIdentity> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("site_identity_translations")
    .select("*")
    .eq("locale_id", locale.id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (data) {
    return {
      siteName: data.site_name,
      siteNameEn: data.site_name_en,
      tagline: data.tagline,
      homeSeoTitle: data.home_seo_title ?? data.site_name,
      homeSeoDescription: data.home_seo_description ?? data.tagline,
    };
  }

  return {
    siteName: locale.code === "ar" ? "إمبراطورية الويب" : "Web Empire",
    siteNameEn: "Web Empire",
    tagline: locale.code === "ar" ? "أدواتك. ذكاؤك. إمبراطوريتك." : "Your tools. Your intelligence. Your empire.",
    homeSeoTitle: "Web Empire",
    homeSeoDescription: "Tools and AI in one platform.",
  };
}
