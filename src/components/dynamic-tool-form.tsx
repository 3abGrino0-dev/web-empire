"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import type {
  JsonValue,
  PricingMode,
  ToolInputField,
  ToolInputSchema,
  ToolRunResponse,
} from "@/domain/types";
import { evaluateFormula } from "@/engines/formula";
import { translate } from "@/localization/messages";
import type { UiMessages } from "@/localization/types";
import {
  formatLocalizedInput,
  normalizeLocalizedNumber,
} from "@/lib/tool-number";

import styles from "./tools/tool-workbench.module.css";

interface Props {
  slug: string;
  locale: string;
  schema: ToolInputSchema;
  messages: UiMessages;
  toolTitle: string;
  engineType: string;
  runtimeConfig: Record<string, JsonValue>;
  pricingMode: PricingMode;
}

type MobileTab = "input" | "result";

interface SavedResult {
  slug: string;
  title: string;
  createdAt: string;
  result: ToolRunResponse;
}

interface DisplayResult {
  raw: string;
  formatted: string;
  numeric: number | null;
  label: string;
  equation: string;
  warning: string;
  insight: string;
  note: string;
}

const copy = {
  ar: {
    input: "بيانات الإدخال",
    inputKicker: "المدخلات",
    inputHelp: "أدخل القيم المطلوبة ثم شغّل الأداة.",
    result: "النتيجة",
    resultKicker: "المخرجات",
    ready: "جاهز",
    running: "جاري التنفيذ",
    emptyTitle: "النتيجة ستظهر هنا",
    emptyBody: "أدخل البيانات واضغط زر التنفيذ لمشاهدة النتيجة.",
    reset: "مسح البيانات",
    copy: "نسخ النتيجة",
    save: "حفظ النتيجة",
    image: "حفظ كصورة",
    pdf: "حفظ PDF",
    newRun: "حساب جديد",
    charged: "التكلفة",
    balance: "الرصيد",
    duration: "وقت التنفيذ",
    raw: "التفاصيل التقنية",
    copied: "تم نسخ النتيجة.",
    saved: "تم حفظ النتيجة وتنزيل ملف نصي.",
    imageSaved: "تم تنزيل صورة النتيجة.",
    printOpened: "تم فتح نافذة الطباعة. اختر حفظ كملف PDF.",
    actionFailed: "تعذر تنفيذ العملية.",
    loginRequired: "يلزم تسجيل الدخول لتشغيل هذه الأداة.",
    loginAction: "تسجيل الدخول",
    insufficientCredits: "الرصيد غير كافٍ لتشغيل هذه الأداة.",
    pricingAction: "عرض الخطط",
    accessRestricted: "الوصول مقيّد لهذه الأداة.",
    genericError: "تعذر تشغيل الأداة. تحقق من البيانات وحاول مرة أخرى.",
    required: "هذا الحقل مطلوب.",
    invalidNumber: "أدخل رقمًا صحيحًا.",
    belowMin: "القيمة أقل من الحد الأدنى المسموح.",
    aboveMax: "القيمة أعلى من الحد الأعلى المسموح.",
    invalidResult: "تعذر حساب نتيجة صالحة من القيم المدخلة.",
    points: "نقطة",
    free: "0 نقطة",
  },
  en: {
    input: "Input data",
    inputKicker: "INPUT",
    inputHelp: "Enter the required values, then run the tool.",
    result: "Result",
    resultKicker: "OUTPUT",
    ready: "Ready",
    running: "Running",
    emptyTitle: "Your result will appear here",
    emptyBody: "Complete the form and run the tool to see the result.",
    reset: "Clear",
    copy: "Copy result",
    save: "Save result",
    image: "Save image",
    pdf: "Save PDF",
    newRun: "New calculation",
    charged: "Cost",
    balance: "Balance",
    duration: "Duration",
    raw: "Technical details",
    copied: "Result copied.",
    saved: "Result saved and downloaded.",
    imageSaved: "Result image downloaded.",
    printOpened: "Print view opened. Choose Save as PDF.",
    actionFailed: "Unable to complete the action.",
    loginRequired: "Sign in is required to run this tool.",
    loginAction: "Sign in",
    insufficientCredits: "You do not have enough credits to run this tool.",
    pricingAction: "View plans",
    accessRestricted: "Access to this tool is restricted.",
    genericError: "Unable to run the tool. Check your input and try again.",
    required: "This field is required.",
    invalidNumber: "Enter a valid number.",
    belowMin: "The value is below the allowed minimum.",
    aboveMax: "The value is above the allowed maximum.",
    invalidResult: "A valid result could not be calculated from these values.",
    points: "credits",
    free: "0 credits",
  },
};

