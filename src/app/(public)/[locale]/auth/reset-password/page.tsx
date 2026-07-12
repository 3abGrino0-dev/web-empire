import Link from "next/link";
import { notFound } from "next/navigation";

import { updatePassword } from "@/actions/auth";
import { FormPendingButton } from "@/components/auth/form-pending-button";
import { getLocaleByCode } from "@/localization/repository";

const labels = {
  ar: {
    title: "تعيين كلمة مرور جديدة",
    body: "أدخل كلمة المرور الجديدة ثم أكدها لإكمال استعادة الحساب.",
    password: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    submit: "تحديث كلمة المرور",
    submitPending: "جارٍ التحديث...",
    mismatch: "كلمتا المرور غير متطابقتين أو أقل من 8 أحرف.",
    resetFailed: "تعذر تحديث كلمة المرور. أعد فتح الرابط من البريد وحاول مرة أخرى.",
    back: "العودة إلى تسجيل الدخول",
  },
  en: {
    title: "Set a new password",
    body: "Enter and confirm your new password to complete account recovery.",
    password: "New password",
    confirmPassword: "Confirm password",
    submit: "Update password",
    submitPending: "Updating...",
    mismatch: "Passwords do not match or are shorter than 8 characters.",
    resetFailed: "Could not update password. Open the link from your email again and retry.",
    back: "Back to login",
  },
};

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { locale: localeCode } = await params;
  const query = await searchParams;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const t = locale.code === "ar" ? labels.ar : labels.en;
  const prefix = `/${locale.code}`;

  const errorMessage =
    query?.error === "password_mismatch"
      ? t.mismatch
      : query?.error === "reset_failed"
        ? t.resetFailed
        : null;

  return (
    <main className="we-page we-simple-page">
      <section className="we-container we-simple-card">
        <img src="/brand/web-empire-logo-horizontal.png" alt="WEB EMPIRE" width="260" height="70" />
        <p className="we-simple-kicker">WEB EMPIRE</p>
        <h1>{t.title}</h1>
        <p>{t.body}</p>

        {errorMessage ? (
          <p className="we-form-alert" role="alert" aria-live="assertive">
            {errorMessage}
          </p>
        ) : null}

        <form action={updatePassword} className="we-form" style={{ width: "100%", maxWidth: 420 }}>
          <input type="hidden" name="locale" value={locale.code} />
          <label>
            {t.password}
            <input name="password" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          <label>
            {t.confirmPassword}
            <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          <FormPendingButton className="primary" type="submit" pendingLabel={t.submitPending}>
            {t.submit}
          </FormPendingButton>
        </form>

        <Link href={`${prefix}/auth/login`} className="we-button-primary">
          {t.back}
        </Link>
      </section>
    </main>
  );
}
