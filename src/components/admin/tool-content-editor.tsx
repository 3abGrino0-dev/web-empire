"use client";

import { useMemo, useState, useTransition } from "react";

import { saveToolContentAction, saveToolRelatedToolsAction } from "@/actions/tool-content";
import type { ToolFaqItem, ToolHowToStep, ToolUseCase } from "@/domain/tool-content";
import type { LocaleRecord } from "@/localization/types";

interface ToolTranslationInput {
  locale_id: string;
  seo_title: string | null;
  seo_description: string | null;
}

interface ToolContentInput {
  locale_id: string;
  primary_keyword: string | null;
  secondary_keywords: string[];
  what_is: string;
  use_cases: unknown;
  how_to_steps: unknown;
  methodology: string;
  example_title: string;
  example_content: string;
  faq: unknown;
}

interface RelatedToolRow {
  related_tool_id: string;
}

interface CandidateTool {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  engine_type: string;
  is_active: boolean;
}

interface ToolEditorTool {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  engine_type: string;
  is_active: boolean;
}

interface LocaleDraft {
  seoTitle: string;
  seoDescription: string;
  primaryKeyword: string;
  secondaryKeywordsText: string;
  whatIs: string;
  useCases: ToolUseCase[];
  howToSteps: ToolHowToStep[];
  methodology: string;
  exampleTitle: string;
  exampleContent: string;
  faq: ToolFaqItem[];
}

function parseUseCases(value: unknown): ToolUseCase[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { title?: unknown; description?: unknown } => typeof item === "object" && item !== null)
    .map((item) => ({
      title: String(item.title ?? "").trim(),
      description: String(item.description ?? "").trim(),
    }));
}

function parseHowToSteps(value: unknown): ToolHowToStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { title?: unknown; description?: unknown } => typeof item === "object" && item !== null)
    .map((item) => ({
      title: String(item.title ?? "").trim(),
      description: String(item.description ?? "").trim(),
    }));
}

function parseFaq(value: unknown): ToolFaqItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { question?: unknown; answer?: unknown } => typeof item === "object" && item !== null)
    .map((item) => ({
      question: String(item.question ?? "").trim(),
      answer: String(item.answer ?? "").trim(),
    }));
}

function createInitialDraft(
  localeId: string,
  translations: ToolTranslationInput[],
  contents: ToolContentInput[],
): LocaleDraft {
  const translation = translations.find((item) => item.locale_id === localeId);
  const content = contents.find((item) => item.locale_id === localeId);

  return {
    seoTitle: translation?.seo_title ?? "",
    seoDescription: translation?.seo_description ?? "",
    primaryKeyword: content?.primary_keyword ?? "",
    secondaryKeywordsText: (content?.secondary_keywords ?? []).join("\n"),
    whatIs: content?.what_is ?? "",
    useCases: parseUseCases(content?.use_cases),
    howToSteps: parseHowToSteps(content?.how_to_steps),
    methodology: content?.methodology ?? "",
    exampleTitle: content?.example_title ?? "",
    exampleContent: content?.example_content ?? "",
    faq: parseFaq(content?.faq),
  };
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [current] = next.splice(from, 1);
  next.splice(to, 0, current);
  return next;
}

function secondaryKeywordsFromText(value: string): string[] {
  const values = value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const unique: string[] = [];
  for (const keyword of values) {
    if (!unique.includes(keyword)) unique.push(keyword);
  }

  return unique;
}

function toolLabel(tool: CandidateTool): string {
  return `${tool.title_ar} (${tool.slug})`;
}

