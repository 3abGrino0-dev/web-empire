import type {
  AiExecutionResult,
  JsonValue,
  ModelRecord,
  ProviderRecord
} from "@/domain/types";

export interface AiAdapterInput {
  provider: ProviderRecord;
  model: ModelRecord;
  apiKey: string;
  systemInstructions: string;
  prompt: string;
  maxOutputTokens: number;
  outputSchema?: JsonValue;
  metadata?: Record<string, string>;
}

export interface AiProviderAdapter {
  execute(input: AiAdapterInput): Promise<AiExecutionResult>;
}
