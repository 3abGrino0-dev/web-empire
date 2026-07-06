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
    <main className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">TOOL FACTORY</div>
            <h2>{translate(messages, "tools.title")}</h2>
            <p>{translate(messages, "tools.description")}</p>
          </div>
        </div>
        <div className="tools-grid">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} locale={locale.code} messages={messages} />
          ))}
        </div>
      </div>
    </main>
  );
}
