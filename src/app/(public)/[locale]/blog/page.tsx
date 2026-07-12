import Link from "next/link";
import { notFound } from "next/navigation";

import { getLocaleByCode } from "@/localization/repository";

const labels = {
  ar: {
    title: "مدونة إمبراطورية الويب",
    body: "مقالات قصيرة وعملية عن الأدوات، التسويق، الأعمال، والتحسين اليومي.",
    coming: "قريبًا",
    cta: "استكشف الأدوات",
  },
  en: {
    title: "Web Empire Blog",
    body: "Practical notes about tools, marketing, business, and productivity.",
    coming: "Coming soon",
    cta: "Explore tools",
  },
};

export default async function BlogPage({
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
        <img src="/brand/web-empire-logo-horizontal.png" alt="WEB EMPIRE" width="260" height="70" />
        <p className="we-simple-kicker">{t.coming}</p>
        <h1>{t.title}</h1>
        <p>{t.body}</p>
        <Link href={`${prefix}/tools`} className="we-button-primary">
          {t.cta}
        </Link>
      </section>
    </main>
  );
}
