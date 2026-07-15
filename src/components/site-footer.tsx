import Link from "next/link";

import type { LocaleRecord, SiteIdentity, UiMessages } from "@/localization/types";

const footerLabels = {
  ar: {
    rights: "جميع الحقوق محفوظة.",
    privacy: "سياسة الخصوصية",
    terms: "الشروط والأحكام",
    help: "الدعم والمساعدة",
    contact: "تواصل معنا",
  },
  en: {
    rights: "All rights reserved.",
    privacy: "Privacy policy",
    terms: "Terms",
    help: "Support",
    contact: "Contact",
  },
};

export function SiteFooter({
  locale,
  identity,
}: {
  locale?: LocaleRecord;
  identity: SiteIdentity;
  messages?: UiMessages;
}) {
  const localeCode = locale?.code ?? "ar";
  const t = localeCode === "ar" ? footerLabels.ar : footerLabels.en;
  const prefix = `/${localeCode}`;

  return (
    <footer className="we-footer">
      <div className="we-container we-footer-inner">
        <div className="we-footer-social">
          <span>𝕏</span>
          <span>in</span>
          <span>◎</span>
          <span>▶</span>
        </div>

        <nav className="we-footer-links" aria-label="Footer">
          <Link href={`${prefix}/terms`}>{t.terms}</Link>
          <Link href={`${prefix}/privacy`}>{t.privacy}</Link>
          <Link href={`${prefix}/contact`}>{t.contact}</Link>
          <Link href={`${prefix}/support`}>{t.help}</Link>
        </nav>

        <div className="we-footer-brand">
          <span>© 2026 {identity.siteName || "Web Empire"}. {t.rights}</span>
          <img src="/brand/web-empire-mark.svg" alt="" width="48" height="48" />
        </div>
      </div>
    </footer>
  );
}
