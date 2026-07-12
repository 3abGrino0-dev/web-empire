import type { JsonValue, ToolRecord } from "@/domain/types";

type DecorationStyle =
  | "plain"
  | "crown"
  | "stars"
  | "sparkles"
  | "hearts"
  | "flowers"
  | "brackets"
  | "double_brackets"
  | "quotes"
  | "waves"
  | "arrows"
  | "dots"
  | "underline"
  | "strike"
  | "bold"
  | "monospace"
  | "fullwidth"
  | "circled";

interface TransformOperation {
  type:
    | "trim"
    | "uppercase"
    | "lowercase"
    | "collapse_whitespace"
    | "collapse_lines"
    | "remove_whitespace"
    | "remove_diacritics"
    | "normalize_arabic"
    | "remove_punctuation"
    | "strip_html"
    | "prefix"
    | "suffix"
    | "case"
    | "reverse"
    | "sort_lines"
    | "unique_lines"
    | "repeat"
    | "slugify"
    | "hashtags"
    | "decorate"
    | "line_prefix"
    | "line_suffix"
    | "replace"
    | "stats";
  value?: string;
  value_key?: string;
  style?: DecorationStyle;
  style_key?: string;
  mode?: string;
  mode_key?: string;
  count?: number;
  count_key?: string;
  separator?: string;
  separator_key?: string;
  direction?: "asc" | "desc";
  direction_key?: string;
  labels?: Record<string, Record<string, string>>;
}

const ARABIC_DIACRITICS =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

function inputString(
  input: Record<string, unknown>,
  key: string | undefined,
  fallback = "",
): string {
  if (!key) return fallback;
  const value = input[key];
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function inputNumber(
  input: Record<string, unknown>,
  key: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number(key ? input[key] : fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

function removeDiacritics(text: string): string {
  return text.normalize("NFC").replace(ARABIC_DIACRITICS, "");
}

function normalizeArabic(text: string): string {
  return removeDiacritics(text)
    .replace(/\u0640/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

function mapAlphaNumeric(
  text: string,
  upperStart: number,
  lowerStart: number,
  digitStart: number,
): string {
  return Array.from(text)
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;

      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(upperStart + code - 65);
      }

      if (code >= 97 && code <= 122) {
        return String.fromCodePoint(lowerStart + code - 97);
      }

      if (code >= 48 && code <= 57) {
        return String.fromCodePoint(digitStart + code - 48);
      }

      return character;
    })
    .join("");
}

function fullwidth(text: string): string {
  return Array.from(text)
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;
      if (code === 32) return "\u3000";
      if (code >= 33 && code <= 126) {
        return String.fromCodePoint(code + 0xfee0);
      }
      return character;
    })
    .join("");
}

function circled(text: string): string {
  return Array.from(text)
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;

      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(0x24b6 + code - 65);
      }

      if (code >= 97 && code <= 122) {
        return String.fromCodePoint(0x24d0 + code - 97);
      }

      if (code === 48) return "\u24ea";
      if (code >= 49 && code <= 57) {
        return String.fromCodePoint(0x2460 + code - 49);
      }

      return character;
    })
    .join("");
}

function decorateText(text: string, style: string): string {
  const wrappers: Record<string, [string, string]> = {
    crown: ["♛ ", " ♛"],
    stars: ["✦ ", " ✦"],
    sparkles: ["✨ ", " ✨"],
    hearts: ["♡ ", " ♡"],
    flowers: ["༺ ", " ༻"],
    brackets: ["『", "』"],
    double_brackets: ["【", "】"],
    quotes: ["❝ ", " ❞"],
    waves: ["༄ ", " ࿐"],
    arrows: ["➤ ", " ◀"],
  };

  const wrapper = wrappers[style];
  if (wrapper) return `${wrapper[0]}${text}${wrapper[1]}`;

  if (style === "dots") return Array.from(text).join("・");
  if (style === "underline") {
    return Array.from(text)
      .map((character) => (/\s/u.test(character) ? character : `${character}\u0332`))
      .join("");
  }
  if (style === "strike") {
    return Array.from(text)
      .map((character) => (/\s/u.test(character) ? character : `${character}\u0336`))
      .join("");
  }
  if (style === "bold") {
    return mapAlphaNumeric(text, 0x1d400, 0x1d41a, 0x1d7ce);
  }
  if (style === "monospace") {
    return mapAlphaNumeric(text, 0x1d670, 0x1d68a, 0x1d7f6);
  }
  if (style === "fullwidth") return fullwidth(text);
  if (style === "circled") return circled(text);

  return text;
}

