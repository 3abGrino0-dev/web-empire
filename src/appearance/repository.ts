import "server-only";

import { cache } from "react";

import type { AppearanceSettings } from "@/appearance/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const fallbackAppearance: AppearanceSettings = {
  presetKey: "ai_saas",
  primaryColor: "#7C3AED",
  accentColor: "#06B6D4",
  backgroundColor: "#F5F7FB",
  surfaceColor: "#FFFFFF",
  inkColor: "#0B1324",
  darkBackgroundColor: "#050B16",
  darkSurfaceColor: "#0B1628",
  darkInkColor: "#F8FAFC",
  headerStyle: "floating",
  heroStyle: "ai_search",
  cardStyle: "soft",
  borderRadius: 20,
  uiDensity: "comfortable",
  desktopColumns: 3,
  tabletColumns: 2,
  mobileColumns: 1,
  defaultColorMode: "system",
  fontPreset: "modern",
};

export const getAppearanceSettings = cache(async (): Promise<AppearanceSettings> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_appearance")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();

  if (error || !data) return fallbackAppearance;

  return {
    presetKey: data.preset_key,
    primaryColor: data.primary_color,
    accentColor: data.accent_color,
    backgroundColor: data.background_color,
    surfaceColor: data.surface_color,
    inkColor: data.ink_color,
    darkBackgroundColor: data.dark_background_color,
    darkSurfaceColor: data.dark_surface_color,
    darkInkColor: data.dark_ink_color,
    headerStyle: data.header_style,
    heroStyle: data.hero_style,
    cardStyle: data.card_style,
    borderRadius: data.border_radius,
    uiDensity: data.ui_density,
    desktopColumns: data.desktop_columns,
    tabletColumns: data.tablet_columns,
    mobileColumns: data.mobile_columns,
    defaultColorMode: data.default_color_mode,
    fontPreset: data.font_preset,
  } as AppearanceSettings;
});

export function appearanceCssVariables(settings: AppearanceSettings): Record<string, string | number> {
  return {
    "--bg": settings.backgroundColor,
    "--surface": settings.surfaceColor,
    "--ink": settings.inkColor,
    "--brand-primary": settings.primaryColor,
    "--brand-accent": settings.accentColor,
    "--violet": settings.primaryColor,
    "--violet-2": settings.accentColor,
    "--dark-bg": settings.darkBackgroundColor,
    "--dark-surface": settings.darkSurfaceColor,
    "--dark-ink": settings.darkInkColor,
    "--radius": `${settings.borderRadius}px`,
    "--desktop-columns": settings.desktopColumns,
    "--tablet-columns": settings.tabletColumns,
    "--mobile-columns": settings.mobileColumns,
  };
}
