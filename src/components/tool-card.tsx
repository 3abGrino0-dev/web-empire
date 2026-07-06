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
  return (
    <Link href={`/${locale}/tools/${tool.slug}`} className="tool-card">
      <div className="tool-icon">{tool.engine_type.startsWith("ai_") ? "AI" : "↗"}</div>
      <div>
        <h3>{tool.title}</h3>
        <p>{tool.localizedDescription}</p>
      </div>
      <div className="tool-meta">
        <span>{tool.engine_type.startsWith("ai_") ? "AI" : tool.engine_type}</span>
        <span>
          {tool.pricing_mode === "free"
            ? translate(messages, "common.free")
            : tool.pricing_mode === "fixed"
              ? `${tool.fixed_points} ${translate(messages, "common.points")}`
              : `${tool.minimum_points}+ ${translate(messages, "common.points")}`}
        </span>
      </div>
    </Link>
  );
}
