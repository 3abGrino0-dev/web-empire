"use client";

import { useMemo, useState } from "react";

import { createToolAction } from "@/actions/admin";
import type { EngineType, ToolFieldType } from "@/domain/types";

interface OptionItem {
  id: string;
  name: string;
}

interface Props {
  categories: OptionItem[];
  skills: OptionItem[];
  plans: OptionItem[];
  connections: OptionItem[];
  workflows: OptionItem[];
}

interface BuilderField {
  id: string;
  key: string;
  label: string;
  type: ToolFieldType;
  required: boolean;
  placeholder: string;
  maxLength: string;
  optionsText: string;
}

const STEPS = [
  "المعلومات",
  "حقول الأداة",
  "المحرك",
  "المهارات",
  "النقاط والخطط",
  "SEO",
  "المعاينة",
] as const;

const fieldTypes: ToolFieldType[] = [
  "text",
  "textarea",
  "number",
  "select",
  "date",
  "email",
  "url",
  "checkbox",
];

function newField(index: number): BuilderField {
  return {
    id: crypto.randomUUID(),
    key: `field_${index + 1}`,
    label: `الحقل ${index + 1}`,
    type: "text",
    required: true,
    placeholder: "",
    maxLength: "",
    optionsText: "",
  };
}

function parseOptions(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...valueParts] = line.split(":");
      return { label: label.trim(), value: (valueParts.join(":") || label).trim() };
    });
}

