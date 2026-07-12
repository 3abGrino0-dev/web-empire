import Link from "next/link";
import { notFound } from "next/navigation";

import { signInWithProvider, signUp } from "@/actions/auth";
import { FormPendingButton } from "@/components/auth/form-pending-button";
import { webEmpireLightAssets as assets } from "@/brand/web-empire-light-assets";
import { getLocaleByCode } from "@/localization/repository";

const labels = {
  ar: {
    title: "إنشاء حساب",
    subtitle: "أنشئ حسابك وابدأ رحلتك مع إمبراطورية الويب.",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "أدخل اسمك الكامل",
    email: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    password: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة مرور قوية",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "أعد إدخال كلمة المرور",
    termsPrefix: "أوافق على ",
    terms: "الشروط والأحكام",
    termsJoin: " و",
    privacy: "سياسة الخصوصية",
    create: "إنشاء الحساب",
    createPending: "جاري إنشاء الحساب...",
    social: "أو المتابعة باستخدام",
    google: "المتابعة عبر Google",
    googlePending: "جاري التحويل إلى Google...",
    microsoft: "المتابعة عبر Microsoft",
    microsoftPending: "جاري التحويل إلى Microsoft...",
    have: "لديك حساب بالفعل؟",
    login: "تسجيل الدخول",
    heroTitle: "كل أداة تحتاجها.",
    heroAccent: "في نظام واحد.",
    heroDescription: "مجموعة متكاملة من الأدوات الذكية لمساعدتك على إنجاز عملك بدقة وسرعة.",
    secureTitle: "وصول آمن",
    secureBody: "حماية على مستوى المؤسسة",
    syncTitle: "بيانات متزامنة",
    syncBody: "أدواتك وإعداداتك في كل مكان",
    privacyTitle: "خصوصية تامة",
    privacyBody: "بياناتك آمنة ولا نشاركها",
    errorSignup: "تعذر إنشاء الحساب. حاول مرة أخرى.",
    errorPasswordMismatch: "كلمتا المرور غير متطابقتين.",
    errorInvalidInput: "تحقق من الاسم والبريد وكلمة المرور.",
    errorOAuth: "تعذر تشغيل تسجيل الدخول الاجتماعي الآن.",
    statusCheckEmail: "تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب.",
    errorGeneric: "حدث خطأ غير متوقع. حاول مرة أخرى.",
  },
  en: {
    title: "Create account",
    subtitle: "Create your account and begin with Web Empire.",
    fullName: "Full name",
    fullNamePlaceholder: "Enter your full name",
    email: "Email",
    emailPlaceholder: "Enter your email",
    password: "Password",
    passwordPlaceholder: "Enter a strong password",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Re-enter your password",
    termsPrefix: "I agree to the ",
    terms: "Terms",
    termsJoin: " and ",
    privacy: "Privacy Policy",
    create: "Create account",
    createPending: "Creating account...",
    social: "Or continue with",
    google: "Continue with Google",
    googlePending: "Redirecting to Google...",
    microsoft: "Continue with Microsoft",
    microsoftPending: "Redirecting to Microsoft...",
    have: "Already have an account?",
    login: "Login",
    heroTitle: "Every tool you need.",
    heroAccent: "In one system.",
    heroDescription: "A complete suite of smart tools to help you work accurately and quickly.",
    secureTitle: "Secure access",
    secureBody: "Enterprise-grade protection",
    syncTitle: "Synced data",
    syncBody: "Your tools and settings everywhere",
    privacyTitle: "Complete privacy",
    privacyBody: "Your data stays private",
    errorSignup: "Could not create your account. Try again.",
    errorPasswordMismatch: "Passwords do not match.",
    errorInvalidInput: "Check your name, email, and password.",
    errorOAuth: "Social sign-in is unavailable right now.",
    statusCheckEmail: "Account created. Check your email to confirm your account.",
    errorGeneric: "Unexpected error. Please try again.",
  },
};

