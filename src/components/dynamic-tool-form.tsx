"use client";

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

export function DynamicToolForm({ slug, locale, schema, messages }: Props) {
  const [result, setResult] = useState<ToolRunResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
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
        throw new Error("error" in payload ? payload.error : "Unable to run tool.");
      }

      setResult(payload as ToolRunResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unexpected error.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="runner-grid">
      <form className="panel tool-form" onSubmit={onSubmit}>
        <div className="tool-form-header">
          <div className="eyebrow">{translate(messages, "tool.result")}</div>
          <p>Fill the inputs and run the tool to see the result.</p>
        </div>
        {schema.fields.map((field) => (
          <label key={field.key} className="field">
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
              <select
                name={field.key}
                required={field.required}
                defaultValue={String(field.defaultValue ?? "")}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                name={field.key}
                type="checkbox"
                value="true"
                defaultChecked={Boolean(field.defaultValue)}
              />
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

        <button className="button button-primary" disabled={pending}>
          {pending ? "…" : schema.submitLabel}
        </button>
      </form>

      <section className="panel result-panel" aria-live="polite">
        <div className="result-panel-head">
          <div className="eyebrow">{translate(messages, "tool.result")}</div>
          <span className="ui-badge">Live output</span>
        </div>
        {error ? <div className="error-box">{error}</div> : null}
        {!error && !result ? (
          <div className="empty-result">
            <span>✦</span>
            <p>{translate(messages, "tool.empty")}</p>
          </div>
        ) : null}
        {result ? (
          <div className="result-content">
            <h2>{result.title}</h2>
            {result.text ? <pre className="result-code">{result.text}</pre> : null}
            {result.data ? <pre className="result-code">{JSON.stringify(result.data, null, 2)}</pre> : null}
            <div className="result-cost">
              {Number(result.creditsCharged ?? 0) === 0 ? "0 نقطة" : `${result.creditsCharged} ${translate(messages, "common.points")}`}
              {typeof result.balanceAfter === "number"
                ? ` • ${result.balanceAfter}`
                : ""}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
