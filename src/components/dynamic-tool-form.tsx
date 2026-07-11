"use client";

import Link from "next/link";
import { useState } from "react";

import type { ToolInputSchema, ToolRunResponse } from "@/domain/types";
import type { UiMessages } from "@/localization/types";
import { translate } from "@/localization/messages";

interface Props {
  slug: string;
  locale: string;
  schema: ToolInputSchema;
  messages: UiMessages;
}

function primaryResult(result: ToolRunResponse | null) {
  if (!result) return "";
  if (result.text) return result.text;
  if (result.data && typeof result.data === "object" && !Array.isArray(result.data) && "result" in result.data) {
    const value = result.data.result;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  }
  return result.title;
}

const runnerCopy: Record<string, {
  input: string;
  run: string;
  result: string;
  start: string;
  help: string;
  waiting: string;
  running: string;
  live: string;
  raw: string;
  zero: string;
  charged: string;
  balance: string;
  loginRequired: string;
  loginAction: string;
  insufficientCredits: string;
  pricingAction: string;
  accessRestricted: string;
  retry: string;
  genericError: string;
  reset: string;
  summary: string;
}> = {
  ar: {
    input: "إدخال",
    run: "تشغيل",
    result: "نتيجة",
    start: "أدخل القيم",
    help: "املأ الحقول المطلوبة ثم اضغط زر التشغيل. النتيجة تظهر في نفس اللوحة.",
    waiting: "جاهز للتشغيل",
    running: "جاري التشغيل…",
    live: "مخرجات مباشرة",
    raw: "عرض التفاصيل التقنية",
    zero: "0 نقطة",
    charged: "تم استخدام",
    balance: "الرصيد بعد التشغيل",
    loginRequired: "يلزم تسجيل الدخول لتشغيل هذه الأداة.",
    loginAction: "تسجيل الدخول",
    insufficientCredits: "الرصيد غير كافٍ لتشغيل هذه الأداة.",
    pricingAction: "عرض الخطط",
    accessRestricted: "الوصول مقيّد لهذه الأداة.",
    retry: "حاول مرة أخرى.",
    genericError: "تعذر تشغيل الأداة.",
    reset: "إعادة إدخال",
    summary: "لوحة تشغيل خفيفة تجمع الإدخال والنتيجة في مكان واحد.",
  },
  en: {
    input: "Input",
    run: "Run",
    result: "Result",
    start: "Enter values",
    help: "Complete the required fields and run the tool. The result appears in the same workspace.",
    waiting: "Ready to run",
    running: "Running…",
    live: "Live output",
    raw: "View technical details",
    zero: "0 credits",
    charged: "Used",
    balance: "Balance after run",
    loginRequired: "Sign in is required to run this tool.",
    loginAction: "Sign in",
    insufficientCredits: "You do not have enough credits to run this tool.",
    pricingAction: "View plans",
    accessRestricted: "Access to this tool is restricted.",
    retry: "Try again.",
    genericError: "Unable to run tool.",
    reset: "Reset",
    summary: "A lightweight workspace that keeps inputs and results in one place.",
  },
};

