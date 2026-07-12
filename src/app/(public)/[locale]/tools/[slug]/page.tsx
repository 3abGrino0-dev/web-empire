import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DynamicToolForm } from "@/components/dynamic-tool-form";
import { translate } from "@/localization/messages";
import {
  getActiveLocales,
  getLocaleByCode,
  getUiMessages,
} from "@/localization/repository";
import { getToolBySlug } from "@/repositories/catalog";

import styles from "./tool-detail.module.css";

const copy = {
  ar: {
    instant: "أداة حساب فورية",
    smart: "أداة ذكية",
    back: "العودة إلى مكتبة الأدوات",
    free: "مجاني",
    points: "نقطة",
    guide: "دليل الاستخدام",
    guideTitle: "استخدم الأداة بثقة",
    guideBody:
      "أدخل البيانات المطلوبة، راجع النتيجة، ثم انسخها أو احفظها بالصورة أو PDF حسب نوع الأداة.",
    when: "متى تستخدمها؟",
    whenBody: "عندما تحتاج إلى نتيجة سريعة وواضحة دون بناء معادلة أو ملف يدوي.",
    steps: "طريقة الاستخدام",
    stepsBody: "أدخل القيم، شغّل الأداة، ثم راجع النتيجة والتفاصيل المقترحة.",
    note: "ملاحظة",
    noteBody: "راجع الأرقام والسياق قبل اتخاذ أي قرار مالي أو تجاري.",
  },
  en: {
    instant: "Instant calculator",
    smart: "Smart tool",
    back: "Back to tools library",
    free: "Free",
    points: "credits",
    guide: "Usage guide",
    guideTitle: "Use the tool with confidence",
    guideBody:
      "Enter the required data, review the result, then copy or export it as an image or PDF depending on the tool.",
    when: "When to use it",
    whenBody: "Use it when you need a clear result without building a manual formula or spreadsheet.",
    steps: "How it works",
    stepsBody: "Enter values, run the tool, then review the result and supporting details.",
    note: "Note",
    noteBody: "Review the figures and context before making financial or business decisions.",
  },
};

function toolGlyph(slug: string, title: string): string {
  const value = `${slug} ${title}`.toLowerCase();

  if (value.includes("vat") || value.includes("ضريبة")) return "VAT";
  if (value.includes("percent") || value.includes("نسبة")) return "%";
  if (value.includes("roi") || value.includes("عائد")) return "↗";
  if (value.includes("margin") || value.includes("هامش")) return "◔";
  if (value.includes("invoice") || value.includes("فاتور")) return "▤";
  if (value.includes("content") || value.includes("محتوى")) return "T";
  return "◇";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const [tool, activeLocales] = await Promise.all([
    getToolBySlug(slug, locale),
    getActiveLocales(),
  ]);

  if (!tool) return {};

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    alternates: {
      canonical: `/${locale}/tools/${slug}`,
      languages: Object.fromEntries([
        ...activeLocales.map((item) => [
          item.locale_code,
          `/${item.code}/tools/${slug}`,
        ]),
        ["x-default", `/en/tools/${slug}`],
      ]),
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeCode, slug } = await params;
  const locale = await getLocaleByCode(localeCode);

  if (!locale) notFound();

  const [tool, messages] = await Promise.all([
    getToolBySlug(slug, locale.code),
    getUiMessages(locale),
  ]);

  if (!tool) notFound();

  const isArabic = locale.code === "ar";
  const t = isArabic ? copy.ar : copy.en;

  const pricing =
    tool.pricing_mode === "free"
      ? t.free
      : tool.pricing_mode === "fixed"
        ? `${Number(tool.fixed_points).toLocaleString(locale.locale_code)} ${t.points}`
        : `${Number(tool.minimum_points).toLocaleString(locale.locale_code)}+ ${t.points}`;

  const engineLabel =
    tool.engine_type === "formula" ? t.instant : t.smart;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: tool.localizedDescription,
    offers: {
      "@type": "Offer",
      price:
        tool.pricing_mode === "free"
          ? "0"
          : String(Number(tool.fixed_points ?? tool.minimum_points ?? 0)),
      priceCurrency: "SAR",
    },
  };

  return (
    <main className={`${styles.page} we-page`}>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />

      <div className="we-container">
        <section className={styles.hero}>
          <div className={styles.icon} aria-hidden="true">
            {toolGlyph(tool.slug, tool.title)}
          </div>

          <div className={styles.copy}>
            <p className={styles.kicker}>{engineLabel}</p>
            <h1>{tool.title}</h1>
            <p>{tool.localizedDescription}</p>
          </div>

          <div className={styles.actions}>
            <div className={styles.badges}>
              <span>{pricing}</span>
              <span>{engineLabel}</span>
            </div>

            <Link className={styles.back} href={`/${locale.code}/tools`}>
              ← {t.back}
            </Link>
          </div>
        </section>

        <section className={styles.workbench}>
          <DynamicToolForm
            engineType={tool.engine_type}
            locale={locale.code}
            messages={messages}
            schema={tool.localizedInputSchema}
            slug={tool.slug}
            toolTitle={tool.title}
          />
        </section>

        <section className={styles.guide}>
          <div className={styles.guideHeader}>
            <p>{t.guide}</p>
            <h2>{t.guideTitle}</h2>
            <span>{t.guideBody}</span>
          </div>

          <div className={styles.guideGrid}>
            <article>
              <h3>{t.when}</h3>
              <p>{t.whenBody}</p>
            </article>
            <article>
              <h3>{t.steps}</h3>
              <p>{t.stepsBody}</p>
            </article>
            <article>
              <h3>{t.note}</h3>
              <p>{t.noteBody}</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
