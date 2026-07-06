"use client";

import { useMemo, useState } from "react";

import { createWorkflowAction } from "@/actions/admin";

interface ConnectionOption {
  id: string;
  name: string;
}

type StepType =
  | "template"
  | "formula"
  | "http_api"
  | "webhook"
  | "ai_text"
  | "ai_structured";

interface StepDraft {
  id: string;
  stepKey: string;
  name: string;
  stepType: StepType;
  continueOnError: boolean;
  template: string;
  expression: string;
  variablesJson: string;
  connectionId: string;
  path: string;
  method: string;
  bodyTemplate: string;
  textPath: string;
  dataPath: string;
  modelAlias: string;
  providerStrategy: string;
  promptTemplate: string;
  maxOutputTokens: string;
  outputSchema: string;
}

function createStep(index: number, connectionId: string): StepDraft {
  return {
    id: crypto.randomUUID(),
    stepKey: `step_${index + 1}`,
    name: `الخطوة ${index + 1}`,
    stepType: "template",
    continueOnError: false,
    template: "{{input.topic}}",
    expression: "value * 2",
    variablesJson: '{"value":"$input.value"}',
    connectionId,
    path: "/generate",
    method: "POST",
    bodyTemplate: '{"topic":"{{input.topic}}"}',
    textPath: "",
    dataPath: "",
    modelAlias: "standard",
    providerStrategy: "primary_with_fallback",
    promptTemplate: "حلل:\n{{input.topic}}",
    maxOutputTokens: "2000",
    outputSchema: "{}",
  };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text || "{}");
  } catch {
    return {};
  }
}

