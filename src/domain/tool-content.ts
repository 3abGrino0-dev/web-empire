export interface ToolUseCase {
  title: string;
  description: string;
}

export interface ToolHowToStep {
  title: string;
  description: string;
}

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolContent {
  toolId: string;
  localeId: string;
  seoTitle: string;
  seoDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  whatIs: string;
  useCases: ToolUseCase[];
  howToSteps: ToolHowToStep[];
  methodology: string;
  exampleTitle: string;
  exampleContent: string;
  faq: ToolFaqItem[];
}

export type ToolContentCriterionKey =
  | "seo_title"
  | "seo_description"
  | "what_is"
  | "use_cases"
  | "how_to_steps"
  | "methodology"
  | "example_content"
  | "faq";

export interface ToolContentCompleteness {
  percentage: number;
  completedCount: number;
  totalCount: number;
  missingFieldKeys: ToolContentCriterionKey[];
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length);
}

export function calculateToolContentCompleteness(input: {
  seoTitle?: string | null;
  seoDescription?: string | null;
  whatIs?: string | null;
  useCases?: ToolUseCase[] | null;
  howToSteps?: ToolHowToStep[] | null;
  methodology?: string | null;
  exampleContent?: string | null;
  faq?: ToolFaqItem[] | null;
}): ToolContentCompleteness {
  const checks: Array<{ key: ToolContentCriterionKey; done: boolean }> = [
    { key: "seo_title", done: hasText(input.seoTitle) },
    { key: "seo_description", done: hasText(input.seoDescription) },
    { key: "what_is", done: hasText(input.whatIs) },
    { key: "use_cases", done: Boolean(input.useCases?.length) },
    { key: "how_to_steps", done: Boolean(input.howToSteps?.length) },
    { key: "methodology", done: hasText(input.methodology) },
    { key: "example_content", done: hasText(input.exampleContent) },
    { key: "faq", done: Boolean(input.faq?.length) },
  ];

  const completedCount = checks.filter((item) => item.done).length;
  const totalCount = checks.length;

  return {
    percentage: Math.round((completedCount / totalCount) * 100),
    completedCount,
    totalCount,
    missingFieldKeys: checks.filter((item) => !item.done).map((item) => item.key),
  };
}
