import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";
import { notFound } from "next/navigation";

import "@/app/globals.css";
import "@/app/editorial.css";
import "@/app/empire-brand.css";
import "@/app/empire-command.css";
import "@/app/web-empire-light.css";
import { appearanceCssVariables, getAppearanceSettings } from "@/appearance/repository";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { publicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getActiveLocales,
  getLocaleByCode,
  getSiteIdentity,
  getUiMessages,
} from "@/localization/repository";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) return {};
  const [identity, activeLocales] = await Promise.all([
    getSiteIdentity(locale),
    getActiveLocales(),
  ]);

  return {
    metadataBase: new URL(publicEnv.siteUrl),
    title: {
      default: identity.homeSeoTitle,
      template: `%s | ${identity.siteName}`,
    },
    description: identity.homeSeoDescription,
    alternates: {
      canonical: `/${locale.code}`,
      languages: Object.fromEntries([
        ...activeLocales.map((item) => [item.locale_code, `/${item.code}`]),
        ["x-default", "/"],
      ]),
    },
    openGraph: {
      title: identity.homeSeoTitle,
      description: identity.homeSeoDescription,
      url: `/${locale.code}`,
      siteName: identity.siteName,
      locale: locale.locale_code,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const supabase = await createSupabaseServerClient();

  const [
    { data: { user } },
    locales,
    identity,
    messages,
    appearance,
  ] = await Promise.all([
    supabase.auth.getUser(),
    getActiveLocales(),
    getSiteIdentity(locale),
    getUiMessages(locale),
    getAppearanceSettings(),
  ]);

  const style = appearanceCssVariables(appearance) as CSSProperties;

  return (
    <html
        lang={locale.locale_code}
        dir={locale.direction}
        className={`${inter.variable} ${tajawal.variable} ${
          locale.direction === "rtl" ? tajawal.className : inter.className
        }`}
      >
      <body>
        <div
          className="public-shell"
          style={style}
          data-theme-preset={appearance.presetKey}
          data-card-style={appearance.cardStyle}
          data-hero-style={appearance.heroStyle}
          data-density={appearance.uiDensity}
          data-font-preset={appearance.fontPreset}
          data-color-mode={appearance.defaultColorMode}
        >
          <SiteHeader
            locale={locale}
            locales={locales}
            identity={identity}
            messages={messages}
            headerStyle={appearance.headerStyle}
            defaultColorMode={appearance.defaultColorMode}
            isAuthenticated={Boolean(user)}
          />
          {children}
          <SiteFooter identity={identity} />
        </div>
      </body>
    </html>
  );
}
