import type { ToolInputSchema } from "@/domain/types";

export function validateDynamicInput(
  schema: ToolInputSchema,
  input: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of schema.fields) {
    const value = input[field.key];

    if (field.required && (value === undefined || value === null || value === "")) {
      errors[field.key] = "هذا الحقل مطلوب.";
      continue;
    }

    if (value === undefined || value === null || value === "") continue;

    if (field.type === "number") {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        errors[field.key] = "أدخل رقمًا صحيحًا.";
        continue;
      }
      if (field.min !== undefined && numeric < field.min) {
        errors[field.key] = `القيمة يجب ألا تقل عن ${field.min}.`;
      }
      if (field.max !== undefined && numeric > field.max) {
        errors[field.key] = `القيمة يجب ألا تزيد عن ${field.max}.`;
      }
    }

    if (typeof value === "string" && field.maxLength && value.length > field.maxLength) {
      errors[field.key] = `الحد الأقصى ${field.maxLength} حرفًا.`;
    }
  }

  return errors;
}
