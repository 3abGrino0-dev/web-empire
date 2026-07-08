"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SiteIdentity } from "@/localization/types";

const knownLocales = new Set(["ar", "en", "fr", "tr", "ur"]);
const footerLabels: Record<string, { home: string; tools: string; pricing: string; login: string }> = {
  ar: { home: "الرئيسية", tools: "الأدوات", pricing: "الأسعار", login: "الدخول" },
  en: { home: "Home", tools: "Tools", pricing: "Pricing", login: "Login" },
  fr: { home: "Accueil", tools: "Outils", pricing: "Tarifs", login: "Connexion" },
  tr: { home: "Ana Sayfa", tools: "Araclar", pricing: "Fiyatlar", login: "Giris" },
  ur: { home: "ہوم", tools: "ٹولز", pricing: "قیمت", login: "لاگ ان" },
};

export function SiteFooter({ identity }: { identity: SiteIdentity }) {
  const pathname = usePathname();
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "en";
  const locale = knownLocales.has(firstSegment) ? firstSegment : "en";
  const prefix = `/${locale}`;
  const labels = footerLabels[locale] ?? footerLabels.en;

  return (
    <footer className="site-footer empire-footer">
      <div className="container empire-footer-shell">
        <div className="empire-footer-brand">
          <span aria-hidden="true">♛</span>
          <strong>{identity.siteName}</strong>
          <p>{identity.tagline}</p>
          <b aria-hidden="true">WEB EMPIRE</b>
        </div>

        <div className="empire-footer-rail">
          <nav className="empire-footer-nav" aria-label="Footer navigation">
            <Link href={prefix}>{labels.home}</Link>
            <Link href={`${prefix}/tools`}>{labels.tools}</Link>
            <Link href={`${prefix}/pricing`}>{labels.pricing}</Link>
            <Link href={`${prefix}/auth/login`}>{labels.login}</Link>
          </nav>

          <p className="empire-footer-meta">{identity.siteNameEn ?? identity.siteName}</p>
        </div>
      </div>
    </footer>
  );
}
