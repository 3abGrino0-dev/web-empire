export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type EngineType =
  | "formula"
  | "text_transform"
  | "ai_text"
  | "ai_structured"
  | "http_api"
  | "webhook"
  | "workflow"
  | "custom_runtime";

export type ProviderAdapterType =
  | "openai_responses"
  | "anthropic_messages"
  | "gemini_generate_content"
  | "openai_compatible"
  | "custom_http";

export type ProviderStrategy = "manual" | "lowest_cost" | "primary_with_fallback";
export type PricingMode = "free" | "fixed" | "dynamic";

export type ToolFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "date"
  | "email"
  | "url"
  | "checkbox";

export interface ToolFieldOption {
  label: string;
  value: string;
}

export interface ToolInputField {
  key: string;
  label: string;
  type: ToolFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  defaultValue?: string | number | boolean;
  options?: ToolFieldOption[];
}

export interface ToolInputSchema {
  submitLabel: string;
  fields: ToolInputField[];
}

export interface ToolRecord {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  short_description: string;
  engine_type: EngineType;
  input_schema: ToolInputSchema;
  output_schema: JsonValue;
  runtime_config: Record<string, JsonValue>;
  provider_strategy: ProviderStrategy;
  model_alias: string | null;
  prompt_template: string | null;
  pricing_mode: PricingMode;
  fixed_points: number;
  minimum_points: number;
  cost_multiplier: number;
  requires_auth: boolean;
  is_featured: boolean;
  is_active: boolean;
  category_id: string;
}

export interface LocalizedToolRecord extends ToolRecord {
  locale: string;
  title: string;
  localizedDescription: string;
  localizedInputSchema: ToolInputSchema;
  localizedPromptTemplate: string | null;
  seoTitle: string;
  seoDescription: string;
}

export interface ProviderRecord {
  id: string;
  name: string;
  slug: string;
  adapter_type: ProviderAdapterType;
  base_url: string | null;
  secret_id: string | null;
  config: Record<string, JsonValue>;
  priority: number;
  is_active: boolean;
}

export interface ModelRecord {
  id: string;
  provider_id: string;
  name: string;
  model_key: string;
  alias: string;
  capabilities: string[];
  input_cost_per_million_usd: number;
  output_cost_per_million_usd: number;
  cached_input_cost_per_million_usd: number;
  max_output_tokens: number;
  priority: number;
  is_active: boolean;
}

export interface ProviderUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
}

export interface AiExecutionResult {
  text: string;
  data?: JsonValue;
  providerResponseId?: string;
  usage: ProviderUsage;
  raw?: JsonValue;
}

export interface ToolRunResponse {
  runId: string;
  title: string;
  text?: string;
  data?: JsonValue;
  creditsCharged: number;
  balanceAfter?: number;
}
