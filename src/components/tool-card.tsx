import Link from "next/link";

import type { LocalizedToolRecord } from "@/domain/types";
import type { UiMessages } from "@/localization/types";
import { translate } from "@/localization/messages";

export function ToolCard({
  tool,
  locale,
  messages,
}: {
  tool: LocalizedToolRecord;
  locale: string;
  messages: UiMessages;
}) {
  const pricing =
    tool.pricing_mode === "free"
      ? translate(messages, "common.free")
      : tool.pricing_mode === "fixed"
        ? `${tool.fixed_points} ${translate(messages, "common.points")}`
        : `${tool.minimum_points}+ ${translate(messages, "common.points")}`;

  return (
    <Link href={`/${locale}/tools/${tool.slug}`} className="tool-card empire-tool-card">
      <div className="tool-card-top">
        <span className="tool-card-engine">{tool.engine_type.startsWith("ai_") ? "AI" : tool.engine_type.replaceAll("_", " ")}</span>
        <span className="tool-card-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="tool-card-copy"><h3>{tool.title}</h3><p>{tool.localizedDescription}</p></div>
      <div className="tool-card-meta"><span>{tool.slug.replaceAll("-", " ")}</span><span>{pricing}</span></div>
    </Link>
  );
}