export function VisualToolBuilder({
  categories,
  skills,
  plans,
  connections,
  workflows,
}: Props) {
  const [step, setStep] = useState(0);
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [fields, setFields] = useState<BuilderField[]>([newField(0)]);
  const [submitLabel, setSubmitLabel] = useState("تشغيل الأداة");
  const [engine, setEngine] = useState<EngineType>("ai_text");
  const [modelAlias, setModelAlias] = useState("standard");
  const [providerStrategy, setProviderStrategy] = useState("primary_with_fallback");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [maxOutputTokens, setMaxOutputTokens] = useState("2500");
  const [formulaExpression, setFormulaExpression] = useState("");
  const [connectionId, setConnectionId] = useState(connections[0]?.id ?? "");
  const [httpPath, setHttpPath] = useState("/generate");
  const [httpMethod, setHttpMethod] = useState("POST");
  const [bodyTemplate, setBodyTemplate] = useState("{}");
  const [textPath, setTextPath] = useState("");
  const [dataPath, setDataPath] = useState("");
  const [workflowId, setWorkflowId] = useState(workflows[0]?.id ?? "");
  const [reservationPoints, setReservationPoints] = useState("100");
  const [outputSchema, setOutputSchema] = useState("{}");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [planAccess, setPlanAccess] = useState<Record<string, {
    allowed: boolean;
    dailyRunLimit: string;
    maxOutputTokens: string;
  }>>(() => Object.fromEntries(plans.map((plan) => [plan.id, {
    allowed: true,
    dailyRunLimit: "",
    maxOutputTokens: "",
  }])));
  const [pricingMode, setPricingMode] = useState("dynamic");
  const [fixedPoints, setFixedPoints] = useState("10");
  const [minimumPoints, setMinimumPoints] = useState("5");
  const [costMultiplier, setCostMultiplier] = useState("1");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoTitleAr, setSeoTitleAr] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [requiresAuth, setRequiresAuth] = useState(true);
  const [featured, setFeatured] = useState(false);

  const inputSchema = useMemo(
    () => ({
      submitLabel,
      fields: fields.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder || undefined,
        maxLength: field.maxLength ? Number(field.maxLength) : undefined,
        options: field.type === "select" ? parseOptions(field.optionsText) : undefined,
      })),
    }),
    [fields, submitLabel],
  );

  const runtimeConfig = useMemo(() => {
    if (engine === "formula") return { expression: formulaExpression };
    if (engine === "text_transform") {
      return { input_key: fields[0]?.key ?? "text", operations: [{ type: "trim" }, { type: "collapse_whitespace" }] };
    }
    if (engine === "ai_text" || engine === "ai_structured") {
      return { max_output_tokens: Number(maxOutputTokens) };
    }
    if (engine === "http_api" || engine === "webhook") {
      return {
        connection_id: connectionId,
        path: httpPath,
        method: engine === "webhook" ? "POST" : httpMethod,
        body_template: bodyTemplate,
        text_path: textPath || undefined,
        data_path: dataPath || undefined,
      };
    }
    if (engine === "workflow") {
      return { workflow_id: workflowId, reservation_points: Number(reservationPoints) };
    }
    return {};
  }, [
    engine,
    formulaExpression,
    fields,
    maxOutputTokens,
    connectionId,
    httpPath,
    httpMethod,
    bodyTemplate,
    textPath,
    dataPath,
    workflowId,
    reservationPoints,
  ]);

  function updateField(id: string, patch: Partial<BuilderField>) {
    setFields((current) => current.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  }

  function toggle(list: string[], value: string, setter: (values: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  const canContinue =
    step !== 0 || Boolean(titleAr && titleEn && slug && description && categoryId);

  return (
    <form action={createToolAction} className="panel admin-form builder-shell">
      <input type="hidden" name="title_ar" value={titleAr} />
      <input type="hidden" name="title_en" value={titleEn} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="short_description" value={description} />
      <input type="hidden" name="category_id" value={categoryId} />
      <input type="hidden" name="engine_type" value={engine} />
      <input type="hidden" name="input_schema" value={JSON.stringify(inputSchema)} />
      <input type="hidden" name="output_schema" value={outputSchema} />
      <input type="hidden" name="runtime_config" value={JSON.stringify(runtimeConfig)} />
      <input type="hidden" name="provider_strategy" value={providerStrategy} />
      <input type="hidden" name="model_alias" value={modelAlias} />
      <input type="hidden" name="prompt_template" value={promptTemplate} />
      <input type="hidden" name="pricing_mode" value={pricingMode} />
      <input type="hidden" name="fixed_points" value={fixedPoints} />
      <input type="hidden" name="minimum_points" value={minimumPoints} />
      <input type="hidden" name="cost_multiplier" value={costMultiplier} />
      <input type="hidden" name="skill_ids" value={selectedSkills.join(",")} />
      <input
        type="hidden"
        name="plan_access_json"
        value={JSON.stringify(plans.map((plan) => ({
          plan_id: plan.id,
          is_allowed: planAccess[plan.id]?.allowed ?? false,
          daily_run_limit: planAccess[plan.id]?.dailyRunLimit
            ? Number(planAccess[plan.id]?.dailyRunLimit)
            : null,
          max_output_tokens: planAccess[plan.id]?.maxOutputTokens
            ? Number(planAccess[plan.id]?.maxOutputTokens)
            : null,
        })))}
      />
      <input type="hidden" name="seo_title" value={seoTitle} />
      <input type="hidden" name="seo_title_ar" value={seoTitleAr} />
      <input type="hidden" name="seo_description" value={seoDescription} />
      {requiresAuth ? <input type="hidden" name="requires_auth" value="on" /> : null}
      {featured ? <input type="hidden" name="is_featured" value="on" /> : null}
      <input type="hidden" name="is_active" value="on" />

      <div className="builder-steps" aria-label="مراحل إنشاء الأداة">
        {STEPS.map((label, index) => (
          <button
            type="button"
            key={label}
            className={index === step ? "builder-step active" : "builder-step"}
            onClick={() => setStep(index)}
          >
            <span>{index + 1}</span>{label}
          </button>
        ))}
      </div>

      <div className="builder-content">
        {step === 0 ? (
          <div className="form-grid">
            <label>الاسم العربي<input value={titleAr} onChange={(event) => setTitleAr(event.target.value)} required /></label>
            <label>الاسم الإنجليزي<input value={titleEn} onChange={(event) => setTitleEn(event.target.value)} required /></label>
            <label>Slug<input value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} required /></label>
            <label>التصنيف<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className="full">الوصف<textarea value={description} onChange={(event) => setDescription(event.target.value)} required /></label>
            <label><input type="checkbox" checked={requiresAuth} onChange={(event) => setRequiresAuth(event.target.checked)} /> يتطلب حساب</label>
            <label><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> أداة مميزة</label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="builder-stack">
            <label>نص زر التشغيل<input value={submitLabel} onChange={(event) => setSubmitLabel(event.target.value)} /></label>
            {fields.map((field, index) => (
              <article className="builder-card" key={field.id}>
                <div className="builder-card-head"><strong>حقل {index + 1}</strong><button type="button" className="danger-link" onClick={() => setFields((current) => current.filter((item) => item.id !== field.id))}>حذف</button></div>
                <div className="form-grid">
                  <label>Key<input value={field.key} onChange={(event) => updateField(field.id, { key: event.target.value.replace(/[^a-zA-Z0-9_]/g, "_") })} /></label>
                  <label>Label<input value={field.label} onChange={(event) => updateField(field.id, { label: event.target.value })} /></label>
                  <label>النوع<select value={field.type} onChange={(event) => updateField(field.id, { type: event.target.value as ToolFieldType })}>{fieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                  <label>Placeholder<input value={field.placeholder} onChange={(event) => updateField(field.id, { placeholder: event.target.value })} /></label>
                  <label>Max Length<input type="number" value={field.maxLength} onChange={(event) => updateField(field.id, { maxLength: event.target.value })} /></label>
                  <label><input type="checkbox" checked={field.required} onChange={(event) => updateField(field.id, { required: event.target.checked })} /> مطلوب</label>
                  {field.type === "select" ? <label className="full">خيارات Select — كل سطر label:value<textarea value={field.optionsText} onChange={(event) => updateField(field.id, { optionsText: event.target.value })} placeholder={"احترافية:professional\nتسويقية:marketing"} /></label> : null}
                </div>
              </article>
            ))}
            <button type="button" className="button button-dark" onClick={() => setFields((current) => [...current, newField(current.length)])}>+ إضافة حقل</button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="form-grid">
            <label>Engine<select value={engine} onChange={(event) => setEngine(event.target.value as EngineType)}><option value="formula">Formula</option><option value="text_transform">Text Transform</option><option value="ai_text">AI Text</option><option value="ai_structured">AI Structured</option><option value="http_api">HTTP API</option><option value="webhook">Webhook</option><option value="workflow">Workflow</option></select></label>
            {(engine === "ai_text" || engine === "ai_structured") ? <><label>Model Alias<input value={modelAlias} onChange={(event) => setModelAlias(event.target.value)} /></label><label>Provider Strategy<select value={providerStrategy} onChange={(event) => setProviderStrategy(event.target.value)}><option value="primary_with_fallback">Primary + Fallback</option><option value="lowest_cost">Lowest Cost</option><option value="manual">Manual</option></select></label><label>Max Output Tokens<input type="number" value={maxOutputTokens} onChange={(event) => setMaxOutputTokens(event.target.value)} /></label><label className="full">Prompt Template<textarea value={promptTemplate} onChange={(event) => setPromptTemplate(event.target.value)} placeholder={"اكتب عن {{topic}}"} /></label>{engine === "ai_structured" ? <label className="full">JSON Schema<textarea value={outputSchema} onChange={(event) => setOutputSchema(event.target.value)} /></label> : null}</> : null}
            {engine === "formula" ? <label className="full">Formula Expression<input value={formulaExpression} onChange={(event) => setFormulaExpression(event.target.value)} placeholder="(value / total) * 100" /></label> : null}
            {(engine === "http_api" || engine === "webhook") ? <><label>Connection<select value={connectionId} onChange={(event) => setConnectionId(event.target.value)}>{connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.name}</option>)}</select></label><label>Path<input value={httpPath} onChange={(event) => setHttpPath(event.target.value)} /></label>{engine === "http_api" ? <label>Method<select value={httpMethod} onChange={(event) => setHttpMethod(event.target.value)}><option>POST</option><option>GET</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select></label> : null}<label className="full">Body Template JSON<textarea value={bodyTemplate} onChange={(event) => setBodyTemplate(event.target.value)} placeholder={'{"topic":"{{input.topic}}"}'} /></label><label>Text Path<input value={textPath} onChange={(event) => setTextPath(event.target.value)} placeholder="data.text" /></label><label>Data Path<input value={dataPath} onChange={(event) => setDataPath(event.target.value)} placeholder="data" /></label></> : null}
            {engine === "workflow" ? <><label>Workflow<select value={workflowId} onChange={(event) => setWorkflowId(event.target.value)}>{workflows.map((workflow) => <option key={workflow.id} value={workflow.id}>{workflow.name}</option>)}</select></label><label>Reservation Points<input type="number" value={reservationPoints} onChange={(event) => setReservationPoints(event.target.value)} /></label></> : null}
          </div>
        ) : null}

        {step === 3 ? <div className="check-grid">{skills.length ? skills.map((skill) => <label className={selectedSkills.includes(skill.id) ? "check-card selected" : "check-card"} key={skill.id}><input type="checkbox" checked={selectedSkills.includes(skill.id)} onChange={() => toggle(selectedSkills, skill.id, setSelectedSkills)} />{skill.name}</label>) : <p>لا توجد Skills بعد. أضفها من صفحة Skills.</p>}</div> : null}

        {step === 4 ? (
          <div className="builder-stack">
            <div className="form-grid">
              <label>Pricing Mode<select value={pricingMode} onChange={(event) => setPricingMode(event.target.value)}><option value="free">Free</option><option value="fixed">Fixed</option><option value="dynamic">Dynamic</option></select></label>
              {pricingMode === "fixed" ? <label>Fixed Points<input type="number" value={fixedPoints} onChange={(event) => setFixedPoints(event.target.value)} /></label> : null}
              {pricingMode === "dynamic" ? <><label>Minimum Points<input type="number" value={minimumPoints} onChange={(event) => setMinimumPoints(event.target.value)} /></label><label>Cost Multiplier<input type="number" step="0.1" value={costMultiplier} onChange={(event) => setCostMultiplier(event.target.value)} /></label></> : null}
            </div>
            <h3>حدود الخطط</h3>
            <div className="plan-access-grid">
              {plans.map((plan) => {
                const access = planAccess[plan.id] ?? { allowed: false, dailyRunLimit: "", maxOutputTokens: "" };
                return (
                  <article className={access.allowed ? "plan-access-card selected" : "plan-access-card"} key={plan.id}>
                    <label className="plan-access-title"><input type="checkbox" checked={access.allowed} onChange={(event) => setPlanAccess((current) => ({ ...current, [plan.id]: { ...access, allowed: event.target.checked } }))} />{plan.name}</label>
                    <label>Daily Run Limit<input type="number" min="1" value={access.dailyRunLimit} disabled={!access.allowed} onChange={(event) => setPlanAccess((current) => ({ ...current, [plan.id]: { ...access, dailyRunLimit: event.target.value } }))} placeholder="بدون حد" /></label>
                    <label>Max Output Tokens<input type="number" min="1" value={access.maxOutputTokens} disabled={!access.allowed} onChange={(event) => setPlanAccess((current) => ({ ...current, [plan.id]: { ...access, maxOutputTokens: event.target.value } }))} placeholder="حد المحرك" /></label>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 5 ? <div className="form-grid"><label>SEO Title EN<input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} /></label><label>SEO Title AR<input value={seoTitleAr} onChange={(event) => setSeoTitleAr(event.target.value)} /></label><label className="full">SEO Description<textarea value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} /></label></div> : null}

        {step === 6 ? <div className="builder-preview"><div className="eyebrow">{engine}</div><h2>{titleAr || "اسم الأداة"}</h2><p>{description || "وصف الأداة"}</p><div className="preview-fields">{inputSchema.fields.map((field) => <div className="preview-field" key={field.key}><strong>{field.label}</strong><span>{field.type} • {field.key}</span></div>)}</div><div className="tool-meta"><span>{pricingMode}</span><span>{Object.values(planAccess).filter((access) => access.allowed).length} خطط • {selectedSkills.length} Skills</span></div></div> : null}
      </div>

      <div className="builder-actions">
        <button type="button" className="button button-dark" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>السابق</button>
        {step < STEPS.length - 1 ? <button type="button" className="button button-primary" disabled={!canContinue} onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))}>التالي</button> : <button className="button button-primary">نشر الأداة</button>}
      </div>
    </form>
  );
}