export function DynamicToolForm({ slug, locale, schema, messages }: Props) {
  const [result, setResult] = useState<ToolRunResponse | null>(null);
  const [error, setError] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const copy = runnerCopy[locale] ?? runnerCopy.en;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setStatusCode(null);
    setResult(null);
    const form = new FormData(event.currentTarget);
    const input = Object.fromEntries(form.entries());

    try {
      const response = await fetch(`/api/tools/${slug}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, locale }),
      });
      const payload = (await response.json()) as ToolRunResponse | { error?: string };
      if (!response.ok) {
        setStatusCode(response.status);
        if (response.status === 401) {
          setError(copy.loginRequired);
        } else if (response.status === 402) {
          setError(copy.insufficientCredits);
        } else if (response.status === 403) {
          setError(copy.accessRestricted);
        } else {
          setError(copy.genericError);
        }
        return;
      }

      setResult(payload as ToolRunResponse);
    } catch {
      setStatusCode(0);
      setError(copy.genericError);
    } finally {
      setPending(false);
    }
  }

  const displayResult = primaryResult(result);

  return (
    <div className="we-tool-station">
      <div className="we-tool-station-top">
        <div>
          <p className="we-simple-kicker">WEB EMPIRE TOOL</p>
          <h2>{copy.start}</h2>
          <span>{copy.summary}</span>
        </div>

        <div className="we-tool-station-steps" aria-label="Tool workflow">
          <span>01 {copy.input}</span>
          <span>02 {copy.run}</span>
          <span>03 {copy.result}</span>
        </div>
      </div>

      <div className="we-tool-station-table">
        <form className="we-tool-single-form" onSubmit={onSubmit}>
          <div className="we-tool-form-head">
            <strong>{copy.input}</strong>
            <small>{copy.help}</small>
          </div>

          <div className="we-tool-fields">
            {schema.fields.map((field) => (
              <label key={field.key} className="we-tool-field">
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.key}
                    required={field.required}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    defaultValue={String(field.defaultValue ?? "")}
                  />
                ) : field.type === "select" ? (
                  <select name={field.key} required={field.required} defaultValue={String(field.defaultValue ?? "")}>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input name={field.key} type="checkbox" value="true" defaultChecked={Boolean(field.defaultValue)} />
                ) : (
                  <input
                    name={field.key}
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    maxLength={field.maxLength}
                    defaultValue={String(field.defaultValue ?? "")}
                  />
                )}
                {field.helpText ? <small>{field.helpText}</small> : null}
              </label>
            ))}
          </div>

          <div className="we-tool-form-actions">
            <button className="we-button-primary" disabled={pending} type="submit">
              {pending ? copy.running : schema.submitLabel}
            </button>
            <button className="we-button-ghost" type="reset">
              {copy.reset}
            </button>
          </div>
        </form>

        <section className="we-tool-result-card" aria-live="polite">
          <div className="we-tool-result-head">
            <small>03 {copy.result}</small>
            <span>{pending ? copy.running : copy.live}</span>
          </div>

          {error ? (
            <div className="we-tool-error" role="alert">
              <p>{error}</p>

              {statusCode === 401 ? (
                <Link href={`/${locale}/auth/login`} className="we-card-link">
                  {copy.loginAction}
                </Link>
              ) : null}

              {statusCode === 402 || statusCode === 403 ? (
                <Link href={`/${locale}/pricing`} className="we-card-link">
                  {copy.pricingAction}
                </Link>
              ) : null}

              {statusCode !== 401 && statusCode !== 402 && statusCode !== 403 ? <p>{copy.retry}</p> : null}
            </div>
          ) : null}

          {!error && !result ? (
            <div className="we-tool-empty-result">
              <img src="/brand/web-empire-mark.svg" alt="" width="74" height="74" />
              <strong>{copy.waiting}</strong>
              <p>{translate(messages, "tool.empty")}</p>
            </div>
          ) : null}

          {result ? (
            <div className="we-tool-result-content">
              <p>{result.title}</p>
              <pre className={displayResult.length > 90 ? "is-long" : ""}>{displayResult}</pre>

              <div className="we-tool-result-cost">
                <span>
                  {copy.charged}: {Number(result.creditsCharged ?? 0) === 0
                    ? copy.zero
                    : `${result.creditsCharged} ${translate(messages, "common.points")}`}
                </span>
                {typeof result.balanceAfter === "number" ? <span>{copy.balance}: {result.balanceAfter}</span> : null}
              </div>

              {result.data ? (
                <details className="we-tool-raw-output">
                  <summary>{copy.raw}</summary>
                  <pre dir="ltr">{JSON.stringify(result.data, null, 2)}</pre>
                </details>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
