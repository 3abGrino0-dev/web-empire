import Link from "next/link";
import { notFound } from "next/navigation";

import { getLocaleByCode } from "@/localization/repository";

const copy = {
  ar: {
    title: "سياسة الخصوصية",
    body: "نحافظ على خصوصية بياناتك ونستخدمها فقط لتشغيل حسابك وأدواتك وتحسين تجربتك.",
    cta: "استكشف الأدوات",
  },
  en: {
    title: "Privacy Policy",
    body: "We protect your data and use it only to operate your account, tools, and product experience.",
    cta: "Explore tools",
  },
};

export default async function PublicInfoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const t = locale.code === "ar" ? copy.ar : copy.en;
  const prefix = `/${locale.code}`;

  return (
    <main className="we-page we-simple-page">
      <section className="we-container we-simple-card">
        <img src="/brand/web-empire-logo-horizontal.png" alt="WEB EMPIRE" width="260" height="70" />
        <p className="we-simple-kicker">WEB EMPIRE</p>
        <h1>{t.title}</h1>
        <p>{t.body}</p>
        <Link href={`${prefix}/tools`} className="we-button-primary">
          {t.cta}
        </Link>
      </section>
    </main>
  );
}
