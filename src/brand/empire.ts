export const EMPIRE_BRAND = {
  name: {
    ar: "إمبراطورية الويب",
    en: "WEB EMPIRE",
  },
  tagline: {
    ar: "أدواتك. ذكاؤك. إمبراطوريتك.",
    en: "Your tools. Your intelligence. Your empire.",
  },
  concept: "DIGITAL COMMAND SYSTEM",
  visualLanguage: "IMPERIAL GRID",
  colors: {
    empireBlack: "#050713",
    imperialViolet: "#7138F4",
    crownGold: "#D6B56E",
    signalCyan: "#23C7E8",
    empireIvory: "#F4F1E8",
    darkSurface: "#0B1022",
    lightSurface: "#FFFCF4",
    darkInk: "#F7F5EF",
    lightInk: "#10131F",
    success: "#0D9488",
    danger: "#DC2626",
  },
  motion: {
    fast: 160,
    standard: 220,
    deliberate: 320,
  },
  geometry: {
    toolGlyph: 48,
    iconGrid: 24,
    iconStroke: 1.75,
  },
  platforms: {
    web: "EMPIRE COMMAND",
    android: "EMPIRE MATERIAL",
    ios: "EMPIRE GLASS",
  },
} as const;

export type EmpireBrand = typeof EMPIRE_BRAND;
