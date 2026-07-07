import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DynamicToolForm } from "@/components/dynamic-tool-form";
import { translate } from "@/localization/messages";
import { getActiveLocales, getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getToolBySlug } from "@/repositories/catalog";

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

  const pricing =
    tool.pricing_mode === "free"
      ? translate(messages, "common.free")
      : tool.pricing_mode === "fixed"
        ? `${tool.fixed_points} ${translate(messages, "common.points")}`
        : `${tool.minimum_points}+ ${translate(messages, "common.points")}`;

  return (
    <main className="editorial-tool-page">
      <section className="editorial-tool-hero">
        <div className="container editorial-tool-hero-grid">
          <div>
            <p className="empire-section-kicker">{tool.engine_type.replaceAll("_", " ")}</p>
            <h1 className="editorial-tool-title">{tool.title}</h1>
            <p className="editorial-tool-description">{tool.localizedDescription}</p>
          </div>

          <div className="editorial-tool-meta">
            <span><b>ENGINE</b><em>{tool.engine_type}</em></span>
            <span><b>PRICE</b><em>{pricing}</em></span>
          </div>
        </div>
      </section>

      <section className="container editorial-runner-wrap">
        <DynamicToolForm
          slug={tool.slug}
          locale={locale.code}
          schema={tool.localizedInputSchema}
          messages={messages}
        />
      </section>
    </main>
  );
}
