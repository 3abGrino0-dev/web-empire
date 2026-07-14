interface ToolIconProps {
  slug?: string;
  title?: string;
  engineType?: string;
  className?: string;
}

type IconKind =
  | "ai"
  | "social"
  | "finance"
  | "percent"
  | "calculator"
  | "text"
  | "tools";

function resolveIconKind(
  slug: string,
  title: string,
  engineType: string,
): IconKind {
  const value = `${slug} ${title} ${engineType}`.toLowerCase();

  if (
    value.includes("social") ||
    value.includes("caption") ||
    value.includes("instagram") ||
    value.includes("tiktok") ||
    value.includes("linkedin") ||
    value.includes("منشور") ||
    value.includes("كابشن")
  ) {
    return "social";
  }

  if (
    value.includes("vat") ||
    value.includes("tax") ||
    value.includes("invoice") ||
    value.includes("ضريبة") ||
    value.includes("فاتور")
  ) {
    return "finance";
  }

  if (
    value.includes("percent") ||
    value.includes("discount") ||
    value.includes("margin") ||
    value.includes("نسبة") ||
    value.includes("خصم") ||
    value.includes("هامش")
  ) {
    return "percent";
  }

  if (
    value.includes("summar") ||
    value.includes("rewrite") ||
    value.includes("text") ||
    value.includes("ملخص") ||
    value.includes("نص") ||
    value.includes("صياغ")
  ) {
    return "text";
  }

  if (
    engineType === "formula" ||
    value.includes("calculator") ||
    value.includes("حاسبة")
  ) {
    return "calculator";
  }

  if (
    engineType.startsWith("ai_") ||
    value.includes("content") ||
    value.includes("ai") ||
    value.includes("محتوى") ||
    value.includes("ذكاء")
  ) {
    return "ai";
  }

  return "tools";
}

export function ToolIcon({
  slug = "",
  title = "",
  engineType = "",
  className,
}: ToolIconProps) {
  const kind = resolveIconKind(slug, title, engineType);
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (kind === "social") {
    return (
      <svg {...common}>
        <circle cx="6" cy="12" r="2.4" />
        <circle cx="18" cy="6" r="2.4" />
        <circle cx="18" cy="18" r="2.4" />
        <path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8" />
      </svg>
    );
  }

  if (kind === "finance") {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M8 7h8M8 11h3M15 11h1M8 15h1M12 15h1M16 15h1M8 18h1M12 18h1M16 18h1" />
      </svg>
    );
  }

  if (kind === "percent") {
    return (
      <svg {...common}>
        <circle cx="7.5" cy="7.5" r="2.2" />
        <circle cx="16.5" cy="16.5" r="2.2" />
        <path d="M18.5 5.5 5.5 18.5" />
      </svg>
    );
  }

  if (kind === "calculator") {
    return (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h2M14 18h2" />
      </svg>
    );
  }

  if (kind === "text") {
    return (
      <svg {...common}>
        <path d="M5 6h14M5 10h14M5 14h9M5 18h7" />
        <path d="m17 15 1.1 2.1L20 18l-1.9.9L17 21l-1.1-2.1L14 18l1.9-.9L17 15Z" />
      </svg>
    );
  }

  if (kind === "ai") {
    return (
      <svg {...common}>
        <path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3Z" />
        <path d="m18 13 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13Z" />
        <path d="m6 14 .7 1.8 1.8.7-1.8.7L6 19l-.7-1.8-1.8-.7 1.8-.7L6 14Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <path d="M17 14v7M13.5 17.5h7" />
    </svg>
  );
}