export function ToolContentEditor({
  tool,
  locales,
  toolTranslations,
  toolContents,
  relatedTools,
  candidateTools,
}: {
  tool: ToolEditorTool;
  locales: LocaleRecord[];
  toolTranslations: ToolTranslationInput[];
  toolContents: ToolContentInput[];
  relatedTools: RelatedToolRow[];
  candidateTools: CandidateTool[];
}) {
  const [selectedLocaleId, setSelectedLocaleId] = useState(locales[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [isRelatedPending, startRelatedTransition] = useTransition();
  const [contentMessage, setContentMessage] = useState("");
  const [relatedMessage, setRelatedMessage] = useState("");
  const [relatedSelection, setRelatedSelection] = useState(
    relatedTools.map((item) => item.related_tool_id),
  );
  const [candidateToAdd, setCandidateToAdd] = useState(candidateTools[0]?.id ?? "");

  const [drafts, setDrafts] = useState<Record<string, LocaleDraft>>(() => {
    const next: Record<string, LocaleDraft> = {};
    for (const locale of locales) {
      next[locale.id] = createInitialDraft(locale.id, toolTranslations, toolContents);
    }
    return next;
  });

  const selectedLocale = locales.find((locale) => locale.id === selectedLocaleId) ?? locales[0];
  const selectedDraft = drafts[selectedLocale?.id ?? ""];

  const relatedToolMap = useMemo(
    () => new Map(candidateTools.map((item) => [item.id, item])),
    [candidateTools],
  );

  function updateDraft(patch: Partial<LocaleDraft>) {
    if (!selectedLocale) return;
    setDrafts((current) => ({
      ...current,
      [selectedLocale.id]: {
        ...current[selectedLocale.id],
        ...patch,
      },
    }));
  }

  function updateUseCase(index: number, patch: Partial<ToolUseCase>) {
    if (!selectedDraft) return;
    const next = selectedDraft.useCases.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    );
    updateDraft({ useCases: next });
  }

  function updateStep(index: number, patch: Partial<ToolHowToStep>) {
    if (!selectedDraft) return;
    const next = selectedDraft.howToSteps.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    );
    updateDraft({ howToSteps: next });
  }

  function updateFaq(index: number, patch: Partial<ToolFaqItem>) {
    if (!selectedDraft) return;
    const next = selectedDraft.faq.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    );
    updateDraft({ faq: next });
  }

  function saveCurrentLocale() {
    if (!selectedLocale || !selectedDraft) return;

    startTransition(async () => {
      const result = await saveToolContentAction({
        tool_id: tool.id,
        locale_id: selectedLocale.id,
        seo_title: selectedDraft.seoTitle,
        seo_description: selectedDraft.seoDescription,
        primary_keyword: selectedDraft.primaryKeyword,
        secondary_keywords: secondaryKeywordsFromText(selectedDraft.secondaryKeywordsText),
        what_is: selectedDraft.whatIs,
        use_cases: selectedDraft.useCases,
        how_to_steps: selectedDraft.howToSteps,
        methodology: selectedDraft.methodology,
        example_title: selectedDraft.exampleTitle,
        example_content: selectedDraft.exampleContent,
        faq: selectedDraft.faq,
      });

      if (result.ok) {
        setContentMessage("تم حفظ المحتوى بنجاح");
      } else {
        setContentMessage(`فشل الحفظ: ${result.error ?? "UNKNOWN"}`);
      }
    });
  }

  function saveRelatedTools() {
    startRelatedTransition(async () => {
      const result = await saveToolRelatedToolsAction({
        tool_id: tool.id,
        related_tool_ids: relatedSelection,
      });

      if (result.ok) {
        setRelatedMessage("تم حفظ الأدوات ذات الصلة بنجاح");
      } else {
        setRelatedMessage(`فشل الحفظ: ${result.error ?? "UNKNOWN"}`);
      }
    });
  }

  function addRelatedTool() {
    if (!candidateToAdd || relatedSelection.includes(candidateToAdd)) return;
    setRelatedSelection((current) => [...current, candidateToAdd]);
  }

  if (!selectedDraft || !selectedLocale) {
    return <p className="inline-note">لا توجد لغات نشطة لإدارة المحتوى.</p>;
  }

  return (
    <div className="panel admin-form">
      <div className="admin-head">
        <div className="eyebrow">TOOL CONTENT + SEO</div>
        <h1>{tool.title_ar}</h1>
        <p>{tool.slug} - {tool.engine_type}</p>
      </div>

      <section>
        <h2>اللغات</h2>
        <div className="chip-row">
          {locales.map((locale) => (
            <button
              type="button"
              key={locale.id}
              className={`chip ${selectedLocale.id === locale.id ? "is-active" : ""}`}
              onClick={() => setSelectedLocaleId(locale.id)}
            >
              {locale.native_name} ({locale.code}) - {locale.direction}
            </button>
          ))}
        </div>
      </section>

      <section className="admin-section-gap" id="seo-section">
        <h2>01 - SEO</h2>
        <div className="form-grid">
          <label>
            SEO Title
            <input
              value={selectedDraft.seoTitle}
              onChange={(event) => updateDraft({ seoTitle: event.target.value })}
            />
            <small>{selectedDraft.seoTitle.length} حرف</small>
          </label>
          <label>
            SEO Description
            <textarea
              value={selectedDraft.seoDescription}
              onChange={(event) => updateDraft({ seoDescription: event.target.value })}
            />
            <small>{selectedDraft.seoDescription.length} حرف</small>
          </label>
          <label>
            Primary Keyword
            <input
              value={selectedDraft.primaryKeyword}
              onChange={(event) => updateDraft({ primaryKeyword: event.target.value })}
            />
            <small>{selectedDraft.primaryKeyword.length} حرف</small>
          </label>
          <label className="full">
            Secondary Keywords
            <textarea
              value={selectedDraft.secondaryKeywordsText}
              onChange={(event) => updateDraft({ secondaryKeywordsText: event.target.value })}
              placeholder="كل كلمة في سطر جديد أو مفصولة بفواصل"
            />
            <small>
              {secondaryKeywordsFromText(selectedDraft.secondaryKeywordsText).length} كلمات
            </small>
          </label>
        </div>
      </section>

      <section className="admin-section-gap">
        <h2>02 - ما هي هذه الأداة؟</h2>
        <label>
          ما هي هذه الأداة؟
          <textarea
            value={selectedDraft.whatIs}
            onChange={(event) => updateDraft({ whatIs: event.target.value })}
          />
          <small>{selectedDraft.whatIs.length} حرف</small>
        </label>
      </section>

      <section className="admin-section-gap">
        <h2>03 - حالات الاستخدام</h2>
        <div className="builder-stack">
          {selectedDraft.useCases.map((item, index) => (
            <article className="builder-card" key={`use-case-${index}`}>
              <div className="builder-card-head">
                <strong>حالة استخدام {index + 1}</strong>
                <div className="workflow-actions">
                  <button type="button" onClick={() => updateDraft({ useCases: moveItem(selectedDraft.useCases, index, index - 1) })}>↑</button>
                  <button type="button" onClick={() => updateDraft({ useCases: moveItem(selectedDraft.useCases, index, index + 1) })}>↓</button>
                  <button
                    type="button"
                    className="danger-link"
                    onClick={() => updateDraft({ useCases: selectedDraft.useCases.filter((_, i) => i !== index) })}
                  >
                    حذف
                  </button>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  Title
                  <input value={item.title} onChange={(event) => updateUseCase(index, { title: event.target.value })} />
                </label>
                <label className="full">
                  Description
                  <textarea
                    value={item.description}
                    onChange={(event) => updateUseCase(index, { description: event.target.value })}
                  />
                </label>
              </div>
            </article>
          ))}
          <button
            type="button"
            className="button button-dark"
            onClick={() => updateDraft({ useCases: [...selectedDraft.useCases, { title: "", description: "" }] })}
          >
            + إضافة حالة استخدام
          </button>
        </div>
      </section>

      <section className="admin-section-gap">
        <h2>04 - طريقة الاستخدام</h2>
        <div className="builder-stack">
          {selectedDraft.howToSteps.map((item, index) => (
            <article className="builder-card" key={`how-to-${index}`}>
              <div className="builder-card-head">
                <strong>الخطوة {String(index + 1).padStart(2, "0")}</strong>
                <div className="workflow-actions">
                  <button type="button" onClick={() => updateDraft({ howToSteps: moveItem(selectedDraft.howToSteps, index, index - 1) })}>↑</button>
                  <button type="button" onClick={() => updateDraft({ howToSteps: moveItem(selectedDraft.howToSteps, index, index + 1) })}>↓</button>
                  <button
                    type="button"
                    className="danger-link"
                    onClick={() => updateDraft({ howToSteps: selectedDraft.howToSteps.filter((_, i) => i !== index) })}
                  >
                    حذف
                  </button>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  Title
                  <input value={item.title} onChange={(event) => updateStep(index, { title: event.target.value })} />
                </label>
                <label className="full">
                  Description
                  <textarea
                    value={item.description}
                    onChange={(event) => updateStep(index, { description: event.target.value })}
                  />
                </label>
              </div>
            </article>
          ))}
          <button
            type="button"
            className="button button-dark"
            onClick={() => updateDraft({ howToSteps: [...selectedDraft.howToSteps, { title: "", description: "" }] })}
          >
            + إضافة خطوة
          </button>
        </div>
      </section>

      <section className="admin-section-gap">
        <h2>05 - كيف تعمل الأداة؟</h2>
        <label>
          منهجية العمل
          <textarea
            value={selectedDraft.methodology}
            onChange={(event) => updateDraft({ methodology: event.target.value })}
          />
          <small>{selectedDraft.methodology.length} حرف</small>
        </label>
      </section>

      <section className="admin-section-gap">
        <h2>06 - مثال عملي</h2>
        <div className="form-grid">
          <label>
            Example Title
            <input
              value={selectedDraft.exampleTitle}
              onChange={(event) => updateDraft({ exampleTitle: event.target.value })}
            />
          </label>
          <label className="full">
            Example Content
            <textarea
              value={selectedDraft.exampleContent}
              onChange={(event) => updateDraft({ exampleContent: event.target.value })}
            />
            <small>{selectedDraft.exampleContent.length} حرف</small>
          </label>
        </div>
      </section>

      <section className="admin-section-gap">
        <h2>07 - FAQ</h2>
        <div className="builder-stack">
          {selectedDraft.faq.map((item, index) => (
            <article className="builder-card" key={`faq-${index}`}>
              <div className="builder-card-head">
                <strong>FAQ {index + 1}</strong>
                <div className="workflow-actions">
                  <button type="button" onClick={() => updateDraft({ faq: moveItem(selectedDraft.faq, index, index - 1) })}>↑</button>
                  <button type="button" onClick={() => updateDraft({ faq: moveItem(selectedDraft.faq, index, index + 1) })}>↓</button>
                  <button
                    type="button"
                    className="danger-link"
                    onClick={() => updateDraft({ faq: selectedDraft.faq.filter((_, i) => i !== index) })}
                  >
                    حذف
                  </button>
                </div>
              </div>
              <div className="form-grid">
                <label className="full">
                  Question
                  <input
                    value={item.question}
                    onChange={(event) => updateFaq(index, { question: event.target.value })}
                  />
                </label>
                <label className="full">
                  Answer
                  <textarea
                    value={item.answer}
                    onChange={(event) => updateFaq(index, { answer: event.target.value })}
                  />
                </label>
              </div>
            </article>
          ))}
          <button
            type="button"
            className="button button-dark"
            onClick={() => updateDraft({ faq: [...selectedDraft.faq, { question: "", answer: "" }] })}
          >
            + إضافة FAQ
          </button>
        </div>
      </section>

      <section className="admin-section-gap" id="related-tools">
        <h2>08 - الأدوات ذات الصلة</h2>
        <div className="form-grid">
          <label>
            أضف أداة ذات صلة
            <select value={candidateToAdd} onChange={(event) => setCandidateToAdd(event.target.value)}>
              {candidateTools
                .filter((item) => !relatedSelection.includes(item.id))
                .map((item) => (
                  <option value={item.id} key={item.id}>
                    {toolLabel(item)}
                  </option>
                ))}
            </select>
          </label>
          <div className="full" style={{ display: "flex", gap: 12, alignItems: "end" }}>
            <button type="button" className="button button-dark" onClick={addRelatedTool}>
              + إضافة أداة
            </button>
            <button
              type="button"
              className="button button-primary"
              disabled={isRelatedPending}
              onClick={saveRelatedTools}
            >
              {isRelatedPending ? "جارٍ الحفظ..." : "حفظ الأدوات ذات الصلة"}
            </button>
            {relatedMessage ? <span className="inline-note">{relatedMessage}</span> : null}
          </div>
        </div>

        <div className="builder-stack">
          {relatedSelection.map((relatedId, index) => {
            const related = relatedToolMap.get(relatedId);
            if (!related) return null;

            return (
              <article className="builder-card" key={relatedId}>
                <div className="builder-card-head">
                  <strong>{related.title_ar} ({related.slug})</strong>
                  <div className="workflow-actions">
                    <button
                      type="button"
                      onClick={() => setRelatedSelection((current) => moveItem(current, index, index - 1))}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelatedSelection((current) => moveItem(current, index, index + 1))}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="danger-link"
                      onClick={() => setRelatedSelection((current) => current.filter((id) => id !== relatedId))}
                    >
                      حذف
                    </button>
                  </div>
                </div>
                <p className="inline-note">{related.engine_type} - {related.is_active ? "نشطة" : "غير نشطة"}</p>
              </article>
            );
          })}
        </div>
      </section>

      <div className="builder-actions">
        <button
          type="button"
          className="button button-primary"
          disabled={isPending}
          onClick={saveCurrentLocale}
        >
          {isPending ? "جارٍ الحفظ..." : "حفظ المحتوى"}
        </button>
        {contentMessage ? <span className="inline-note">{contentMessage}</span> : null}
      </div>
    </div>
  );
}
