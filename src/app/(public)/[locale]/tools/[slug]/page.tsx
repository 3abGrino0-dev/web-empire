import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DynamicToolForm } from "@/components/dynamic-tool-form";
import { ToolDetailHero } from "@/components/public/tool-detail-hero";
import { translate } from "@/localization/messages";
import { getActiveLocales, getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getToolBySlug } from "@/repositories/catalog";

const detailCopy: Record<string, { access: string; workflowInput: string; workflowRun: string; workflowResult: string }> = {
  ar: { access: "الوصول", workflowInput: "إدخال", workflowRun: "تشغيل", workflowResult: "نتيجة" },
  en: { access: "Access", workflowInput: "Input", workflowRun: "Run", workflowResult: "Result" },
  fr: { access: "Acces", workflowInput: "Entree", workflowRun: "Execution", workflowResult: "Resultat" },
  tr: { access: "Erisim", workflowInput: "Girdi", workflowRun: "Calistir", workflowResult: "Sonuc" },
  ur: { access: "رسائی", workflowInput: "ان پٹ", workflowRun: "رن", workflowResult: "نتیجہ" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const [tool, activeLocales] = await Promise.all([getToolBySlug(slug, locale), getActiveLocales()]);
  if (!tool) return {};
  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    alternates: {
      canonical: `/${locale}/tools/${slug}`,
      languages: Object.fromEntries([...activeLocales.map((item) => [item.locale_code, `/${item.code}/tools/${slug}`]), ["x-default", `/en/tools/${slug}`]]),
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeCode, slug } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();
  const [tool, messages] = await Promise.all([getToolBySlug(slug, locale.code), getUiMessages(locale)]);
  if (!tool) notFound();
  const copy = detailCopy[locale.code] ?? detailCopy.en;

  const pricing =
    tool.pricing_mode === "free"
      ? translate(messages, "common.free")
      : tool.pricing_mode === "fixed"
        ? `${Number(tool.fixed_points).toLocaleString(locale.locale_code)} ${translate(messages, "common.points")}`
        : `${Number(tool.minimum_points).toLocaleString(locale.locale_code)}+ ${translate(messages, "common.points")}`;

  return (
    <main className="editorial-tool-page">
      <ToolDetailHero
        engineCode={tool.engine_type}
        title={tool.title}
        description={tool.localizedDescription}
        accessLabel={copy.access}
        pricing={pricing}
        copy={{
          workflowInput: copy.workflowInput,
          workflowRun: copy.workflowRun,
          workflowResult: copy.workflowResult,
        }}
      />

      <section className="container editorial-runner-wrap">
        <DynamicToolForm slug={tool.slug} locale={locale.code} schema={tool.localizedInputSchema} messages={messages} />
      </section>
    </main>
  );
}
