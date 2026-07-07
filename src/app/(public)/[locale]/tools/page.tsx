import { notFound } from "next/navigation";

import { ToolCard } from "@/components/tool-card";
import { translate } from "@/localization/messages";
import { getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getActiveTools } from "@/repositories/catalog";

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const [tools, messages] = await Promise.all([
    getActiveTools(locale.code),
    getUiMessages(locale),
  ]);

  return (
    <main className="editorial-page">
      <section className="editorial-page-hero">
        <div className="container editorial-page-hero-grid">
          <div>
            <p className="empire-section-kicker">TOOL FACTORY / {tools.length}</p>
            <h1 className="editorial-page-title">{translate(messages, "tools.title")}</h1>
          </div>
          <p className="editorial-page-intro">{translate(messages, "tools.description")}</p>
        </div>
      </section>

      <section className="editorial-tools-wrap">
        <div className="container editorial-tools-grid">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} locale={locale.code} messages={messages} />
          ))}
        </div>
      </section>
    </main>
  );
}
