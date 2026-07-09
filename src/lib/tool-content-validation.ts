import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);

export const toolUseCaseSchema = z.object({
  title: trimmed(180),
  description: trimmed(2000),
});

export const toolHowToStepSchema = z.object({
  title: trimmed(180),
  description: trimmed(3000),
});

export const toolFaqItemSchema = z.object({
  question: trimmed(300),
  answer: trimmed(5000),
});

export const toolUseCaseArraySchema = z.array(toolUseCaseSchema).max(30);
export const toolHowToStepArraySchema = z.array(toolHowToStepSchema).max(30);
export const toolFaqArraySchema = z.array(toolFaqItemSchema).max(50);

export const saveToolContentSchema = z.object({
  tool_id: z.string().uuid(),
  locale_id: z.string().uuid(),
  seo_title: z.string().trim(),
  seo_description: z.string().trim(),
  primary_keyword: z.string().trim().max(120),
  secondary_keywords: z.array(z.string().trim().max(120)).max(30),
  what_is: trimmed(12000),
  use_cases: toolUseCaseArraySchema,
  how_to_steps: toolHowToStepArraySchema,
  methodology: trimmed(12000),
  example_title: trimmed(240),
  example_content: trimmed(16000),
  faq: toolFaqArraySchema,
});

export const saveToolRelatedToolsSchema = z.object({
  tool_id: z.string().uuid(),
  related_tool_ids: z.array(z.string().uuid()).max(200),
});

function parseJsonIfString(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text) return [];

  try {
    return JSON.parse(text);
  } catch {
    return Symbol.for("WEB_EMPIRE_INVALID_JSON");
  }
}

export function normalizeKeywordList(values: string[]): string[] {
  const result: string[] = [];
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) continue;
    if (result.includes(normalized)) continue;
    result.push(normalized);
  }
  return result;
}

export function parseSaveToolContentInput(input: unknown) {
  const source = input as Record<string, unknown>;
  const useCases = parseJsonIfString(source.use_cases);
  const howToSteps = parseJsonIfString(source.how_to_steps);
  const faq = parseJsonIfString(source.faq);
  const secondaryKeywordsRaw = source.secondary_keywords;

  if (
    useCases === Symbol.for("WEB_EMPIRE_INVALID_JSON") ||
    howToSteps === Symbol.for("WEB_EMPIRE_INVALID_JSON") ||
    faq === Symbol.for("WEB_EMPIRE_INVALID_JSON")
  ) {
    throw new Error("TOOL_CONTENT_INVALID_JSON");
  }

  const secondaryKeywords = Array.isArray(secondaryKeywordsRaw)
    ? secondaryKeywordsRaw
    : String(secondaryKeywordsRaw ?? "")
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

  const parsed = saveToolContentSchema.parse({
    tool_id: source.tool_id,
    locale_id: source.locale_id,
    seo_title: source.seo_title ?? "",
    seo_description: source.seo_description ?? "",
    primary_keyword: source.primary_keyword ?? "",
    secondary_keywords: normalizeKeywordList(
      secondaryKeywords.map((item) => String(item ?? "")),
    ),
    what_is: source.what_is ?? "",
    use_cases: useCases,
    how_to_steps: howToSteps,
    methodology: source.methodology ?? "",
    example_title: source.example_title ?? "",
    example_content: source.example_content ?? "",
    faq,
  });

  return {
    ...parsed,
    secondary_keywords: normalizeKeywordList(parsed.secondary_keywords),
  };
}

export function parseSaveToolRelatedToolsInput(input: unknown) {
  const source = input as Record<string, unknown>;
  const related = Array.isArray(source.related_tool_ids)
    ? source.related_tool_ids
    : String(source.related_tool_ids ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const parsed = saveToolRelatedToolsSchema.parse({
    tool_id: source.tool_id,
    related_tool_ids: related,
  });

  const deduped: string[] = [];
  for (const id of parsed.related_tool_ids) {
    if (!deduped.includes(id)) deduped.push(id);
  }

  return {
    tool_id: parsed.tool_id,
    related_tool_ids: deduped,
  };
}
