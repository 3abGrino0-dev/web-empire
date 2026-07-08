"use client";

import Link from "next/link";
import { useState } from "react";

import type { ToolInputSchema, ToolRunResponse } from "@/domain/types";
import type { UiMessages } from "@/localization/types";
import { translate } from "@/localization/messages";

interface Props { slug: string; locale: string; schema: ToolInputSchema; messages: UiMessages; }

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
}> = {
  ar: {
    input: "إدخال",
    run: "تشغيل",
    result: "نتيجة",
    start: "ابدأ بالمدخلات.",
    help: "املأ الحقول المطلوبة ثم شغّل الأداة.",
    waiting: "جاهز للتشغيل",
    running: "جاري التشغيل…",
    live: "مخرجات مباشرة",
    raw: "عرض البيانات الخام",
    zero: "0 نقطة",
    charged: "النقاط المخصومة",
    balance: "الرصيد بعد التشغيل",
    loginRequired: "يلزم تسجيل الدخول لتشغيل هذه الأداة.",
    loginAction: "تسجيل الدخول",
    insufficientCredits: "الرصيد غير كافٍ لتشغيل هذه الأداة.",
    pricingAction: "عرض الخطط",
    accessRestricted: "الوصول مقيّد لهذه الأداة.",
    retry: "حاول مرة أخرى.",
    genericError: "تعذر تشغيل الأداة.",
  },
  en: {
    input: "Input",
    run: "Run",
    result: "Result",
    start: "Start with the input.",
    help: "Complete the required fields and run the tool.",
    waiting: "Ready to run",
    running: "Running…",
    live: "Live output",
    raw: "View raw data",
    zero: "0 credits",
    charged: "Credits charged",
    balance: "Balance after run",
    loginRequired: "Sign in is required to run this tool.",
    loginAction: "Sign in",
    insufficientCredits: "You do not have enough credits to run this tool.",
    pricingAction: "View plans",
    accessRestricted: "Access to this tool is restricted.",
    retry: "Try again.",
    genericError: "Unable to run tool.",
  },
  fr: {
    input: "Entree",
    run: "Execution",
    result: "Resultat",
    start: "Commencez par l'entree.",
    help: "Remplissez les champs requis puis lancez l'outil.",
    waiting: "Pret a executer",
    running: "Execution…",
    live: "Sortie directe",
    raw: "Voir les donnees brutes",
    zero: "0 credit",
    charged: "Credits debites",
    balance: "Solde apres execution",
    loginRequired: "La connexion est requise pour executer cet outil.",
    loginAction: "Se connecter",
    insufficientCredits: "Votre solde est insuffisant pour cet outil.",
    pricingAction: "Voir les offres",
    accessRestricted: "L'acces a cet outil est restreint.",
    retry: "Reessayez.",
    genericError: "Impossible d'executer l'outil.",
  },
  tr: {
    input: "Girdi",
    run: "Calistir",
    result: "Sonuc",
    start: "Girdi ile basla.",
    help: "Gerekli alanlari doldurup araci calistirin.",
    waiting: "Calismaya hazir",
    running: "Calisiyor…",
    live: "Canli cikti",
    raw: "Ham veriyi gor",
    zero: "0 kredi",
    charged: "Kullanilan kredi",
    balance: "Islem sonrasi bakiye",
    loginRequired: "Bu araci calistirmak icin giris gerekli.",
    loginAction: "Giris yap",
    insufficientCredits: "Bu araci calistirmak icin kredi yetersiz.",
    pricingAction: "Planlari gor",
    accessRestricted: "Bu araca erisim kisitli.",
    retry: "Tekrar deneyin.",
    genericError: "Arac calistirilamadi.",
  },
  ur: {
    input: "ان پٹ",
    run: "رن",
    result: "نتیجہ",
    start: "ان پٹ سے شروع کریں۔",
    help: "ضروری خانے مکمل کریں اور ٹول چلائیں۔",
    waiting: "چلانے کے لیے تیار",
    running: "چل رہا ہے…",
    live: "براہ راست آؤٹ پٹ",
    raw: "خام ڈیٹا دیکھیں",
    zero: "0 کریڈٹ",
    charged: "کٹے ہوئے کریڈٹس",
    balance: "رن کے بعد بیلنس",
    loginRequired: "اس ٹول کو چلانے کے لیے لاگ اِن ضروری ہے۔",
    loginAction: "لاگ اِن",
    insufficientCredits: "اس ٹول کے لیے کریڈٹس ناکافی ہیں۔",
    pricingAction: "پلان دیکھیں",
    accessRestricted: "اس ٹول تک رسائی محدود ہے۔",
    retry: "دوبارہ کوشش کریں۔",
    genericError: "ٹول چلایا نہیں جا سکا۔",
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
    <div className="runner-grid editorial-runner empire-workspace">
      <form className="panel tool-form empire-workspace-input" onSubmit={onSubmit}>
        <div className="editorial-runner-head empire-workspace-head">
          <small>01 {copy.input}</small>
          <h2>{copy.start}</h2>
          <p>{copy.help}</p>
        </div>

        {schema.fields.map((field) => (
          <label key={field.key} className="field empire-workspace-field">
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

        <button className="button button-primary empire-workspace-submit" disabled={pending} type="submit">
          {pending ? copy.running : schema.submitLabel}
        </button>
      </form>

      <div className="empire-workspace-bridge" aria-hidden="true">
        <span>02</span>
        <b>{copy.run}</b>
        <i>{pending ? "..." : "->"}</i>
      </div>

      <section className="panel result-panel empire-workspace-result" aria-live="polite">
        <div className="editorial-result-head empire-result-head">
          <small>03 {copy.result}</small>
          <span className="editorial-result-live">{pending ? copy.running : copy.live}</span>
        </div>

        {error ? (
          <div className="error-box empire-result-error" role="alert">
            <p>{error}</p>
            {statusCode === 401 ? (
              <>
                <p>{copy.loginRequired}</p>
                <Link href={`/${locale}/auth/login`} className="empire-result-error-link">
                  {copy.loginAction}
                </Link>
              </>
            ) : null}
            {statusCode === 402 ? (
              <>
                <p>{copy.insufficientCredits}</p>
                <Link href={`/${locale}/pricing`} className="empire-result-error-link">
                  {copy.pricingAction}
                </Link>
              </>
            ) : null}
            {statusCode === 403 ? (
              <>
                <p>{copy.accessRestricted}</p>
                <Link href={`/${locale}/pricing`} className="empire-result-error-link">
                  {copy.pricingAction}
                </Link>
              </>
            ) : null}
            {statusCode !== 401 && statusCode !== 402 && statusCode !== 403 ? <p>{copy.retry}</p> : null}
          </div>
        ) : null}

        {!error && !result ? (
          <div className="empty-result empire-result-empty">
            <span aria-hidden="true">03</span>
            <strong>{copy.waiting}</strong>
            <p>{translate(messages, "tool.empty")}</p>
          </div>
        ) : null}

        {result ? (
          <div className="editorial-result-content">
            <p className="editorial-result-title">{result.title}</p>

            <pre className={`editorial-primary-result ${displayResult.length > 90 ? "is-long" : ""}`}>{displayResult}</pre>

            {result.data ? (
              <details className="editorial-raw-output empire-raw-output">
                <summary>{copy.raw}</summary>
                <pre dir="ltr">{JSON.stringify(result.data, null, 2)}</pre>
              </details>
            ) : null}

            <div className="result-cost empire-result-cost">
              <span>
                {copy.charged}: {Number(result.creditsCharged ?? 0) === 0
                  ? copy.zero
                  : `${result.creditsCharged} ${translate(messages, "common.points")}`}
              </span>
              {typeof result.balanceAfter === "number" ? <span>{copy.balance}: {result.balanceAfter}</span> : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