export default async function RegisterPage({
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
  const statusMessage = query?.status === "check_email" ? t.statusCheckEmail : null;

  const errorMessage =
    query?.error === "signup_failed"
      ? t.errorSignup
      : query?.error === "password_mismatch"
        ? t.errorPasswordMismatch
        : query?.error === "invalid_signup_input"
          ? t.errorInvalidInput
          : query?.error === "oauth_unavailable" || query?.error === "invalid_provider"
            ? t.errorOAuth
            : query?.error
              ? t.errorGeneric
              : null;

  return (
    <main className="we-page we-auth-page we-register-upgraded we-register-reference-theme">
      <div className="we-container we-register-shell">
        <section className="we-register-showcase" aria-labelledby="register-hero-title">
          <div className="we-register-showcase-copy">
            <h1 id="register-hero-title">
              <span>{t.heroTitle}</span>
              <span className="we-gradient-text">{t.heroAccent}</span>
            </h1>
            <p>{t.heroDescription}</p>
          </div>

          <div className="we-register-orbit" aria-hidden="true">
            <span className="we-register-orbit-chip is-percent">%</span>
            <span className="we-register-orbit-chip is-vat">VAT</span>
            <span className="we-register-orbit-chip is-growth">↗</span>
            <span className="we-register-orbit-chip is-calc">⌗</span>
            <span className="we-register-orbit-chip is-chart">◔</span>

            <img
              src={assets.heroVisual}
              alt=""
              className="we-register-castle"
            />

            <img
              src={assets.dashboardPreview}
              alt=""
              className="we-register-dashboard-preview"
            />
          </div>

          <div className="we-register-trust-grid">
            <article>
              <span aria-hidden="true">◈</span>
              <div>
                <strong>{t.secureTitle}</strong>
                <small>{t.secureBody}</small>
              </div>
            </article>
            <article>
              <span aria-hidden="true">⟳</span>
              <div>
                <strong>{t.syncTitle}</strong>
                <small>{t.syncBody}</small>
              </div>
            </article>
            <article>
              <span aria-hidden="true">♙</span>
              <div>
                <strong>{t.privacyTitle}</strong>
                <small>{t.privacyBody}</small>
              </div>
            </article>
          </div>
        </section>

        <section className="we-register-card" aria-labelledby="register-title">
          <img
            src={assets.logo}
            alt="WEB EMPIRE"
            className="we-register-card-logo"
          />

          <div className="we-register-heading">
            <h2 id="register-title">{t.title}</h2>
            <p>{t.subtitle}</p>
            <span aria-hidden="true" />
          </div>

          {errorMessage ? (
            <p
              id="register-error"
              className="we-form-alert"
              role="alert"
              aria-live="assertive"
            >
              {errorMessage}
            </p>
          ) : null}

          {statusMessage ? (
            <p className="we-form-note" role="status" aria-live="polite">
              {statusMessage}
            </p>
          ) : null}

          <form
            action={signUp}
            className="we-form we-register-form"
            aria-describedby={errorMessage ? "register-error" : undefined}
          >
            <input type="hidden" name="locale" value={locale.code} />
            <input type="hidden" name="next" value={next} />

            <label>
              {t.fullName}
              <input
                name="fullName"
                type="text"
                placeholder={t.fullNamePlaceholder}
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
              />
            </label>

            <label>
              {t.email}
              <input
                name="email"
                type="email"
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                inputMode="email"
                required
              />
            </label>

            <div className="we-register-password-grid">
              <label>
                {t.password}
                <input
                  name="password"
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>

              <label>
                {t.confirmPassword}
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder={t.confirmPasswordPlaceholder}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
            </div>

            <label className="we-register-check">
              <input type="checkbox" required />
              <span>
                {t.termsPrefix}
                <Link href={`${prefix}/terms`}>{t.terms}</Link>
                {t.termsJoin}
                <Link href={`${prefix}/privacy`}>{t.privacy}</Link>
              </span>
            </label>

            <FormPendingButton
              className="primary we-register-submit"
              type="submit"
              pendingLabel={t.createPending}
            >
              ✧ {t.create}
            </FormPendingButton>
          </form>

          <div className="we-auth-divider">
            <span>{t.social}</span>
          </div>

          <form
            action={signInWithProvider}
            className="we-register-social-form"
          >
            <input type="hidden" name="locale" value={locale.code} />
            <input type="hidden" name="next" value={next} />

            <FormPendingButton
              type="submit"
              name="provider"
              value="google"
              pendingLabel={t.googlePending}
              className="we-social-provider we-social-google"
            >
              <span aria-hidden="true" className="we-social-icon">G</span>
              <span>{t.google}</span>
            </FormPendingButton>

            <FormPendingButton
              type="submit"
              name="provider"
              value="azure"
              pendingLabel={t.microsoftPending}
              className="we-social-provider we-social-microsoft"
            >
              <span aria-hidden="true" className="we-social-icon we-ms-icon">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span>{t.microsoft}</span>
            </FormPendingButton>
          </form>

          <p className="we-form-note we-register-login-link">
            {t.have}{" "}
            <Link href={`${prefix}/auth/login`}>{t.login}</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
