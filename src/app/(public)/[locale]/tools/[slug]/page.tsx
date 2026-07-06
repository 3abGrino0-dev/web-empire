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
    <main className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">{tool.engine_type}</div>
            <h2>{tool.title}</h2>
            <p>{tool.localizedDescription}</p>
          </div>
          <span className="badge">
            {tool.pricing_mode === "free"
              ? translate(messages, "common.free")
              : tool.pricing_mode === "fixed"
                ? `${tool.fixed_points} ${translate(messages, "common.points")}`
                : `${tool.minimum_points}+ ${translate(messages, "common.points")}`}
          </span>
        </div>

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
