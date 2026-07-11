import Link from "next/link";

import { ColorModeToggle } from "@/components/appearance/color-mode-toggle";
import { LanguageSwitcher } from "@/components/localization/language-switcher";
import type { ColorMode, HeaderStyle } from "@/appearance/types";
import type { LocaleRecord, SiteIdentity, UiMessages } from "@/localization/types";
import { translate } from "@/localization/messages";

const sectorLabels: Record<string, string> = {
  ar: "التصنيفات",
  en: "Sectors",
  fr: "Secteurs",
  tr: "Kategoriler",
  ur: "زمرے",
};

const pricingLabels: Record<string, string> = {
  ar: "الأسعار",
  en: "Pricing",
  fr: "Tarifs",
  tr: "Fiyatlar",
  ur: "قیمتیں",
};

const menuLabels: Record<string, string> = {
  ar: "القائمة",
  en: "Menu",
  fr: "Menu",
  tr: "Menu",
  ur: "مینو",
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
  const isArabic = locale.code === "ar";

  return (
    <header className={`site-header imperial-header header-${headerStyle}`}>
      <div className="container imperial-header-inner">
        <Link href={prefix} className="imperial-brand" aria-label="WEB EMPIRE">
          <img
            src="/brand/web-empire-mark.svg"
            alt=""
            width="42"
            height="42"
            className="imperial-brand-mark"
          />
          <span className="imperial-brand-type">
            <strong>WEB EMPIRE</strong>
            <small>{isArabic ? "إمبراطورية الويب" : "TOOLS. INTELLIGENCE. CONTROL."}</small>
          </span>
        </Link>

        <nav className="imperial-nav" aria-label="Main navigation">
          <Link href={prefix}>{translate(messages, "nav.home")}</Link>
          <Link href={`${prefix}/tools`}>{translate(messages, "nav.tools")}</Link>
          <Link href={`${prefix}/tools#empire-sectors`}>{sectorLabels[locale.code] ?? sectorLabels.en}</Link>
          <Link href={`${prefix}/pricing`}>{pricingLabels[locale.code] ?? pricingLabels.en}</Link>
        </nav>

        <div className="imperial-header-actions">
          <LanguageSwitcher
            locales={locales}
            currentLocale={locale.code}
            label={translate(messages, "language.label")}
          />
          <Link href={`${prefix}/auth/login`} className="button imperial-login-btn">
            {translate(messages, "nav.login")}
          </Link>
          <Link href={`${prefix}/tools`} className="button imperial-cta">
            {isArabic ? "ابدأ الآن" : translate(messages, "home.explore")}
          </Link>
          <div className="imperial-utility-controls" aria-label="Display controls">
            <ColorModeToggle defaultMode={defaultColorMode} />
          </div>

          <details className="imperial-mobile-menu">
            <summary aria-label={menuLabels[locale.code] ?? menuLabels.en}>
              {menuLabels[locale.code] ?? menuLabels.en}
            </summary>
            <div className="imperial-mobile-menu-panel">
              <nav className="imperial-mobile-nav" aria-label="Mobile navigation">
                <Link href={prefix}>{translate(messages, "nav.home")}</Link>
                <Link href={`${prefix}/tools`}>{translate(messages, "nav.tools")}</Link>
                <Link href={`${prefix}/tools#empire-sectors`}>{sectorLabels[locale.code] ?? sectorLabels.en}</Link>
                <Link href={`${prefix}/pricing`}>{pricingLabels[locale.code] ?? pricingLabels.en}</Link>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