function configString(
  config: Record<string, JsonValue>,
  key: string,
): string {
  const value = config[key];
  return typeof value === "string" ? value : "";
}

function configNumber(
  config: Record<string, JsonValue>,
  key: string,
): number | null {
  const value = config[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function configBoolean(
  config: Record<string, JsonValue>,
  key: string,
): boolean {
  return config[key] === true;
}

function primaryResult(result: ToolRunResponse | null): string {
  if (!result) return "";
  if (result.text) return result.text;

  if (
    result.data &&
    typeof result.data === "object" &&
    !Array.isArray(result.data) &&
    "result" in result.data
  ) {
    const value = result.data.result;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }
  }

  return result.title;
}

function valueToText(value: JsonValue): string {
  if (value === null) return "—";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  return JSON.stringify(value);
}

function resultEntries(
  result: ToolRunResponse | null,
): Array<[string, string]> {
  if (
    !result?.data ||
    typeof result.data !== "object" ||
    Array.isArray(result.data)
  ) {
    return [];
  }

  return Object.entries(result.data)
    .filter(([key]) => key !== "result")
    .slice(0, 8)
    .map(([key, value]) => [key, valueToText(value)]);
}

function numberLocale(locale: string): string {
  return locale === "ar" ? "ar-SA-u-nu-latn" : "en-US";
}

function formatNumber(
  value: number,
  locale: string,
  decimals: number | null,
): string {
  const safeDecimals =
    decimals === null
      ? Math.abs(value) >= 1
        ? 2
        : Math.min(6, Math.max(2, Math.ceil(-Math.log10(Math.abs(value) || 1)) + 2))
      : Math.max(0, Math.min(8, Math.round(decimals)));

  return new Intl.NumberFormat(numberLocale(locale), {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: safeDecimals,
  }).format(value);
}

function formatDuration(durationMs: number, locale: string): string {
  if (durationMs < 1000) {
    return locale === "ar"
      ? `${durationMs} مللي ثانية`
      : `${durationMs} ms`;
  }

  const seconds = durationMs / 1000;
  const formatted = new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: seconds >= 10 ? 0 : 1,
  }).format(seconds);

  return locale === "ar"
    ? `${formatted} ثانية`
    : `${formatted} sec`;
}

function formatEquation(
  expression: string,
  input: Record<string, unknown>,
  result: string,
  locale: string,
): string {
  if (!expression) return "";

  const substituted = expression.replace(
    /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g,
    (key) => {
      const raw = input[key];
      if (raw === undefined || raw === null || raw === "") return key;
      const numeric = Number(raw);
      return Number.isFinite(numeric)
        ? formatNumber(numeric, locale, 6)
        : String(raw);
    },
  );

  return `${substituted
    .replace(/\*/g, " × ")
    .replace(/\//g, " ÷ ")
    .replace(/\^/g, " ^ ")
    .replace(/\s+/g, " ")
    .trim()} = ${result}`;
}

function validateInput(
  fields: ToolInputField[],
  input: Record<string, unknown>,
  locale: string,
): string {
  const t = locale === "ar" ? copy.ar : copy.en;

  for (const field of fields) {
    const raw = input[field.key];

    if (
      field.required &&
      (raw === undefined || raw === null || String(raw).trim() === "")
    ) {
      return `${field.label}: ${t.required}`;
    }

    if (field.type !== "number" || raw === undefined || raw === null || raw === "") {
      continue;
    }

    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) {
      return `${field.label}: ${t.invalidNumber}`;
    }

    if (typeof field.min === "number" && numeric < field.min) {
      return `${field.label}: ${t.belowMin} (${field.min})`;
    }

    if (typeof field.max === "number" && numeric > field.max) {
      return `${field.label}: ${t.aboveMax} (${field.max})`;
    }
  }

  return "";
}

