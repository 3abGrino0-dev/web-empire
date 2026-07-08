"use client";

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

const runnerCopy: Record<string, { input: string; start: string; help: string; running: string; live: string; raw: string; zero: string }> = {
  ar: { input: "المدخلات", start: "ابدأ بالمعلومة.", help: "املأ الحقول المطلوبة ثم شغّل الأداة.", running: "جاري التشغيل…", live: "ناتج مباشر", raw: "عرض البيانات الخام", zero: "0 نقطة" },
  en: { input: "INPUT", start: "Start with the input.", help: "Complete the required fields and run the tool.", running: "Running…", live: "Live output", raw: "View raw data", zero: "0 credits" },
  fr: { input: "ENTRÉE", start: "Commencez par l’entrée.", help: "Remplissez les champs puis lancez l’outil.", running: "Exécution…", live: "Résultat direct", raw: "Voir les données brutes", zero: "0 crédit" },
  tr: { input: "GİRDİ", start: "Girdiyle başla.", help: "Gerekli alanları doldur ve aracı çalıştır.", running: "Çalışıyor…", live: "Canlı çıktı", raw: "Ham veriyi gör", zero: "0 kredi" },
  ur: { input: "ان پٹ", start: "ان پٹ سے شروع کریں۔", help: "ضروری خانے مکمل کریں اور ٹول چلائیں۔", running: "چل رہا ہے…", live: "براہ راست نتیجہ", raw: "خام ڈیٹا دیکھیں", zero: "0 کریڈٹ" },
};

export function DynamicToolForm({ slug, locale, schema, messages }: Props) {
  const [result, setResult] = useState<ToolRunResponse | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const copy = runnerCopy[locale] ?? runnerCopy.en;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); setResult(null);
    const form = new FormData(event.currentTarget);
    const input = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`/api/tools/${slug}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input, locale }) });
      const payload = (await response.json()) as ToolRunResponse | { error?: string };
      if (!response.ok) throw new Error("error" in payload ? payload.error : "Unable to run tool.");
      setResult(payload as ToolRunResponse);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unexpected error."); }
    finally { setPending(false); }
  }

  const displayResult = primaryResult(result);
  return (
    <div className="runner-grid editorial-runner">
      <form className="panel tool-form" onSubmit={onSubmit}>
        <div className="editorial-runner-head"><small>{copy.input}</small><h2>{copy.start}</h2><p>{copy.help}</p></div>
        {schema.fields.map((field) => (
          <label key={field.key} className="field"><span>{field.label}</span>
            {field.type === "textarea" ? <textarea name={field.key} required={field.required} placeholder={field.placeholder} maxLength={field.maxLength} defaultValue={String(field.defaultValue ?? "")} /> : field.type === "select" ? <select name={field.key} required={field.required} defaultValue={String(field.defaultValue ?? "")}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "checkbox" ? <input name={field.key} type="checkbox" value="true" defaultChecked={Boolean(field.defaultValue)} /> : <input name={field.key} type={field.type} required={field.required} placeholder={field.placeholder} min={field.min} max={field.max} step={field.step} maxLength={field.maxLength} defaultValue={String(field.defaultValue ?? "")} />}
            {field.helpText ? <small>{field.helpText}</small> : null}
          </label>
        ))}
        <button className="button button-primary" disabled={pending}>{pending ? copy.running : schema.submitLabel}</button>
      </form>

      <section className="panel result-panel" aria-live="polite">
        <div className="editorial-result-head"><small>{translate(messages, "tool.result")}</small><span className="editorial-result-live">{pending ? copy.running : copy.live}</span></div>
        {error ? <div className="error-box">{error}</div> : null}
        {!error && !result ? <div className="empty-result"><span aria-hidden="true">✦</span><p>{translate(messages, "tool.empty")}</p></div> : null}
        {result ? <div className="editorial-result-content"><p className="editorial-result-title">{result.title}</p><pre className={`editorial-primary-result ${displayResult.length > 90 ? "is-long" : ""}`}>{displayResult}</pre>{result.data ? <details className="editorial-raw-output"><summary>{copy.raw}</summary><pre>{JSON.stringify(result.data, null, 2)}</pre></details> : null}<div className="result-cost">{Number(result.creditsCharged ?? 0) === 0 ? copy.zero : `${result.creditsCharged} ${translate(messages, "common.points")}`}{typeof result.balanceAfter === "number" ? ` • ${result.balanceAfter}` : ""}</div></div> : null}
      </section>
    </div>
  );
}
