import Link from "next/link";
import { notFound } from "next/navigation";

import { signIn, signInWithProvider } from "@/actions/auth";
import { FormPendingButton } from "@/components/auth/form-pending-button";
import { getLocaleByCode } from "@/localization/repository";
import { webEmpireLightAssets as assets } from "@/brand/web-empire-light-assets";

function GoogleIcon() {
  return (
    <svg
      className="we-oauth-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.509h3.232c1.891-1.741 2.981-4.305 2.981-7.35Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.619-2.423l-3.232-2.509c-.895.6-2.041.955-3.387.955-2.605 0-4.809-1.759-5.596-4.123H3.064v2.591A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.404 13.9A6.012 6.012 0 0 1 6.091 12c0-.659.114-1.3.313-1.9V7.509h-3.34A10 10 0 0 0 2 12c0 1.614.386 3.141 1.064 4.491L6.404 13.9Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.959 2.991 14.7 2 12 2a10 10 0 0 0-8.936 5.509l3.34 2.591C7.191 7.736 9.395 5.977 12 5.977Z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      className="we-oauth-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

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
            <input type="hidden" name="next" value={next} />
            <label>{t.email}<input name="email" type="email" placeholder="name@example.com" required /></label>
            <label>{t.password}<input name="password" type="password" placeholder={t.password} required /></label>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center" }}><input type="checkbox" defaultChecked style={{ minHeight: 18 }} /> {t.remember}</label>
              <Link href={`${prefix}/auth/forgot-password`}>{t.forgot}</Link>
            </div>
            <FormPendingButton className="primary" type="submit" pendingLabel={t.loginPending}>
              {locale.code === "ar" ? `${t.login} ←` : `${t.login} →`}
            </FormPendingButton>
          </form>

          <form action={signInWithProvider} className="we-form we-oauth-form">
            <input type="hidden" name="locale" value={locale.code} />
            <input type="hidden" name="next" value={next} />
            <FormPendingButton
              type="submit"
              name="provider"
              value="google"
              pendingLabel={t.googlePending}
              className="we-oauth-button we-oauth-google"
            >
              <GoogleIcon />
              <span>{t.google}</span>
            </FormPendingButton>

            <FormPendingButton
              type="submit"
              name="provider"
              value="azure"
              pendingLabel={t.microsoftPending}
              className="we-oauth-button we-oauth-microsoft"
            >
              <MicrosoftIcon />
              <span>{t.microsoft}</span>
            </FormPendingButton>
          </form>

          <p className="we-form-note">{t.noAccount} <Link href={`${prefix}/auth/register`}>{t.create}</Link></p>
        </section>
      </div>
    </main>
  );
}
