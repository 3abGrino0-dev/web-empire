const SUPPORTED_LOCALES = new Set(["ar", "en", "fr", "tr", "ur"]);
const AUTH_PROVIDERS = new Set(["google", "azure", "facebook"]);

export type SupportedLocale = "ar" | "en" | "fr" | "tr" | "ur";
export type AuthProvider = "google" | "azure" | "facebook";

export function normalizeLocale(input: FormDataEntryValue | string | null | undefined): SupportedLocale {
  const locale = String(input ?? "en").toLowerCase();
  return SUPPORTED_LOCALES.has(locale) ? (locale as SupportedLocale) : "en";
}

export function isAuthProvider(input: FormDataEntryValue | string | null | undefined): input is AuthProvider {
  const provider = String(input ?? "").toLowerCase();
  return AUTH_PROVIDERS.has(provider);
}

function isSafeRelativePath(value: string): boolean {
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;

  const lower = value.toLowerCase();
  if (lower.includes("://")) return false;
  if (lower.startsWith("javascript:")) return false;
  if (lower.includes("\\")) return false;
  if (/[\r\n\t]/.test(value)) return false;

  return true;
}

export function resolveSafeNext(locale: SupportedLocale, input: FormDataEntryValue | string | null | undefined): string {
  const fallback = `/${locale}/dashboard`;
  const raw = String(input ?? "").trim();

  if (!raw) return fallback;
  if (!isSafeRelativePath(raw)) return fallback;

  return raw;
}

export function buildAuthErrorPath(locale: SupportedLocale, errorCode: string): string {
  const safeCode = normalizeAuthErrorCode(errorCode);
  return `/${locale}/auth/login?error=${encodeURIComponent(safeCode)}`;
}

export function normalizeAuthErrorCode(input: FormDataEntryValue | string | null | undefined): string {
  const value = String(input ?? "").trim().toLowerCase();

  switch (value) {
    case "invalid_credentials":
    case "email_not_confirmed":
    case "signup_failed":
    case "invalid_signup_input":
    case "password_mismatch":
    case "invalid_provider":
    case "oauth_unavailable":
    case "oauth_callback_failed":
    case "reset_failed":
    case "recovery_failed":
    case "auth_failed":
      return value;
    default:
      return "auth_failed";
  }
}

export function resolveRequestOrigin(rawHeaders: Headers, fallbackSiteUrl: string): string {
  const forwardedHost = rawHeaders.get("x-forwarded-host") ?? rawHeaders.get("host");
  const forwardedProto = rawHeaders.get("x-forwarded-proto");

  if (forwardedHost) {
    const proto = forwardedProto ?? (forwardedHost.includes("localhost") ? "http" : "https");
    return `${proto}://${forwardedHost}`;
  }

  const origin = rawHeaders.get("origin");
  if (origin && /^https?:\/\//i.test(origin)) {
    return origin.replace(/\/$/, "");
  }

  return fallbackSiteUrl.replace(/\/$/, "");
}
