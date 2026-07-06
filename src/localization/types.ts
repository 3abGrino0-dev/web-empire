export type TextDirection = "rtl" | "ltr";

export interface LocaleRecord {
  id: string;
  code: string;
  locale_code: string;
  name: string;
  native_name: string;
  direction: TextDirection;
  fallback_locale_id: string | null;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

export type UiMessages = Record<string, string>;

export interface SiteIdentity {
  siteName: string;
  siteNameEn: string | null;
  tagline: string;
  homeSeoTitle: string;
  homeSeoDescription: string;
}