function titleCase(text: string): string {
  return text
    .toLocaleLowerCase()
    .replace(/(^|[\s\-_/])(\p{L})/gu, (_, prefix: string, letter: string) => {
      return `${prefix}${letter.toLocaleUpperCase()}`;
    });
}

function sentenceCase(text: string): string {
  const lowered = text.toLocaleLowerCase();
  return lowered.replace(/(^\s*|[.!?؟]\s+)(\p{L})/gu, (_, prefix: string, letter: string) => {
    return `${prefix}${letter.toLocaleUpperCase()}`;
  });
}

function slugify(text: string): string {
  return removeDiacritics(text)
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function createHashtags(text: string): string {
  const source = text.trim();
  if (!source) return "";

  const chunks = source.includes(",") || source.includes("\n")
    ? source.split(/[,\n]+/)
    : source.split(/\s+/);

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const chunk of chunks) {
    const normalized = removeDiacritics(chunk)
      .trim()
      .replace(/^[#\s]+/, "")
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .replace(/\s+/g, "_");

    if (!normalized) continue;
    const key = normalized.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(`#${normalized}`);
  }

  return tags.join(" ");
}

function textStats(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/u).filter(Boolean).length : 0;
  const characters = Array.from(text).length;
  const charactersWithoutSpaces = Array.from(text.replace(/\s/gu, "")).length;
  const lines = text ? text.split(/\r?\n/).length : 0;

  return {
    words,
    characters,
    charactersWithoutSpaces,
    lines,
  };
}

function localizedStatText(
  stats: ReturnType<typeof textStats>,
  operation: TransformOperation,
  localeCode: string,
): string {
  const defaults = localeCode === "ar"
    ? {
        words: "الكلمات",
        characters: "الأحرف",
        charactersWithoutSpaces: "الأحرف بدون مسافات",
        lines: "الأسطر",
      }
    : {
        words: "Words",
        characters: "Characters",
        charactersWithoutSpaces: "Characters without spaces",
        lines: "Lines",
      };

  const labels =
    operation.labels?.[localeCode] ??
    operation.labels?.[localeCode === "ar" ? "ar" : "en"] ??
    defaults;

  return [
    `${labels.words ?? defaults.words}: ${stats.words}`,
    `${labels.characters ?? defaults.characters}: ${stats.characters}`,
    `${labels.charactersWithoutSpaces ?? defaults.charactersWithoutSpaces}: ${stats.charactersWithoutSpaces}`,
    `${labels.lines ?? defaults.lines}: ${stats.lines}`,
  ].join("\n");
}

export function executeTextTransform(
  tool: ToolRecord,
  input: Record<string, unknown>,
  localeCode = "en",
): { text: string; data: JsonValue } {
  const inputKey = String(tool.runtime_config.input_key ?? "text");
  const rawOperations = tool.runtime_config.operations;
  const operations = Array.isArray(rawOperations)
    ? (rawOperations as unknown as TransformOperation[])
    : [];

  let text = String(input[inputKey] ?? "");
  const metadata: Record<string, JsonValue> = {};

  for (const operation of operations.slice(0, 30)) {
    if (operation.type === "trim") text = text.trim();
    if (operation.type === "uppercase") text = text.toLocaleUpperCase();
    if (operation.type === "lowercase") text = text.toLocaleLowerCase();

    if (operation.type === "collapse_whitespace") {
      text = text.replace(/\s+/gu, " ").trim();
    }

    if (operation.type === "collapse_lines") {
      text = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" ");
    }

    if (operation.type === "remove_whitespace") {
      text = text.replace(/\s+/gu, "");
    }

    if (operation.type === "remove_diacritics") {
      text = removeDiacritics(text);
    }

    if (operation.type === "normalize_arabic") {
      text = normalizeArabic(text);
    }

    if (operation.type === "remove_punctuation") {
      text = text.replace(/[\p{P}\p{S}]+/gu, " ").replace(/\s+/gu, " ").trim();
    }

    if (operation.type === "strip_html") {
      text = text.replace(/<[^>]*>/g, " ").replace(/\s+/gu, " ").trim();
    }

    if (operation.type === "prefix") {
      const value = inputString(input, operation.value_key, operation.value ?? "");
      text = `${value}${text}`;
    }

    if (operation.type === "suffix") {
      const value = inputString(input, operation.value_key, operation.value ?? "");
      text = `${text}${value}`;
    }

    if (operation.type === "case") {
      const mode = inputString(input, operation.mode_key, operation.mode ?? "plain");
      if (mode === "uppercase") text = text.toLocaleUpperCase();
      if (mode === "lowercase") text = text.toLocaleLowerCase();
      if (mode === "title") text = titleCase(text);
      if (mode === "sentence") text = sentenceCase(text);
    }

    if (operation.type === "reverse") {
      const mode = inputString(input, operation.mode_key, operation.mode ?? "characters");
      if (mode === "words") {
        text = text.split(/\s+/u).reverse().join(" ");
      } else if (mode === "lines") {
        text = text.split(/\r?\n/).reverse().join("\n");
      } else {
        text = Array.from(text).reverse().join("");
      }
    }

    if (operation.type === "sort_lines") {
      const direction = inputString(
        input,
        operation.direction_key,
        operation.direction ?? "asc",
      );
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right, localeCode));
      text = direction === "desc" ? lines.reverse().join("\n") : lines.join("\n");
    }

    if (operation.type === "unique_lines") {
      const seen = new Set<string>();
      text = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => {
          if (!line) return false;
          const key = line.toLocaleLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .join("\n");
    }

    if (operation.type === "repeat") {
      const count = inputNumber(input, operation.count_key, operation.count ?? 1, 1, 100);
      const separator = inputString(
        input,
        operation.separator_key,
        operation.separator ?? "\n",
      );
      text = Array.from({ length: count }, () => text).join(separator);
    }

    if (operation.type === "slugify") text = slugify(text);
    if (operation.type === "hashtags") text = createHashtags(text);

    if (operation.type === "decorate") {
      const style = inputString(input, operation.style_key, operation.style ?? "plain");
      text = decorateText(text, style);
    }

    if (operation.type === "line_prefix") {
      const value = inputString(input, operation.value_key, operation.value ?? "");
      text = text
        .split(/\r?\n/)
        .map((line) => `${value}${line}`)
        .join("\n");
    }

    if (operation.type === "line_suffix") {
      const value = inputString(input, operation.value_key, operation.value ?? "");
      text = text
        .split(/\r?\n/)
        .map((line) => `${line}${value}`)
        .join("\n");
    }

    if (operation.type === "replace") {
      const find = inputString(input, operation.value_key, operation.value ?? "");
      const replacement = inputString(
        input,
        operation.separator_key,
        operation.separator ?? "",
      );
      if (find) text = text.split(find).join(replacement);
    }

    if (operation.type === "stats") {
      const stats = textStats(text);
      metadata.stats = stats;
      text = localizedStatText(stats, operation, localeCode);
    }
  }

  return {
    text,
    data: {
      text,
      ...metadata,
    },
  };
}
