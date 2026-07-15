import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DynamicToolForm } from "@/components/dynamic-tool-form";
import {
  MediaToolWorkbench,
  type MediaToolMode,
} from "@/components/media-tools/media-tool-workbench";
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
    media: "أداة وسائط محلية",
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
    mediaGuideBody:
      "اختر ملفك أو أدخل رابطًا مباشرًا، واضبط الصيغة والجودة ثم ابدأ المعالجة المحلية.",
    mediaWhenBody:
      "عندما تحتاج إلى تنزيل ملف مباشر مصرح به أو تحويل وضغط وقص فيديو دون رفعه إلى خادم خارجي.",
    mediaStepsBody:
      "اختر الملف، حدد الإعدادات، انتظر اكتمال المعالجة ثم نزّل الملف الناتج.",
    mediaNoteBody:
      "استخدم فقط الملفات التي تملكها أو لديك تصريح بها. لا تدعم الأدوات تجاوز DRM أو حماية المنصات.",
  },
  en: {
    instant: "Instant calculator",
    smart: "Smart tool",
    media: "Local media tool",
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
    mediaGuideBody:
      "Choose a file or enter a direct URL, select format and quality, then start local processing.",
    mediaWhenBody:
      "Use it to download an authorized direct file or convert, compress, and trim video without uploading it to an external server.",
    mediaStepsBody:
      "Choose the file, set the options, wait for processing, then download the generated file.",
    mediaNoteBody:
      "Use only files you own or are authorized to use. These tools do not bypass DRM or platform protections.",
  },
};

function toolGlyph(slug: string, title: string): string {
  const value = `${slug} ${title}`.toLowerCase();

  if (value.includes("decorate") || value.includes("زخرف")) return "✦";
  if (value.includes("hashtag") || value.includes("هاشتاق")) return "#";
  if (value.includes("slug") || value.includes("رابط مختصر")) return "/";
  if (value.includes("email") || value.includes("بريد")) return "@";
  if (value.includes("whatsapp") || value.includes("واتساب")) return "☏";
  if (value.includes("download") || value.includes("تحميل")) return "⇩";
  if (value.includes("video") || value.includes("فيديو") || value.includes("مقطع")) return "▶";
  if (value.includes("youtube") || value.includes("يوتيوب")) return "▶";
  if (value.includes("seo") || value.includes("keyword") || value.includes("كلمة مفتاحية")) return "⌕";
  if (value.includes("summar") || value.includes("ملخص")) return "≡";
  if (value.includes("rewrite") || value.includes("proof") || value.includes("صياغ") || value.includes("تدقيق")) return "✎";
  if (value.includes("social") || value.includes("caption") || value.includes("منشور") || value.includes("كابشن")) return "◉";
  if (value.includes("meeting") || value.includes("proposal") || value.includes("اجتماع") || value.includes("عرض خدمات")) return "▤";
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

  const runtimeKind =
    typeof tool.runtime_config.runtimeKind === "string"
      ? tool.runtime_config.runtimeKind
      : "";
  const mediaModes: MediaToolMode[] = [
    "video_downloader",
    "video_converter",
    "video_compressor",
    "video_trimmer",
  ];
  const mediaMode = mediaModes.includes(runtimeKind as MediaToolMode)
    ? (runtimeKind as MediaToolMode)
    : null;
  const engineLabel = mediaMode
    ? t.media
    : tool.engine_type === "formula"
      ? t.instant
      : t.smart;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: mediaMode ? "MultimediaApplication" : "BusinessApplication",
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
          {mediaMode ? (
            <MediaToolWorkbench
              locale={locale.code}
              maxDownloadMb={
                typeof tool.runtime_config.maxDownloadMb === "number"
                  ? tool.runtime_config.maxDownloadMb
                  : undefined
              }
              maxFileSizeMb={
                typeof tool.runtime_config.maxFileSizeMb === "number"
                  ? tool.runtime_config.maxFileSizeMb
                  : undefined
              }
              mode={mediaMode}
              toolTitle={tool.title}
            />
          ) : (
            <DynamicToolForm
              engineType={tool.engine_type}
              locale={locale.code}
              messages={messages}
              pricingMode={tool.pricing_mode}
              runtimeConfig={tool.runtime_config}
              schema={tool.localizedInputSchema}
              slug={tool.slug}
              toolTitle={tool.title}
            />
          )}
        </section>

        <section className={styles.guide}>
          <div className={styles.guideHeader}>
            <p>{t.guide}</p>
            <h2>{t.guideTitle}</h2>
            <span>{mediaMode ? t.mediaGuideBody : t.guideBody}</span>
          </div>

          <div className={styles.guideGrid}>
            <article>
              <h3>{t.when}</h3>
              <p>{mediaMode ? t.mediaWhenBody : t.whenBody}</p>
            </article>
            <article>
              <h3>{t.steps}</h3>
              <p>{mediaMode ? t.mediaStepsBody : t.stepsBody}</p>
            </article>
            <article>
              <h3>{t.note}</h3>
              <p>{mediaMode ? t.mediaNoteBody : t.noteBody}</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
