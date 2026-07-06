import Link from "next/link";

import { ColorModeToggle } from "@/components/appearance/color-mode-toggle";
import { LanguageSwitcher } from "@/components/localization/language-switcher";
import type { ColorMode, HeaderStyle } from "@/appearance/types";
import type { LocaleRecord, SiteIdentity, UiMessages } from "@/localization/types";
import { translate } from "@/localization/messages";

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
    <header className={`site-header header-${headerStyle}`}>
      <div className="container header-inner">
        <Link href={prefix} className="brand">
          <span className="brand-crown">♛</span>
          <span>{identity.siteName}</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href={prefix}>{translate(messages, "nav.home")}</Link>
          <Link href={`${prefix}/tools`}>{translate(messages, "nav.tools")}</Link>
          <Link href={`${prefix}/pricing`}>{translate(messages, "nav.pricing")}</Link>
          <Link href={`${prefix}/dashboard`}>{translate(messages, "nav.dashboard")}</Link>
        </nav>
        <ColorModeToggle defaultMode={defaultColorMode} />
        <LanguageSwitcher
          locales={locales}
          currentLocale={locale.code}
          label={translate(messages, "language.label")}
        />
        <Link href={`${prefix}/auth/login`} className="button button-ghost">
          {translate(messages, "nav.login")}
        </Link>
      </div>
    </header>
  );
}
