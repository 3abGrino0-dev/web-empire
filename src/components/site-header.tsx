import Link from "next/link";

import { ColorModeToggle } from "@/components/appearance/color-mode-toggle";
import { LanguageSwitcher } from "@/components/localization/language-switcher";
import type { ColorMode, HeaderStyle } from "@/appearance/types";
import type { LocaleRecord, SiteIdentity, UiMessages } from "@/localization/types";
import { translate } from "@/localization/messages";

const processLabels: Record<string, string> = {
  ar: "كيف تعمل",
  en: "How it works",
  fr: "Comment ça marche",
  tr: "Nasıl çalışır",
  ur: "یہ کیسے کام کرتا ہے",
};

export function SiteHeader({
  locale,
  locales,
  identity,
  messages,
  headerStyle,
  defaultColorMode,
}: {
  locale: LocaleRecord;
  locales: LocaleRecord[];
  identity: SiteIdentity;
  messages: UiMessages;
  headerStyle: HeaderStyle;
  defaultColorMode: ColorMode;
}) {
  const prefix = `/${locale.code}`;

  return (
    <header className={`site-header empire-header header-${headerStyle}`}>
      <div className="container header-inner empire-header-inner">
        <Link href={prefix} className="brand empire-brand">
          <span className="brand-crown" aria-hidden="true">♛</span>
          <span>{identity.siteName}</span>
        </Link>

        <nav className="main-nav empire-nav" aria-label="Main navigation">
          <Link href={`${prefix}/tools`}>{translate(messages, "nav.tools")}</Link>
          <Link href={`${prefix}/pricing`}>{translate(messages, "nav.pricing")}</Link>
          <Link href={`${prefix}#empire-process`}>{processLabels[locale.code] ?? processLabels.en}</Link>
        </nav>

        <div className="header-actions empire-header-actions">
          <LanguageSwitcher locales={locales} currentLocale={locale.code} label={translate(messages, "language.label")} />
          <Link href={`${prefix}/auth/login`} className="button button-ghost header-login-btn">{translate(messages, "nav.login")}</Link>
          <Link href={`${prefix}/tools`} className="button button-primary empire-header-cta">{translate(messages, "home.explore")}</Link>
          <div className="empire-utility-controls" aria-label="Display controls">
            <ColorModeToggle defaultMode={defaultColorMode} />
          </div>
        </div>
      </div>
    </header>
  );
}
