export type HeaderStyle = "classic" | "centered" | "dashboard" | "floating";
export type HeroStyle = "statement" | "ai_search" | "dashboard_preview" | "categories" | "tool_discovery";
export type CardStyle = "flat" | "soft" | "floating" | "glass" | "outlined";
export type UiDensity = "compact" | "comfortable" | "spacious";
export type ColorMode = "light" | "dark" | "system";
export type FontPreset = "modern" | "professional" | "bold" | "editorial" | "compact";

export interface AppearanceSettings {
  presetKey: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  inkColor: string;
  darkBackgroundColor: string;
  darkSurfaceColor: string;
  darkInkColor: string;
  headerStyle: HeaderStyle;
  heroStyle: HeroStyle;
  cardStyle: CardStyle;
  borderRadius: number;
  uiDensity: UiDensity;
  desktopColumns: number;
  tabletColumns: number;
  mobileColumns: number;
  defaultColorMode: ColorMode;
  fontPreset: FontPreset;
}
