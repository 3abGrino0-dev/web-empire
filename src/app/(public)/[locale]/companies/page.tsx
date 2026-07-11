import Link from "next/link";
import { notFound } from "next/navigation";

import { getLocaleByCode } from "@/localization/repository";

const labels = {
  ar: {
    title: "حلول للشركات",
    body: "نظام أدوات قابل للتوسع للفرق، العمليات، التقارير، وتحسين الإنتاجية.",
    coming: "قريبًا",
    cta: "ابدأ الآن",
  },
  en: {
    title: "Solutions for Companies",
    body: "A scalable tool system for teams, operations, reporting, and productivity.",
    coming: "Coming soon",
    cta: "Start now",
  },
};

export default async function CompaniesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const t = locale.code === "ar" ? labels.ar : labels.en;
  const prefix = `/${locale.code}`;

  return (
    <main className="we-page we-simple-page">
      <section className="we-container we-simple-card">
        <img src="/brand/web-empire-hero-castle.svg" alt="" width="420" />
        <p className="we-simple-kicker">{t.coming}</p>
        <h1>{t.title}</h1>
        <p>{t.body}</p>
        <Link href={`${prefix}/auth/register`} className="we-button-primary">
          {t.cta}
        </Link>
      </section>
    </main>
  );
}