function createDisplayResult(
  result: ToolRunResponse | null,
  runtimeConfig: Record<string, JsonValue>,
  input: Record<string, unknown>,
  locale: string,
  toolTitle: string,
  engineType: string,
): DisplayResult {
  const raw = primaryResult(result);
  const numeric = Number(raw);
  const isNumeric = Number.isFinite(numeric) && engineType === "formula";
  const decimals = configNumber(runtimeConfig, "decimals");
  const unit = configString(
    runtimeConfig,
    locale === "ar" ? "outputUnitAr" : "outputUnitEn",
  );

  const baseLabel =
    configString(
      runtimeConfig,
      locale === "ar" ? "resultLabelAr" : "resultLabelEn",
    ) ||
    result?.title ||
    toolTitle;

  const negativeLabel = configString(
    runtimeConfig,
    locale === "ar" ? "negativeResultLabelAr" : "negativeResultLabelEn",
  );
  const positiveLabel = configString(
    runtimeConfig,
    locale === "ar" ? "positiveResultLabelAr" : "positiveResultLabelEn",
  );

  const label =
    isNumeric && numeric < 0 && negativeLabel
      ? negativeLabel
      : isNumeric && numeric > 0 && positiveLabel
        ? positiveLabel
        : baseLabel;

  const numberText = isNumeric
    ? formatNumber(numeric, locale, decimals)
    : raw;
  const formatted = isNumeric ? `${numberText}${unit}` : raw;

  const expression = configString(runtimeConfig, "expression");
  const equation =
    isNumeric && configBoolean(runtimeConfig, "showEquation")
      ? formatEquation(expression, input, formatted, locale)
      : "";

  let warning = "";
  if (isNumeric && numeric < 0) {
    warning = configString(
      runtimeConfig,
      locale === "ar" ? "negativeWarningAr" : "negativeWarningEn",
    );
  }

  if (
    !warning &&
    configBoolean(runtimeConfig, "warningWhenPartExceedsTotal")
  ) {
    const part = Number(input.part);
    const total = Number(input.total);
    if (Number.isFinite(part) && Number.isFinite(total) && part > total) {
      warning = configString(
        runtimeConfig,
        locale === "ar"
          ? "partExceedsTotalWarningAr"
          : "partExceedsTotalWarningEn",
      );
    }
  }

  const insightTemplate = configString(
    runtimeConfig,
    locale === "ar" ? "insightTemplateAr" : "insightTemplateEn",
  );
  const insight = insightTemplate
    ? insightTemplate.replace("{result}", numberText)
    : "";

  const note = configString(
    runtimeConfig,
    locale === "ar" ? "noteAr" : "noteEn",
  );

  return {
    raw,
    formatted,
    numeric: isNumeric ? numeric : null,
    label,
    equation,
    warning,
    insight,
    note,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadLogo(): Promise<HTMLImageElement | null> {
  const image = new Image();
  image.src = "/brand/web-empire-logo-horizontal.png";

  try {
    await image.decode();
    return image;
  } catch {
    return null;
  }
}

export function DynamicToolForm({
  slug,
  locale,
  schema,
  messages,
  toolTitle,
  engineType,
  runtimeConfig,
  pricingMode,
}: Props) {
  const isArabic = locale === "ar";
  const t = isArabic ? copy.ar : copy.en;

  const [result, setResult] = useState<ToolRunResponse | null>(null);
  const [error, setError] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("input");
  const [actionMessage, setActionMessage] = useState("");
  const [lastInput, setLastInput] = useState<Record<string, unknown>>({});

  const formRef = useRef<HTMLFormElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const display = useMemo(
    () =>
      createDisplayResult(
        result,
        runtimeConfig,
        lastInput,
        locale,
        toolTitle,
        engineType,
      ),
    [engineType, lastInput, locale, result, runtimeConfig, toolTitle],
  );

  const entries = useMemo(() => resultEntries(result), [result]);
  const isLongResult =
    display.formatted.length > 120 ||
    engineType.startsWith("ai_") ||
    engineType === "text_transform";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    if (!formElement.reportValidity()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPending(true);
    setError("");
    setStatusCode(null);
    setActionMessage("");

    const startedAt = performance.now();
    const form = new FormData(formElement);
    const input: Record<string, unknown> = Object.fromEntries(form.entries());

    for (const field of schema.fields) {
      if (field.type === "number" && typeof input[field.key] === "string") {
        input[field.key] = normalizeLocalizedNumber(String(input[field.key]));
      }

      if (field.type === "checkbox" && !(field.key in input)) {
        input[field.key] = "false";
      }
    }

    const validationError = validateInput(schema.fields, input, locale);
    if (validationError) {
      setError(validationError);
      setPending(false);
      setMobileTab("result");
      return;
    }

    setLastInput(input);

    const expression = configString(runtimeConfig, "expression");

    if (engineType === "formula" && pricingMode === "free" && expression) {
      try {
        const localValue = evaluateFormula(expression, input);
        if (!Number.isFinite(localValue)) throw new Error("INVALID_RESULT");

        const localResult: ToolRunResponse = {
          runId: `local-${Date.now()}`,
          title: toolTitle,
          text: String(localValue),
          data: { result: localValue },
          creditsCharged: 0,
        };

        setResult(localResult);
        setDurationMs(
          Math.max(1, Math.round(performance.now() - startedAt)),
        );
        setMobileTab("result");
        setPending(false);

        void fetch(`/api/tools/${slug}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, locale }),
          signal: controller.signal,
        })
          .then(async (response) => {
            if (!response.ok) return null;
            return (await response.json()) as ToolRunResponse;
          })
          .then((payload) => {
            if (payload && abortRef.current === controller) {
              setResult(payload);
            }
          })
          .catch(() => undefined);

        return;
      } catch (formulaError) {
        const message =
          formulaError instanceof Error ? formulaError.message : "";
        setError(
          message.includes("القسمة على صفر")
            ? message
            : t.invalidResult,
        );
        setPending(false);
        setMobileTab("result");
        return;
      }
    }

    try {
      const response = await fetch(`/api/tools/${slug}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, locale }),
        signal: controller.signal,
      });

      const payload = (await response.json()) as
        | ToolRunResponse
        | { error?: string };

      if (!response.ok) {
        setStatusCode(response.status);

        if (response.status === 401) setError(t.loginRequired);
        else if (response.status === 402) setError(t.insufficientCredits);
        else if (response.status === 403) setError(t.accessRestricted);
        else setError(t.genericError);

        setMobileTab("result");
        return;
      }

      setResult(payload as ToolRunResponse);
      setDurationMs(
        Math.max(1, Math.round(performance.now() - startedAt)),
      );
      setMobileTab("result");
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      ) {
        return;
      }

      setStatusCode(0);
      setError(t.genericError);
      setMobileTab("result");
    } finally {
      if (abortRef.current === controller) setPending(false);
    }
  }

  function resetAll() {
    abortRef.current?.abort();
    formRef.current?.reset();
    setResult(null);
    setError("");
    setStatusCode(null);
    setDurationMs(null);
    setActionMessage("");
    setLastInput({});
    setPending(false);
    setMobileTab("input");
  }

  async function copyResult() {
    try {
      const detailText = entries
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

      await navigator.clipboard.writeText(
        [
          toolTitle,
          display.label,
          display.formatted,
          display.equation,
          display.warning,
          display.insight,
          display.note,
          detailText,
        ]
          .filter(Boolean)
          .join("\n\n"),
      );
      setActionMessage(t.copied);
    } catch {
      setActionMessage(t.actionFailed);
    }
  }

  function saveResult() {
    if (!result) return;

    try {
      const storageKey = "web-empire:saved-tool-results";
      const current = JSON.parse(
        window.localStorage.getItem(storageKey) ?? "[]",
      ) as SavedResult[];

      const next: SavedResult[] = [
        {
          slug,
          title: toolTitle,
          createdAt: new Date().toISOString(),
          result,
        },
        ...current.filter((item) => item.result.runId !== result.runId),
      ].slice(0, 50);

      window.localStorage.setItem(storageKey, JSON.stringify(next));

      const detailText = entries
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

      const exportText = [
        toolTitle,
        display.label,
        display.formatted,
        display.equation,
        display.warning,
        display.insight,
        display.note,
        detailText,
      ]
        .filter(Boolean)
        .join("\n\n");

      const blob = new Blob([exportText], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${slug}-result.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setActionMessage(t.saved);
    } catch {
      setActionMessage(t.actionFailed);
    }
  }

  async function downloadImage() {
    if (!result) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 900;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("CANVAS_UNAVAILABLE");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#d6b56e";
      context.lineWidth = 8;
      context.strokeRect(30, 30, 1140, 840);

      const logo = await loadLogo();
      if (logo) {
        const ratio = logo.naturalWidth / logo.naturalHeight;
        const logoHeight = 84;
        context.drawImage(
          logo,
          (canvas.width - logoHeight * ratio) / 2,
          74,
          logoHeight * ratio,
          logoHeight,
        );
      }

      context.direction = isArabic ? "rtl" : "ltr";
      context.textAlign = "center";
      context.fillStyle = "#667085";
      context.font = "700 30px Arial";
      context.fillText(toolTitle, 600, 245);

      context.fillStyle = "#7138f4";
      context.font =
        display.formatted.length > 18
          ? "900 58px Arial"
          : "900 92px Arial";
      context.fillText(display.formatted.slice(0, 34), 600, 430);

      context.fillStyle = "#10131f";
      context.font = "700 28px Arial";
      context.fillText(display.label, 600, 490);

      context.fillStyle = "#667085";
      context.font = "600 24px Arial";
      if (display.equation) {
        context.fillText(display.equation.slice(0, 72), 600, 590);
      }
      if (display.insight) {
        context.fillText(display.insight.slice(0, 72), 600, 650);
      }

      context.fillStyle = "#10131f";
      context.font = "700 24px Arial";
      context.fillText(
        isArabic
          ? "webempire.site • إمبراطورية الويب"
          : "Web Empire • webempire.site",
        600,
        790,
      );

      const link = document.createElement("a");
      link.download = `${slug}-result.png`;
      link.href = canvas.toDataURL("image/png", 1);
      link.click();
      setActionMessage(t.imageSaved);
    } catch {
      setActionMessage(t.actionFailed);
    }
  }

  function openPdfPrint() {
    if (!result) return;

    const printWindow = window.open("about:blank", "_blank");
    if (!printWindow) {
      setActionMessage(t.actionFailed);
      return;
    }

    try {
      printWindow.opener = null;
    } catch {
      // Some browsers prevent changing opener; printing can continue safely.
    }

    const detailsHtml = entries
      .map(
        ([key, value]) =>
          `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`,
      )
      .join("");

    const generatedAt = new Intl.DateTimeFormat(
      isArabic ? "ar-SA" : "en-US",
      { dateStyle: "long", timeStyle: "short" },
    ).format(new Date());

    printWindow.document.write(`<!doctype html>
<html lang="${escapeHtml(locale)}" dir="${isArabic ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8">
<title>${escapeHtml(toolTitle)}</title>
<style>
@page { size: A4; margin: 16mm; }
* { box-sizing: border-box; }
body { margin: 0; color: #10131f; font-family: Arial, Tahoma, sans-serif; }
.report { min-height: 260mm; border: 2px solid #d6b56e; border-radius: 22px; overflow: hidden; }
header { padding: 22px 28px; border-bottom: 1px solid #e7eaf1; text-align: center; }
header img { width: 230px; max-height: 84px; object-fit: contain; }
main { padding: 30px; }
h1 { margin: 0; font-size: 27px; }
.date { margin-top: 8px; color: #667085; font-size: 12px; }
.result { margin-top: 24px; padding: 26px; border: 1px solid #e7eaf1; border-radius: 18px; background: #fbf9ff; }
.result h2 { margin: 0 0 14px; color: #7138f4; }
.result pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; line-height: 1.9; }
.note { margin-top: 18px; color: #667085; line-height: 1.8; }
table { width: 100%; margin-top: 24px; border-collapse: collapse; }
th, td { padding: 11px 12px; border-bottom: 1px solid #e7eaf1; text-align: start; }
th { width: 34%; color: #667085; }
footer { margin-top: 30px; padding: 18px 28px; color: white; background: #101a38; text-align: center; font-size: 12px; }
footer strong { color: #d6b56e; }
</style>
</head>
<body>
<section class="report">
<header>
<img src="${window.location.origin}/brand/web-empire-logo-horizontal.png" alt="Web Empire">
<h1>${escapeHtml(toolTitle)}</h1>
<div class="date">${escapeHtml(generatedAt)}</div>
</header>
<main>
<div class="result">
<h2>${escapeHtml(display.label)}</h2>
<pre>${escapeHtml(display.formatted)}</pre>
</div>
${display.equation ? `<p class="note">${escapeHtml(display.equation)}</p>` : ""}
${display.warning ? `<p class="note">${escapeHtml(display.warning)}</p>` : ""}
${display.insight ? `<p class="note">${escapeHtml(display.insight)}</p>` : ""}
${display.note ? `<p class="note">${escapeHtml(display.note)}</p>` : ""}
${detailsHtml ? `<table><tbody>${detailsHtml}</tbody></table>` : ""}
</main>
<footer><strong>${isArabic ? "إمبراطورية الويب" : "Web Empire"}</strong> • webempire.site</footer>
</section>
<script>
window.addEventListener("load", () => {
  setTimeout(() => {
    window.focus();
    window.print();
  }, 650);
});
</script>
</body>
</html>`);

    printWindow.document.close();
    setActionMessage(t.printOpened);
  }

  return (
    <div className={styles.station}>
      <div className={styles.mobileTabs}>
        <button
          className={mobileTab === "input" ? styles.activeTab : ""}
          onClick={() => setMobileTab("input")}
          type="button"
        >
          {t.input}
        </button>
        <button
          className={mobileTab === "result" ? styles.activeTab : ""}
          onClick={() => setMobileTab("result")}
          type="button"
        >
          {t.result}
        </button>
      </div>

      <div className={styles.grid}>
        <section
          className={`${styles.inputPanel} ${
            mobileTab !== "input" ? styles.mobileHidden : ""
          }`}
        >
          <div className={styles.panelHead}>
            <div>
              <p>{t.inputKicker}</p>
              <h2>{t.input}</h2>
              <span>{t.inputHelp}</span>
            </div>
            <span className={styles.status}>01</span>
          </div>

          <form className={styles.form} onSubmit={onSubmit} ref={formRef}>
            <div className={styles.fields}>
              {schema.fields.map((field) =>
                field.type === "checkbox" ? (
                  <label className={styles.checkbox} key={field.key}>
                    <input
                      defaultChecked={Boolean(field.defaultValue)}
                      name={field.key}
                      type="checkbox"
                      value="true"
                    />
                    <span>{field.label}</span>
                  </label>
                ) : (
                  <label className={styles.field} key={field.key}>
                    <span>{field.label}</span>

                    {field.type === "textarea" ? (
                      <textarea
                        defaultValue={String(field.defaultValue ?? "")}
                        maxLength={field.maxLength}
                        name={field.key}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    ) : field.type === "select" ? (
                      <select
                        defaultValue={String(field.defaultValue ?? "")}
                        name={field.key}
                        required={field.required}
                      >
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        autoComplete="off"
                        defaultValue={
                          field.type === "number"
                            ? formatLocalizedInput(
                                String(field.defaultValue ?? ""),
                              )
                            : String(field.defaultValue ?? "")
                        }
                        inputMode={
                          field.type === "number" ? "decimal" : undefined
                        }
                        maxLength={
                          field.type === "number"
                            ? undefined
                            : field.maxLength
                        }
                        name={field.key}
                        onBlur={
                          field.type === "number"
                            ? (event) => {
                                event.currentTarget.value =
                                  formatLocalizedInput(
                                    event.currentTarget.value,
                                  );
                              }
                            : undefined
                        }
                        onFocus={
                          field.type === "number"
                            ? (event) => {
                                event.currentTarget.value =
                                  normalizeLocalizedNumber(
                                    event.currentTarget.value,
                                  );
                              }
                            : undefined
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                        type={
                          field.type === "number"
                            ? "text"
                            : field.type
                        }
                      />
                    )}

                    {field.helpText ? (
                      <small className={styles.help}>{field.helpText}</small>
                    ) : null}
                  </label>
                ),
              )}
            </div>

            <div className={styles.formActions}>
              <button
                className={styles.primary}
                disabled={pending}
                type="submit"
              >
                {pending ? t.running : schema.submitLabel}
              </button>
              <button
                className={styles.secondary}
                onClick={resetAll}
                type="button"
              >
                {t.reset}
              </button>
            </div>
          </form>
        </section>

        <section
          className={`${styles.resultPanel} ${
            mobileTab !== "result" ? styles.mobileHidden : ""
          }`}
        >
          <div className={styles.resultPanelInner}>
            <div className={styles.panelHead}>
              <div>
                <p>{t.resultKicker}</p>
                <h2>{t.result}</h2>
                <span>{pending ? t.running : t.ready}</span>
              </div>
              <span className={styles.status}>02</span>
            </div>

            {pending && !result ? (
              <div className={styles.loading} aria-live="polite">
                <span className={styles.loadingIcon}>✦</span>
                <strong>{t.running}</strong>
                <p>{translate(messages, "tool.empty")}</p>
              </div>
            ) : null}

            {error ? (
              <div className={styles.error} role="alert">
                <strong>{error}</strong>
                {statusCode === 401 ? (
                  <Link href={`/${locale}/auth/login`}>
                    {t.loginAction}
                  </Link>
                ) : null}
                {statusCode === 402 || statusCode === 403 ? (
                  <Link href={`/${locale}/pricing`}>
                    {t.pricingAction}
                  </Link>
                ) : null}
              </div>
            ) : null}

            {!pending && !error && !result ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>◇</span>
                <strong>{t.emptyTitle}</strong>
                <p>{t.emptyBody}</p>
              </div>
            ) : null}

            {result ? (
              <div className={styles.result} aria-live="polite">
                <div className={styles.resultHero}>
                  <small>{display.label}</small>
                  <pre
                    className={[
                      isLongResult ? styles.long : "",
                      display.formatted.length > 18
                        ? styles.compactNumber
                        : display.formatted.length > 12
                          ? styles.mediumNumber
                          : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {display.formatted}
                  </pre>
                  {display.equation ? (
                    <p className={styles.equation}>
                      {display.equation}
                    </p>
                  ) : null}
                  {display.insight ? (
                    <p className={styles.equation}>
                      {display.insight}
                    </p>
                  ) : null}
                </div>

                {display.warning ? (
                  <div className={styles.warning} role="status">
                    {display.warning}
                  </div>
                ) : null}

                {display.note ? (
                  <div className={styles.warning} role="note">
                    {display.note}
                  </div>
                ) : null}

                {entries.length ? (
                  <div className={styles.details}>
                    {entries.map(([key, value]) => (
                      <div className={styles.detailItem} key={key}>
                        <span>{key}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className={styles.meta}>
                  <span>
                    {t.charged}:{" "}
                    {Number(result.creditsCharged ?? 0) === 0
                      ? t.free
                      : `${result.creditsCharged} ${t.points}`}
                  </span>

                  {typeof result.balanceAfter === "number" ? (
                    <span>
                      {t.balance}: {result.balanceAfter}
                    </span>
                  ) : null}

                  {durationMs !== null ? (
                    <span>
                      {t.duration}:{" "}
                      {formatDuration(durationMs, locale)}
                    </span>
                  ) : null}
                </div>

                <div className={styles.resultActions}>
                  <button onClick={copyResult} type="button">
                    {t.copy}
                  </button>
                  <button onClick={saveResult} type="button">
                    {t.save}
                  </button>
                  {isLongResult ? (
                    <button onClick={openPdfPrint} type="button">
                      {t.pdf}
                    </button>
                  ) : (
                    <button onClick={downloadImage} type="button">
                      {t.image}
                    </button>
                  )}
                  <button onClick={resetAll} type="button">
                    {t.newRun}
                  </button>
                </div>

                <p className={styles.actionMessage}>
                  {actionMessage}
                </p>

                {result.data ? (
                  <details className={styles.raw}>
                    <summary>{t.raw}</summary>
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  </details>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
