import "server-only";

import { cache } from "react";

import type { AppearanceSettings } from "@/appearance/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const fallbackAppearance: AppearanceSettings = {
  presetKey: "dark_premium",
  primaryColor: "#7138F4",
  accentColor: "#23C7E8",
  backgroundColor: "#F4F1E8",
  surfaceColor: "#FFFCF4",
  inkColor: "#10131F",
  darkBackgroundColor: "#050713",
  darkSurfaceColor: "#0B1022",
  darkInkColor: "#F7F5EF",
  headerStyle: "floating",
  heroStyle: "ai_search",
  cardStyle: "soft",
  borderRadius: 24,
  uiDensity: "comfortable",
  desktopColumns: 3,
  tabletColumns: 2,
  mobileColumns: 1,
  defaultColorMode: "dark",
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
