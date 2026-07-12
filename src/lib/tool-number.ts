const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function normalizeLocalizedNumber(value: string): string {
  return value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٬,\s]/g, "")
    .replace(/[٫،]/g, ".");
}

export function parseLocalizedNumber(value: string): number {
  const parsed = Number(normalizeLocalizedNumber(value));
  if (!Number.isFinite(parsed)) {
    throw new Error("INVALID_NUMBER");
  }
  return parsed;
}

export function formatLocalizedInput(value: string): string {
  const normalized = normalizeLocalizedNumber(value);
  if (!normalized || normalized === "-" || normalized === ".") {
    return value;
  }

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) return value;

  const fractionDigits = normalized.includes(".")
    ? normalized.split(".")[1]?.length ?? 0
    : 0;

  return new Intl.NumberFormat("en-US", {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.min(fractionDigits, 8),
  }).format(numeric);
}
