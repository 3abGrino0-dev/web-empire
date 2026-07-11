import Link from "next/link";

import styles from "./tools-explorer.module.css";

export interface ToolExplorerItem {
  slug: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  engineType: string;
  pricingMode: "free" | "fixed" | "dynamic";
  fixedPoints: number;
  minimumPoints: number;
  isFeatured: boolean;
  order: number;
}

interface ToolCardProps {
  tool: ToolExplorerItem;
  prefix: string;
  locale: string;
}

function toolGlyph(tool: ToolExplorerItem): string {
  const value = `${tool.slug} ${tool.title}`.toLowerCase();

  if (value.includes("vat") || value.includes("ضريبة")) return "VAT";
  if (value.includes("percent") || value.includes("نسبة")) return "%";
  if (value.includes("roi") || value.includes("عائد")) return "↗";
  if (value.includes("margin") || value.includes("هامش")) return "◔";
  if (value.includes("invoice") || value.includes("فاتور")) return "▤";
  if (value.includes("content") || value.includes("محتوى")) return "T";
  if (value.includes("name") || value.includes("اسم")) return "✦";
  if (value.includes("analysis") || value.includes("تحليل")) return "⌁";
  if (tool.engineType.startsWith("ai_")) return "✧";
  if (tool.engineType === "formula") return "∑";

  return "◇";
}

export function ToolCard({ tool, prefix, locale }: ToolCardProps) {
  const isArabic = locale === "ar";

  const pricing =
    tool.pricingMode === "free"
      ? isArabic
        ? "مجاني"
        : "Free"
      : tool.pricingMode === "fixed"
        ? `${tool.fixedPoints} ${isArabic ? "نقطة" : "credits"}`
        : `${tool.minimumPoints}+ ${isArabic ? "نقطة" : "credits"}`;

  const engineLabel = tool.engineType.startsWith("ai_")
    ? isArabic
      ? "ذكاء اصطناعي"
      : "AI"
    : tool.engineType === "formula"
      ? isArabic
        ? "نتيجة فورية"
        : "Instant result"
      : isArabic
        ? "أداة ذكية"
        : "Smart tool";

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.thumbnail} aria-hidden="true">
          <span>{toolGlyph(tool)}</span>
        </div>

        <div className={styles.badges}>
          {tool.isFeatured ? (
            <span className={styles.featuredBadge}>
              {isArabic ? "مميزة" : "Featured"}
            </span>
          ) : null}
          <span className={styles.engineBadge}>{engineLabel}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.categoryName}>{tool.categoryName}</p>
        <h3>{tool.title}</h3>
        <p className={styles.description}>{tool.description}</p>
      </div>

      <div className={styles.cardMeta}>
        <span>{pricing}</span>
        <span>{tool.engineType === "formula" ? "≈ 0.1s" : "≈ 3–15s"}</span>
      </div>

      <Link className={styles.useButton} href={`${prefix}/tools/${tool.slug}`}>
        <span>{isArabic ? "استخدم الأداة" : "Use tool"}</span>
        <span aria-hidden="true">←</span>
      </Link>
    </article>
  );
}
