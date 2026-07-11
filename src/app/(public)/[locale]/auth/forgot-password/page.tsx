import Link from "next/link";
import { notFound } from "next/navigation";

import { getLocaleByCode } from "@/localization/repository";

const labels = {
  ar: {
    title: "استعادة كلمة المرور",
    body: "أدخل بريدك الإلكتروني من صفحة تسجيل الدخول أو تواصل مع الدعم حتى نفعّل مسار الاستعادة الكامل في الإصدار القادم.",
    cta: "العودة إلى تسجيل الدخول",
  },
  en: {
    title: "Recover your password",
    body: "Return to the login page with your email address, or contact support while the full recovery flow is finalized in the next release.",
    cta: "Back to login",
  },
};

export default async function ForgotPasswordPage({
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
        <img src="/brand/web-empire-logo.svg" alt="WEB EMPIRE" width="260" height="70" />
        <p className="we-simple-kicker">WEB EMPIRE</p>
        <h1>{t.title}</h1>
        <p>{t.body}</p>
        <Link href={`${prefix}/auth/login`} className="we-button-primary">
          {t.cta}
        </Link>
      </section>
    </main>
  );
}