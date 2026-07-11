import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DynamicToolForm } from "@/components/dynamic-tool-form";
import { translate } from "@/localization/messages";
import { getActiveLocales, getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getToolBySlug } from "@/repositories/catalog";

const detailCopy = {
  ar: {
    access: "الوصول",
    free: "مجاني",
    workbench: "منضدة التشغيل",
    formula: "FORMULA",
    input: "إدخال",
    run: "تشغيل",
    result: "نتيجة",
    guideTitle: "شرح استخدام الأداة",
    whatIs: "ما هي الأداة؟",
    whenUse: "متى تستخدمها؟",
    steps: "طريقة الاستخدام",
    example: "مثال سريع",
    notes: "ملاحظات مهمة",
    seoTitle: "محتوى تفصيلي يساعدك على فهم الأداة",
    related: "العودة إلى مكتبة الأدوات",
    stepOne: "أدخل القيم المطلوبة في الحقول.",
    stepTwo: "اضغط زر التشغيل.",
    stepThree: "راجع النتيجة واقرأ شرحها.",
    hiddenWarning: "المحتوى هنا ظاهر وقابل للفتح للمستخدم، وليس محتوى مخفيًا.",
  },
  en: {
    access: "Access",
    free: "Free",
    workbench: "Workbench",
    formula: "FORMULA",
    input: "Input",
    run: "Run",
    result: "Result",
    guideTitle: "How to use this tool",
    whatIs: "What is this tool?",
    whenUse: "When should you use it?",
    steps: "How it works",
    example: "Quick example",
    notes: "Important notes",
    seoTitle: "Detailed content to help you understand the tool",
    related: "Back to tools library",
    stepOne: "Enter the required values.",
    stepTwo: "Run the tool.",
    stepThree: "Review the result and explanation.",
    hiddenWarning: "This content is visible and expandable for users, not hidden SEO text.",
  },
};

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
        ...activeLocales.map((item) => [item.locale_code, `/${item.code}/tools/${slug}`]),
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
  const copy = isArabic ? detailCopy.ar : detailCopy.en;

  const pricing =
    tool.pricing_mode === "free"
      ? translate(messages, "common.free")
      : tool.pricing_mode === "fixed"
        ? `${Number(tool.fixed_points).toLocaleString(locale.locale_code)} ${translate(messages, "common.points")}`
        : `${Number(tool.minimum_points).toLocaleString(locale.locale_code)}+ ${translate(messages, "common.points")}`;

  const firstField = tool.localizedInputSchema.fields[0]?.label ?? (isArabic ? "القيمة الأولى" : "First value");
  const secondField = tool.localizedInputSchema.fields[1]?.label ?? (isArabic ? "القيمة الثانية" : "Second value");
  const fieldNames = tool.localizedInputSchema.fields.map((field) => field.label).join(isArabic ? "، " : ", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: tool.localizedDescription,
    offers: {
      "@type": "Offer",
      price: tool.pricing_mode === "free" ? "0" : String(Number(tool.fixed_points ?? tool.minimum_points ?? 0)),
      priceCurrency: "SAR",
    },
    featureList: [copy.stepOne, copy.stepTwo, copy.stepThree],
  };

  return (
    <main className="we-page we-tool-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="we-container we-tool-hero">
        <div className="we-tool-hero-copy">
          <p className="we-simple-kicker">
            {copy.workbench} - {copy.formula}
          </p>
          <h1>{tool.title}</h1>
          <p>{tool.localizedDescription}</p>

          <div className="we-tool-hero-actions">
            <span>
              {copy.access}: {pricing}
            </span>
            <Link href={`/${locale.code}/tools`} className="we-button-ghost">
              ← {copy.related}
            </Link>
          </div>
        </div>

        <div className="we-tool-perspective" aria-hidden="true">
          <div className="we-tool-perspective-card">
            <img src="/brand/web-empire-mark.svg" alt="" width="72" height="72" />
            <div>
              <small>{copy.input}</small>
              <strong>{firstField}</strong>
            </div>
            <div>
              <small>{copy.run}</small>
              <strong>{tool.localizedInputSchema.submitLabel}</strong>
            </div>
            <div>
              <small>{copy.result}</small>
              <strong>{copy.result}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="we-container we-tool-workbench-section">
        <DynamicToolForm slug={tool.slug} locale={locale.code} schema={tool.localizedInputSchema} messages={messages} />
      </section>

      <section className="we-container we-tool-guide">
        <div className="we-tool-guide-main">
          <p className="we-simple-kicker">{copy.guideTitle}</p>
          <h2>{copy.whatIs}</h2>
          <p>
            {isArabic
              ? `${tool.title} تساعدك على تنفيذ العملية بسرعة من خلال إدخال ${fieldNames || "القيم المطلوبة"} ثم الحصول على نتيجة واضحة مباشرة.`
              : `${tool.title} helps you complete the calculation quickly by entering ${fieldNames || "the required values"} and getting a clear result instantly.`}
          </p>

          <div className="we-tool-guide-grid">
            <article>
              <h3>{copy.whenUse}</h3>
              <p>
                {isArabic
                  ? "استخدمها عندما تحتاج نتيجة سريعة بدون فتح ملف Excel أو بناء معادلة يدويًا."
                  : "Use it when you need a quick result without opening a spreadsheet or building a formula manually."}
              </p>
            </article>
            <article>
              <h3>{copy.example}</h3>
              <p>
                {isArabic
                  ? `مثال: أدخل ${firstField} و${secondField}، ثم اضغط تشغيل لمشاهدة النتيجة مباشرة.`
                  : `Example: enter ${firstField} and ${secondField}, then run the tool to see the result.`}
              </p>
            </article>
            <article>
              <h3>{copy.notes}</h3>
              <p>
                {isArabic
                  ? "تأكد من إدخال أرقام صحيحة ومراجعة النتيجة حسب سياق عملك."
                  : "Make sure you enter valid values and review the result in your business context."}
              </p>
            </article>
          </div>
        </div>

        <details className="we-tool-seo-accordion">
          <summary>{copy.seoTitle}</summary>
          <div>
            <p>{copy.hiddenWarning}</p>
            <ol>
              <li>{copy.stepOne}</li>
              <li>{copy.stepTwo}</li>
              <li>{copy.stepThree}</li>
            </ol>
            <p>
              {isArabic
                ? `هذه الصفحة مخصصة لشرح ${tool.title}، طريقة استخدامها، أمثلة عملية، وأفضل الحالات التي تناسبها.`
                : `This page explains ${tool.title}, how to use it, practical examples, and the best use cases for it.`}
            </p>
          </div>
        </details>
      </section>
    </main>
  );
}
