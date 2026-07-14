import Link from "next/link";

import { webEmpireLightAssets } from "@/brand/web-empire-light-assets";

import { ColorModeToggle } from "@/components/appearance/color-mode-toggle";
import { LanguageSwitcher } from "@/components/localization/language-switcher";
import type { ColorMode, HeaderStyle } from "@/appearance/types";
import type { LocaleRecord, SiteIdentity, UiMessages } from "@/localization/types";
import { translate } from "@/localization/messages";

const labels = {
  ar: {
    pricing: "الأسعار",
    sectors: "التصنيفات",
    blog: "المدونة",
    companies: "الشركات",
    login: "تسجيل الدخول",
    start: "ابدأ الآن",
    dashboard: "لوحة التحكم",
  },
  en: {
    pricing: "Pricing",
    sectors: "Categories",
    blog: "Blog",
    companies: "Companies",
    login: "Login",
    start: "Start now",
    dashboard: "Dashboard",
  },
};

export function SiteHeader({
  locale,
  locales,
  messages,
  headerStyle,
  defaultColorMode,
  isAuthenticated,
}: {
  locale: LocaleRecord;
  locales: LocaleRecord[];
  identity: SiteIdentity;
  messages: UiMessages;
  headerStyle: HeaderStyle;
  defaultColorMode: ColorMode;
  isAuthenticated: boolean;
}) {
  const prefix = `/${locale.code}`;
  const t = locale.code === "ar" ? labels.ar : labels.en;

  return (
    <header className={`site-header light-empire-header header-${headerStyle}`}>
      <div className="container light-empire-header-inner">
        <Link href={prefix} className="light-empire-brand" aria-label="WEB EMPIRE">
          <img
            src={webEmpireLightAssets.logo}
            alt="WEB EMPIRE"
            width="200"
            height="50"
            className="light-empire-brand-logo"
          />
        </Link>

        <nav className="light-empire-nav" aria-label="Main navigation">
          <Link href={prefix}>{translate(messages, "nav.home")}</Link>
          <Link href={`${prefix}/tools`}>{translate(messages, "nav.tools")}</Link>
          <Link href={`${prefix}/tools#categories`}>{t.sectors}</Link>
          <Link href={`${prefix}/pricing`}>{t.pricing}</Link>
          <Link href={`${prefix}/blog`}>{t.blog}</Link>
          <Link href={`${prefix}/companies`}>{t.companies}</Link>
        </nav>

        <div className="light-empire-actions">
          <LanguageSwitcher
            locales={locales}
            currentLocale={locale.code}
            label={translate(messages, "language.label")}
          />
          {isAuthenticated ? (
            <Link href={`${prefix}/dashboard`} className="light-empire-start">
              ✦ {t.dashboard}
            </Link>
          ) : (
            <>
              <Link href={`${prefix}/auth/login`} className="light-empire-login">
                {t.login}
              </Link>
              <Link href={`${prefix}/auth/register`} className="light-empire-start">
                ✧ {t.start}
              </Link>
            </>
          )}
          <div className="light-empire-mode">
            <ColorModeToggle defaultMode={defaultColorMode} />
          </div>
        </div>
      </div>
    </header>
  );
}
