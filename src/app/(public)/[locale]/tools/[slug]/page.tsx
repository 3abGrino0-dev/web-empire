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

  return (
    <main className="section-shell">
      <div className="container">
        <section className="tool-hero ui-card">
          <div className="tool-hero-content">
            <div className="ui-badge">{tool.engine_type}</div>
            <h1>{tool.title}</h1>
            <p>{tool.localizedDescription}</p>
            <div className="tool-hero-meta">
              <span className="ui-badge">{tool.pricing_mode === "free" ? translate(messages, "common.free") : "Credits"}</span>
              <span className="tool-price-pill">
                {tool.pricing_mode === "free"
                  ? translate(messages, "common.free")
                  : tool.pricing_mode === "fixed"
                    ? `${tool.fixed_points} ${translate(messages, "common.points")}`
                    : `${tool.minimum_points}+ ${translate(messages, "common.points")}`}
              </span>
            </div>
          </div>
          <div className="tool-hero-glow" aria-hidden="true" />
        </section>

        <DynamicToolForm
          slug={tool.slug}
          locale={locale.code}
          schema={tool.localizedInputSchema}
          messages={messages}
        />
      </div>
    </main>
  );
}
