"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import type { JsonValue, PricingMode, ToolInputSchema, ToolRunResponse } from "@/domain/types";
import type { UiMessages } from "@/localization/types";
import { evaluateFormula } from "@/engines/formula";
import { translate } from "@/localization/messages";

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

const percentageSlugs = new Set([
  "percentage-calculator",
  "profit-margin-calculator",
  "markup-calculator",
  "roi-calculator",
  "ctr-calculator",
  "conversion-rate-calculator",
  "salary-increase-calculator",
  "weighted-score-calculator",
]);

const currencySlugs = new Set([
  "gross-profit-calculator",
  "commission-calculator",
  "unit-price-calculator",
  "discount-calculator",
  "cpc-calculator",
  "cpm-calculator",
  "cpa-calculator",
  "aov-calculator",
  "customer-acquisition-cost-calculator",
  "vat-calculator",
  "pre-tax-price-calculator",
  "simple-interest-calculator",
  "compound-interest-calculator",
  "tip-calculator",
]);

function formatSmartNumber(value: number): string {
  const absolute = Math.abs(value);
  const decimals =
    absolute === 0
      ? 0
      : absolute >= 1
        ? 2
        : absolute >= 0.01
          ? 3
          : Math.min(6, Math.max(3, Math.ceil(-Math.log10(absolute)) + 2));

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

function outputUnit(slug: string, locale: string): string {
  if (percentageSlugs.has(slug)) return "%";
  if (currencySlugs.has(slug)) return locale === "ar" ? " ر.س" : " SAR";
  if (slug === "roas-calculator") return "×";
  if (slug === "break-even-calculator") {
    return locale === "ar" ? " وحدة" : " units";
  }
  return "";
}

function outputLabel(slug: string, locale: string, fallback: string): string {
  const labels: Record<string, [string, string]> = {
    "percentage-calculator": ["النسبة المئوية", "Percentage"],
    "profit-margin-calculator": ["هامش الربح", "Profit margin"],
    "markup-calculator": ["نسبة الزيادة", "Markup"],
    "roi-calculator": ["العائد على الاستثمار", "ROI"],
    "ctr-calculator": ["معدل النقر", "CTR"],
    "conversion-rate-calculator": ["معدل التحويل", "Conversion rate"],
    "gross-profit-calculator": ["الربح الإجمالي", "Gross profit"],
    "break-even-calculator": ["نقطة التعادل", "Break-even point"],
    "roas-calculator": ["العائد الإعلاني", "ROAS"],
    "vat-calculator": ["قيمة الضريبة", "VAT amount"],
  };
  const value = labels[slug];
  if (!value) return fallback;
  return locale === "ar" ? value[0] : value[1];
}

function formatToolResult(
  slug: string,
  locale: string,
  raw: string,
): { formatted: string; numeric: number | null } {
  const numeric = Number(raw);
  const valid = Number.isFinite(numeric);

  return {
    formatted: valid
      ? `${formatSmartNumber(numeric)}${outputUnit(slug, locale)}`
      : raw,
    numeric: valid ? numeric : null,
  };
}

function percentageEquation(
  input: Record<string, unknown>,
  formatted: string,
): string {
  const values = Object.values(input)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (values.length < 2) return "";
  return `${formatSmartNumber(values[0])} ÷ ${formatSmartNumber(values[1])} × 100 = ${formatted}`;
}

function fieldLabel(
  slug: string,
  locale: string,
  index: number,
  fallback: string,
): string {
  if (slug !== "percentage-calculator") return fallback;
  if (index === 0) return locale === "ar" ? "الجزء" : "Part";
  if (index === 1) return locale === "ar" ? "الإجمالي" : "Total";
  return fallback;
}


interface SavedResult {
  slug: string;
  title: string;
  createdAt: string;
  result: ToolRunResponse;
}

const copy = {
  ar: {
    input: "بيانات الإدخال",
    inputKicker: "المدخلات",
    inputHelp: "أدخل القيم المطلوبة ثم شغّل الأداة.",
    result: "النتيجة",
    resultKicker: "المخرجات",
    ready: "جاهز",
    running: "جاري الحساب",
    emptyTitle: "النتيجة ستظهر هنا",
    emptyBody: "أدخل البيانات واضغط «احسب الآن» لمشاهدة النتيجة والتفاصيل.",
    reset: "مسح البيانات",
    copy: "نسخ النتيجة",
    save: "حفظ النتيجة",
    image: "حفظ كصورة",
    pdf: "حفظ PDF",
    newRun: "حساب جديد",
    details: "تفاصيل النتيجة",
    charged: "التكلفة",
    balance: "الرصيد",
    duration: "وقت التنفيذ",
    raw: "التفاصيل التقنية",
    copied: "تم نسخ النتيجة.",
    saved: "تم حفظ النتيجة محليًا.",
    imageSaved: "تم تنزيل صورة النتيجة.",
    printOpened: "تم فتح نموذج PDF للطباعة والحفظ.",
    actionFailed: "تعذر تنفيذ العملية.",
    loginRequired: "يلزم تسجيل الدخول لتشغيل هذه الأداة.",
    loginAction: "تسجيل الدخول",
    insufficientCredits: "الرصيد غير كافٍ لتشغيل هذه الأداة.",
    pricingAction: "عرض الخطط",
    accessRestricted: "الوصول مقيّد لهذه الأداة.",
    genericError: "تعذر تشغيل الأداة. تحقق من البيانات وحاول مرة أخرى.",
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
    emptyBody: "Complete the form and run the tool to see the result and details.",
    reset: "Clear",
    copy: "Copy result",
    save: "Save result",
    image: "Save image",
    pdf: "Save PDF",
    newRun: "New calculation",
    details: "Result details",
    charged: "Cost",
    balance: "Balance",
    duration: "Duration",
    raw: "Technical details",
    copied: "Result copied.",
    saved: "Result saved locally.",
    imageSaved: "Result image downloaded.",
    printOpened: "PDF print view opened.",
    actionFailed: "Unable to complete the action.",
    loginRequired: "Sign in is required to run this tool.",
    loginAction: "Sign in",
    insufficientCredits: "You do not have enough credits to run this tool.",
    pricingAction: "View plans",
    accessRestricted: "Access to this tool is restricted.",
    genericError: "Unable to run the tool. Check your input and try again.",
    points: "credits",
    free: "0 credits",
  },
};

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

function normalizeDigits(value: string): string {
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  const persian = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .replace(/[٠-٩]/g, (digit) => String(arabic.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persian.indexOf(digit)))
    .replace(/،/g, ".")
    .replace(/,/g, ".");
}

function valueToText(value: JsonValue): string {
  if (value === null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function resultEntries(result: ToolRunResponse | null): Array<[string, string]> {
  if (!result?.data || typeof result.data !== "object" || Array.isArray(result.data)) {
    return [];
  }

  return Object.entries(result.data)
    .filter(([key]) => key !== "result")
    .slice(0, 8)
    .map(([key, value]) => [key, valueToText(value)]);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
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

  const displayResult = primaryResult(result);
  const entries = useMemo(() => resultEntries(result), [result]);
  const formattedResult = useMemo(
    () => formatToolResult(slug, locale, displayResult),
    [displayResult, locale, slug],
  );
  const resultLabel = outputLabel(
    slug,
    locale,
    result?.title ?? toolTitle,
  );
  const equation =
    slug === "percentage-calculator"
      ? percentageEquation(lastInput, formattedResult.formatted)
      : "";
  const inputValues = Object.values(lastInput)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  const warning =
    slug === "percentage-calculator" &&
    inputValues.length >= 2 &&
    inputValues[0] > inputValues[1]
      ? locale === "ar"
        ? "الجزء أكبر من الإجمالي، لذلك النتيجة تتجاوز 100%."
        : "The part is greater than the total, so the result exceeds 100%."
      : "";
  const isLongResult =
    formattedResult.formatted.length > 120 ||
    engineType.startsWith("ai_") ||
    engineType === "text_transform";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
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
    const input = Object.fromEntries(form.entries());

    for (const field of schema.fields) {
      if (field.type === "number" && typeof input[field.key] === "string") {
        input[field.key] = normalizeDigits(String(input[field.key]));
      }

      if (field.type === "checkbox" && !(field.key in input)) {
        input[field.key] = "false";
      }
    }

    setLastInput(input);

    const expression =
      typeof runtimeConfig.expression === "string"
        ? runtimeConfig.expression
        : "";

    if (engineType === "formula" && pricingMode === "free" && expression) {
      try {
        const localValue = evaluateFormula(expression, input);
        const localDuration = Math.max(
          1,
          Math.round(performance.now() - startedAt),
        );

        const previewResult: ToolRunResponse = {
          runId: `local-${Date.now()}`,
          title: toolTitle,
          text: String(localValue),
          data: { result: localValue },
          creditsCharged: 0,
        };

        setResult(previewResult);
        setDurationMs(localDuration);
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
      } catch {
        // Continue through the server path for authoritative validation.
      }
    }

    try {
      const response = await fetch(`/api/tools/${slug}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, locale }),
        signal: controller.signal,
      });

      const payload = (await response.json()) as ToolRunResponse | { error?: string };

      if (!response.ok) {
        setStatusCode(response.status);

        if (response.status === 401) {
          setError(t.loginRequired);
        } else if (response.status === 402) {
          setError(t.insufficientCredits);
        } else if (response.status === 403) {
          setError(t.accessRestricted);
        } else {
          setError(t.genericError);
        }

        setMobileTab("result");
        return;
      }

      setResult(payload as ToolRunResponse);
      setDurationMs(Math.max(1, Math.round(performance.now() - startedAt)));
      setMobileTab("result");
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }

      setStatusCode(0);
      setError(t.genericError);
      setMobileTab("result");
    } finally {
      if (abortRef.current === controller) {
        setPending(false);
      }
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
        [toolTitle, formattedResult.formatted, equation, warning, detailText].filter(Boolean).join("\n\n"),
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
      canvas.height = 1200;
      const context = canvas.getContext("2d");

      if (!context) throw new Error("CANVAS_UNAVAILABLE");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.strokeStyle = "#d6b56e";
      context.lineWidth = 8;
      roundedRect(context, 34, 34, 1132, 1132, 48);
      context.stroke();

      const logo = await loadLogo();
      if (logo) {
        const ratio = logo.naturalWidth / logo.naturalHeight;
        const logoHeight = 92;
        const logoWidth = logoHeight * ratio;
        context.drawImage(
          logo,
          (canvas.width - logoWidth) / 2,
          88,
          logoWidth,
          logoHeight,
        );
      } else {
        context.fillStyle = "#10131f";
        context.textAlign = "center";
        context.font = "800 42px Arial";
        context.fillText("WEB EMPIRE", 600, 145);
      }

      context.direction = isArabic ? "rtl" : "ltr";
      context.textAlign = "center";

      context.fillStyle = "#667085";
      context.font = "700 32px Arial";
      context.fillText(toolTitle, 600, 270);

      context.fillStyle = "#7138f4";
      context.font = "900 112px Arial";
      context.fillText(formattedResult.formatted.slice(0, 22), 600, 520);

      context.fillStyle = "#10131f";
      context.font = "700 30px Arial";
      context.fillText(resultLabel, 600, 590);

      context.fillStyle = "#f7f4ff";
      roundedRect(context, 150, 680, 900, 220, 32);
      context.fill();

      context.fillStyle = "#667085";
      context.font = "600 28px Arial";

      const summary = entries.slice(0, 3);
      if (summary.length) {
        summary.forEach(([key, value], index) => {
          context.fillText(`${key}: ${value}`.slice(0, 52), 600, 742 + index * 54);
        });
      } else {
        context.fillText(
          isArabic ? "نتيجة تم إنشاؤها بواسطة إمبراطورية الويب" : "Generated by Web Empire",
          600,
          790,
        );
      }

      context.fillStyle = "#10131f";
      context.font = "700 25px Arial";
      context.fillText(
        isArabic ? "webempire.site • إمبراطورية الويب" : "Web Empire • webempire.site",
        600,
        1050,
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

    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      setActionMessage(t.actionFailed);
      return;
    }

    const detailsHtml = entries
      .map(
        ([key, value]) =>
          `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`,
      )
      .join("");

    const direction = isArabic ? "rtl" : "ltr";
    const generatedAt = new Intl.DateTimeFormat(
      isArabic ? "ar-SA" : "en-US",
      {
        dateStyle: "long",
        timeStyle: "short",
      },
    ).format(new Date());

    printWindow.document.write(`<!doctype html>
<html lang="${escapeHtml(locale)}" dir="${direction}">
<head>
<meta charset="utf-8">
<title>${escapeHtml(toolTitle)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    color: #10131f;
    background: #fff;
    font-family: Arial, "Tahoma", sans-serif;
  }
  .report {
    min-height: 260mm;
    display: flex;
    flex-direction: column;
    border: 2px solid #d6b56e;
    border-radius: 22px;
    overflow: hidden;
  }
  header {
    padding: 22px 28px;
    border-bottom: 1px solid #e7eaf1;
    text-align: center;
  }
  header img { width: 230px; max-height: 84px; object-fit: contain; }
  main { flex: 1; padding: 30px; }
  h1 { margin: 0; font-size: 27px; }
  .date { margin-top: 8px; color: #667085; font-size: 12px; }
  .result {
    margin-top: 24px;
    padding: 26px;
    border: 1px solid #e7eaf1;
    border-radius: 18px;
    background: #fbf9ff;
  }
  .result h2 { margin: 0 0 14px; color: #7138f4; }
  .result pre {
    margin: 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font: inherit;
    line-height: 1.9;
  }
  table { width: 100%; margin-top: 24px; border-collapse: collapse; }
  th, td { padding: 11px 12px; border-bottom: 1px solid #e7eaf1; text-align: start; }
  th { width: 34%; color: #667085; }
  footer {
    padding: 18px 28px;
    color: white;
    background: #101a38;
    text-align: center;
    font-size: 12px;
  }
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
        <h2>${escapeHtml(resultLabel)}</h2>
        <pre>${escapeHtml(formattedResult.formatted)}</pre>
      </div>
      ${detailsHtml ? `<table><tbody>${detailsHtml}</tbody></table>` : ""}
    </main>
    <footer>
      <strong>${isArabic ? "إمبراطورية الويب" : "Web Empire"}</strong>
      &nbsp; • &nbsp; webempire.site
      &nbsp; • &nbsp; ${isArabic ? "جميع الحقوق محفوظة" : "All rights reserved"}
    </footer>
  </section>
  <script>
    window.addEventListener("load", () => {
      setTimeout(() => window.print(), 450);
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
              {schema.fields.map((field, fieldIndex) =>
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
                    <span>
                      {fieldLabel(
                        slug,
                        locale,
                        fieldIndex,
                        field.label,
                      )}
                    </span>

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
                        defaultValue={String(field.defaultValue ?? "")}
                        inputMode={field.type === "number" ? "decimal" : undefined}
                        max={field.max}
                        maxLength={field.type === "number" ? undefined : field.maxLength}
                        min={field.min}
                        name={field.key}
                        placeholder={field.placeholder}
                        required={field.required}
                        step={field.step}
                        type={field.type}
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
              <button className={styles.primary} disabled={pending} type="submit">
                {pending ? t.running : schema.submitLabel}
              </button>
              <button className={styles.secondary} onClick={resetAll} type="button">
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
                  <Link href={`/${locale}/auth/login`}>{t.loginAction}</Link>
                ) : null}

                {statusCode === 402 || statusCode === 403 ? (
                  <Link href={`/${locale}/pricing`}>{t.pricingAction}</Link>
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
                  <small>{resultLabel}</small>
                  <pre className={isLongResult ? styles.long : ""}>
                    {formattedResult.formatted}
                  </pre>
                  {equation ? (
                    <p className={styles.equation}>{equation}</p>
                  ) : null}
                </div>

                {warning ? (
                  <div className={styles.warning} role="status">
                    {warning}
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
                      {t.duration}: {durationMs}ms
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

                <p className={styles.actionMessage}>{actionMessage}</p>

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
