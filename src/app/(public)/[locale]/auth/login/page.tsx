import Link from "next/link";
import { notFound } from "next/navigation";

import { signIn, signInWithProvider } from "@/actions/auth";
import { FormPendingButton } from "@/components/auth/form-pending-button";
import { getLocaleByCode } from "@/localization/repository";
import { webEmpireLightAssets as assets } from "@/brand/web-empire-light-assets";

const labels = {
  ar: {
    title: "تسجيل الدخول",
    body: "مرحبًا بعودتك. سجل دخولك للمتابعة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    remember: "تذكرني",
    forgot: "نسيت كلمة المرور؟",
    login: "دخول",
    loginPending: "جاري تسجيل الدخول...",
    googlePending: "جاري التحويل إلى Google...",
    microsoftPending: "جاري التحويل إلى Microsoft...",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    emailNotConfirmed: "يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول.",
    google: "المتابعة عبر Google",
    microsoft: "المتابعة عبر Microsoft",
    noAccount: "ما عندك حساب؟",
    create: "إنشاء حساب",
  },
  en: {
    title: "Login",
    body: "Welcome back. Sign in to continue.",
    email: "Email",
    password: "Password",
    remember: "Remember me",
    forgot: "Forgot password?",
    login: "Login",
    loginPending: "Signing in...",
    googlePending: "Redirecting to Google...",
    microsoftPending: "Redirecting to Microsoft...",
    invalidCredentials: "The email or password is incorrect.",
    emailNotConfirmed: "Confirm your email before signing in.",
    google: "Continue with Google",
    microsoft: "Continue with Microsoft",
    noAccount: "No account?",
    create: "Create account",
  },
};

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ next?: string; error?: string; status?: string }>;
}) {
  const { locale: localeCode } = await params;
  const query = await searchParams;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const t = locale.code === "ar" ? labels.ar : labels.en;
  const prefix = `/${locale.code}`;
  const next = query?.next ?? `/${locale.code}/dashboard`;

  const statusMessage =
    query?.status === "password_updated"
      ? locale.code === "ar"
        ? "تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن."
        : "Password updated successfully. You can sign in now."
      : null;

  const errorMessage =
    query?.error === "invalid_credentials"
      ? t.invalidCredentials
      : query?.error === "email_not_confirmed"
        ? t.emailNotConfirmed
        : query?.error === "oauth_callback_failed"
      ? locale.code === "ar"
        ? "فشل إكمال تسجيل الدخول عبر المزود. حاول مرة أخرى."
        : "Could not complete provider sign-in. Please try again."
      : query?.error
        ? locale.code === "ar"
          ? "تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى."
          : "Sign in failed. Check your details and try again."
        : null;

  return (
    <main className="we-page we-auth-page">
      <div className="we-container we-auth-grid">
        <section className="we-auth-visual-card">
          <img src={assets.logo} alt="WEB EMPIRE" className="we-auth-brand-logo" />
          <h1>
            <span>{locale.code === "ar" ? "كل أداة تحتاجها." : "Every tool you need."}</span>
            <br />
            <span className="we-gradient-text">{locale.code === "ar" ? "في نظام واحد." : "In one system."}</span>
          </h1>
          <p>{locale.code === "ar" ? "نفس حسابك للوصول إلى أدواتك وسجل تشغيلاتك ورصيدك." : "One account for your tools, runs, and credits."}</p>
          <div className="we-auth-art-frame" aria-hidden="true">
            <img src={assets.authVisual} alt="" className="we-auth-visual-art" />
          </div>
        </section>

        <section className="we-auth-card">
          <h1>{t.title}</h1>
          <p className="we-form-note">{t.body}</p>

          {statusMessage ? (
            <p className="we-form-note" role="status" aria-live="polite">{statusMessage}</p>
          ) : null}

          {errorMessage ? (
            <p className="we-form-alert" role="alert" aria-live="assertive">{errorMessage}</p>
          ) : null}

          <form action={signIn} className="we-form">
            <input type="hidden" name="locale" value={locale.code} />
            <label>{t.email}<input name="email" type="email" placeholder="name@example.com" required /></label>
            <label>{t.password}<input name="password" type="password" placeholder={t.password} required /></label>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center" }}><input type="checkbox" defaultChecked style={{ minHeight: 18 }} /> {t.remember}</label>
              <Link href={`${prefix}/auth/forgot-password`}>{t.forgot}</Link>
            </div>
            <FormPendingButton className="primary" type="submit" pendingLabel={t.loginPending}>
              {t.login} ←
            </FormPendingButton>
          </form>

          <form action={signInWithProvider} className="we-form">
            <input type="hidden" name="locale" value={locale.code} />
            <input type="hidden" name="next" value={next} />
            <FormPendingButton type="submit" name="provider" value="google" pendingLabel={t.googlePending}>
              {t.google}
            </FormPendingButton>
            <FormPendingButton type="submit" name="provider" value="azure" pendingLabel={t.microsoftPending}>
              {t.microsoft}
            </FormPendingButton>
          </form>

          <p className="we-form-note">{t.noAccount} <Link href={`${prefix}/auth/register`}>{t.create}</Link></p>
        </section>
      </div>
    </main>
  );
}
