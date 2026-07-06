export function renderTemplate(
  template: string,
  values: Record<string, unknown>
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key: string) => {
    const value = key.split(".").reduce<unknown>((current, part) => {
      if (current && typeof current === "object") {
        return (current as Record<string, unknown>)[part];
      }
      return undefined;
    }, values);

    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  });
}
