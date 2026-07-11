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

const pricingLabels: Record<string, string> = {
  ar: "النقاط والخطط",
  en: "Plans & credits",
  fr: "Offres et credits",
  tr: "Planlar ve krediler",
  ur: "پلان اور کریڈٹس",
};

const menuLabels: Record<string, string> = {
  ar: "القائمة",
  en: "Menu",
  fr: "Menu",
  tr: "Menu",
  ur: "مینو",
};

const brandLabels: Record<string, { name: string; system: string }> = {
  ar: { name: "إمبراطورية الويب", system: "WEB EMPIRE" },
  en: { name: "WEB EMPIRE", system: "COMMAND SYSTEM" },
  fr: { name: "WEB EMPIRE", system: "COMMAND SYSTEM" },
  tr: { name: "WEB EMPIRE", system: "COMMAND SYSTEM" },
  ur: { name: "WEB EMPIRE", system: "COMMAND SYSTEM" },
};

export function SiteHeader({
  locale,
  locales,
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
  const brand = brandLabels[locale.code] ?? brandLabels.en;

  return (
    <header className={`site-header command-header header-${headerStyle}`}>
      <div className="container command-header-inner">
        <Link href={prefix} className="command-brand" aria-label={brand.name}>
          <img
            src="/brand/web-empire-mark.svg"
            alt=""
            width="38"
            height="38"
            className="command-brand-mark"
          />
          <span className="command-brand-copy">
            <strong>{brand.name}</strong>
            <small>{brand.system}</small>
          </span>
        </Link>

        <nav className="command-nav" aria-label="Main navigation">
          <Link href={`${prefix}/tools`}>{translate(messages, "nav.tools")}</Link>
          <Link href={`${prefix}/pricing`}>{pricingLabels[locale.code] ?? pricingLabels.en}</Link>
          <Link href={`${prefix}#empire-process`}>{processLabels[locale.code] ?? processLabels.en}</Link>
        </nav>

        <div className="command-header-actions">
          <LanguageSwitcher
            locales={locales}
            currentLocale={locale.code}
            label={translate(messages, "language.label")}
          />
          <Link href={`${prefix}/auth/login`} className="button button-ghost command-login-btn">
            {translate(messages, "nav.login")}
          </Link>
          <Link href={`${prefix}/tools`} className="button button-primary command-header-cta">
            {translate(messages, "home.explore")}
          </Link>
          <div className="command-utility-controls" aria-label="Display controls">
            <ColorModeToggle defaultMode={defaultColorMode} />
          </div>

          <details className="command-mobile-menu">
            <summary aria-label={menuLabels[locale.code] ?? menuLabels.en}>
              {menuLabels[locale.code] ?? menuLabels.en}
            </summary>
            <div className="command-mobile-menu-panel">
              <nav className="command-mobile-nav" aria-label="Mobile navigation">
                <Link href={`${prefix}/tools`}>{translate(messages, "nav.tools")}</Link>
                <Link href={`${prefix}/pricing`}>{pricingLabels[locale.code] ?? pricingLabels.en}</Link>
                <Link href={`${prefix}#empire-process`}>{processLabels[locale.code] ?? processLabels.en}</Link>
              </nav>

              <div className="command-mobile-actions">
                <Link href={`${prefix}/auth/login`} className="button button-ghost command-login-btn">
                  {translate(messages, "nav.login")}
                </Link>
                <Link href={`${prefix}/tools`} className="button button-primary command-header-cta">
                  {translate(messages, "home.explore")}
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
