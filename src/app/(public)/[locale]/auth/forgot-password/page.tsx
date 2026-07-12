import Link from "next/link";
import { notFound } from "next/navigation";

import { requestPasswordReset } from "@/actions/auth";
import { FormPendingButton } from "@/components/auth/form-pending-button";
import { getLocaleByCode } from "@/localization/repository";

const labels = {
  ar: {
    title: "استعادة كلمة المرور",
    body: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.",
    email: "البريد الإلكتروني",
    emailPlaceholder: "name@example.com",
    submit: "إرسال رابط الاستعادة",
    submitPending: "جارٍ الإرسال...",
    sent: "تم إرسال رابط الاستعادة إلى بريدك الإلكتروني.",
    error: "تعذر إرسال رابط الاستعادة الآن. حاول مرة أخرى.",
    cta: "العودة إلى تسجيل الدخول",
  },
  en: {
    title: "Recover your password",
    body: "Enter your email and we will send you a password reset link.",
    email: "Email",
    emailPlaceholder: "name@example.com",
    submit: "Send reset link",
    submitPending: "Sending...",
    sent: "Reset link sent to your email.",
    error: "Could not send reset link right now. Please try again.",
    cta: "Back to login",
  },
};

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ status?: string; error?: string }>;
}) {
  const { locale: localeCode } = await params;
  const query = await searchParams;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const t = locale.code === "ar" ? labels.ar : labels.en;
  const prefix = `/${locale.code}`;

  return (
    <main className="we-page we-simple-page">
      <section className="we-container we-simple-card">
        <img src="/brand/web-empire-logo-horizontal.png" alt="WEB EMPIRE" width="260" height="70" />
        <p className="we-simple-kicker">WEB EMPIRE</p>
        <h1>{t.title}</h1>
        <p>{t.body}</p>

        {query?.status === "sent" ? (
          <p className="we-form-note" role="status" aria-live="polite">{t.sent}</p>
        ) : null}

        {query?.error === "reset_failed" ? (
          <p className="we-form-alert" role="alert" aria-live="assertive">{t.error}</p>
        ) : null}

        <form action={requestPasswordReset} className="we-form" style={{ width: "100%", maxWidth: 420 }}>
          <input type="hidden" name="locale" value={locale.code} />
          <label>
            {t.email}
            <input
              name="email"
              type="email"
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              required
            />
          </label>
          <FormPendingButton className="primary" type="submit" pendingLabel={t.submitPending}>
            {t.submit}
          </FormPendingButton>
        </form>

        <Link href={`${prefix}/auth/login`} className="we-button-primary">
          {t.cta}
        </Link>
      </section>
    </main>
  );
}