export function VisualWorkflowBuilder({ connections }: { connections: ConnectionOption[] }) {
  const [steps, setSteps] = useState<StepDraft[]>([
    createStep(0, connections[0]?.id ?? ""),
  ]);

  function updateStep(id: string, patch: Partial<StepDraft>) {
    setSteps((current) => current.map((step) => (step.id === id ? { ...step, ...patch } : step)));
  }

  function move(index: number, direction: -1 | 1) {
    setSteps((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  const normalizedSteps = useMemo(
    () =>
      steps.map((step, index) => {
        let config: Record<string, unknown> = {};
        if (step.stepType === "template") config = { template: step.template };
        if (step.stepType === "formula") {
          config = { expression: step.expression, variables: parseJson(step.variablesJson) };
        }
        if (step.stepType === "http_api" || step.stepType === "webhook") {
          config = {
            connection_id: step.connectionId,
            path: step.path,
            method: step.stepType === "webhook" ? "POST" : step.method,
            body_template: step.bodyTemplate,
            text_path: step.textPath || undefined,
            data_path: step.dataPath || undefined,
          };
        }
        if (step.stepType === "ai_text" || step.stepType === "ai_structured") {
          config = {
            model_alias: step.modelAlias,
            provider_strategy: step.providerStrategy,
            prompt_template: step.promptTemplate,
            max_output_tokens: Number(step.maxOutputTokens),
            ...(step.stepType === "ai_structured"
              ? { output_schema: parseJson(step.outputSchema) }
              : {}),
          };
        }

        return {
          step_key: step.stepKey,
          name: step.name,
          step_type: step.stepType,
          sort_order: (index + 1) * 10,
          config,
          continue_on_error: step.continueOnError,
        };
      }),
    [steps],
  );

  return (
    <form action={createWorkflowAction} className="panel admin-form builder-shell">
      <div className="form-grid">
        <label>اسم Workflow<input name="name" required /></label>
        <label>Slug<input name="slug" required /></label>
        <label className="full">الوصف<textarea name="description" /></label>
      </div>

      <input type="hidden" name="steps_json" value={JSON.stringify(normalizedSteps)} />

      <div className="workflow-canvas">
        {steps.map((step, index) => (
          <article className="workflow-step-card" key={step.id}>
            <div className="builder-card-head">
              <div><span className="workflow-order">{index + 1}</span><strong>{step.name}</strong></div>
              <div className="workflow-actions">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === steps.length - 1}>↓</button>
                <button type="button" className="danger-link" onClick={() => setSteps((current) => current.filter((item) => item.id !== step.id))}>حذف</button>
              </div>
            </div>

            <div className="form-grid">
              <label>Step Key<input value={step.stepKey} onChange={(event) => updateStep(step.id, { stepKey: event.target.value.replace(/[^a-zA-Z0-9_]/g, "_") })} /></label>
              <label>الاسم<input value={step.name} onChange={(event) => updateStep(step.id, { name: event.target.value })} /></label>
              <label>Step Type<select value={step.stepType} onChange={(event) => updateStep(step.id, { stepType: event.target.value as StepType })}><option value="template">Template</option><option value="formula">Formula</option><option value="http_api">HTTP API</option><option value="webhook">Webhook</option><option value="ai_text">AI Text</option><option value="ai_structured">AI Structured</option></select></label>
              <label><input type="checkbox" checked={step.continueOnError} onChange={(event) => updateStep(step.id, { continueOnError: event.target.checked })} /> استمر عند الخطأ</label>

              {step.stepType === "template" ? <label className="full">Template<textarea value={step.template} onChange={(event) => updateStep(step.id, { template: event.target.value })} placeholder="{{input.topic}}" /></label> : null}
              {step.stepType === "formula" ? <><label className="full">Expression<input value={step.expression} onChange={(event) => updateStep(step.id, { expression: event.target.value })} /></label><label className="full">Variables JSON<textarea value={step.variablesJson} onChange={(event) => updateStep(step.id, { variablesJson: event.target.value })} placeholder={'{"value":"$steps.analysis.data.score"}'} /></label></> : null}
              {(step.stepType === "http_api" || step.stepType === "webhook") ? <><label>Connection<select value={step.connectionId} onChange={(event) => updateStep(step.id, { connectionId: event.target.value })}>{connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.name}</option>)}</select></label><label>Path<input value={step.path} onChange={(event) => updateStep(step.id, { path: event.target.value })} /></label>{step.stepType === "http_api" ? <label>Method<select value={step.method} onChange={(event) => updateStep(step.id, { method: event.target.value })}><option>POST</option><option>GET</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select></label> : null}<label className="full">Body Template<textarea value={step.bodyTemplate} onChange={(event) => updateStep(step.id, { bodyTemplate: event.target.value })} /></label><label>Text Path<input value={step.textPath} onChange={(event) => updateStep(step.id, { textPath: event.target.value })} /></label><label>Data Path<input value={step.dataPath} onChange={(event) => updateStep(step.id, { dataPath: event.target.value })} /></label></> : null}
              {(step.stepType === "ai_text" || step.stepType === "ai_structured") ? <><label>Model Alias<input value={step.modelAlias} onChange={(event) => updateStep(step.id, { modelAlias: event.target.value })} /></label><label>Provider Strategy<select value={step.providerStrategy} onChange={(event) => updateStep(step.id, { providerStrategy: event.target.value })}><option value="primary_with_fallback">Primary + Fallback</option><option value="lowest_cost">Lowest Cost</option><option value="manual">Manual</option></select></label><label>Max Output Tokens<input type="number" value={step.maxOutputTokens} onChange={(event) => updateStep(step.id, { maxOutputTokens: event.target.value })} /></label><label className="full">Prompt Template<textarea value={step.promptTemplate} onChange={(event) => updateStep(step.id, { promptTemplate: event.target.value })} placeholder="{{steps.outline.text}}" /></label>{step.stepType === "ai_structured" ? <label className="full">Output Schema<textarea value={step.outputSchema} onChange={(event) => updateStep(step.id, { outputSchema: event.target.value })} /></label> : null}</> : null}
            </div>
          </article>
        ))}
      </div>

      <div className="builder-actions">
        <button type="button" className="button button-dark" onClick={() => setSteps((current) => [...current, createStep(current.length, connections[0]?.id ?? "")])}>+ إضافة خطوة</button>
        <button className="button button-primary" disabled={!steps.length}>حفظ Workflow</button>
      </div>
    </form>
  );
}
