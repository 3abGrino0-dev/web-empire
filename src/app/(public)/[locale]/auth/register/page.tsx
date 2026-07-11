import Link from "next/link";
import { notFound } from "next/navigation";

import { FormPendingButton } from "@/components/auth/form-pending-button";
import { signInWithProvider, signUp } from "@/actions/auth";
import { getLocaleByCode } from "@/localization/repository";
import { webEmpireLightAssets as assets } from "@/brand/web-empire-light-assets";

const labels = {
  ar: {
    title: "ابدأ إمبراطوريتك الآن",
    subtitle: "أنشئ حسابك خلال دقيقة وابدأ استخدام الأدوات الذكية.",
    createAccount: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    emailHint: "استخدم بريدك الحقيقي لتأكيد الحساب لاحقًا.",
    passwordHint: "8 أحرف على الأقل.",
    agree: "أوافق على الشروط والأحكام وسياسة الخصوصية",
    terms: "الشروط والأحكام",
    privacy: "سياسة الخصوصية",
    create: "إنشاء الحساب",
    createPending: "جاري إنشاء الحساب...",
    google: "المتابعة عبر Google",
    googlePending: "جاري التحويل إلى Google...",
    microsoft: "المتابعة عبر Microsoft",
    microsoftPending: "جاري التحويل إلى Microsoft...",
    socialTitle: "أو التسجيل السريع",
    benefitsTitle: "ماذا ستحصل عليه",
    errorSignup: "تعذر إنشاء الحساب. حاول مرة أخرى.",
    errorOAuth: "تعذر تشغيل تسجيل الدخول الاجتماعي الآن. حاول مرة أخرى.",
    errorGeneric: "حدث خطأ غير متوقع. حاول مرة أخرى.",
    have: "لديك حساب بالفعل؟",
    login: "تسجيل الدخول",
    benefitOne: "300 نقطة مجانية",
    benefitTwo: "أدوات مجانية جاهزة",
    benefitThree: "سجل تشغيلات محفوظ",
  },
  en: {
    title: "Start your empire now",
    subtitle: "Create your account in a minute and start using smart tools.",
    createAccount: "Create account",
    email: "Email",
    password: "Password",
    emailHint: "Use your real email so you can recover your account later.",
    passwordHint: "At least 8 characters.",
    agree: "I agree to the terms and privacy policy",
    terms: "Terms",
    privacy: "Privacy",
    create: "Create account",
    createPending: "Creating account...",
    google: "Continue with Google",
    googlePending: "Redirecting to Google...",
    microsoft: "Continue with Microsoft",
    microsoftPending: "Redirecting to Microsoft...",
    socialTitle: "Or continue with",
    benefitsTitle: "What you get",
    errorSignup: "Could not create account. Try again.",
    errorOAuth: "Social sign-in is unavailable right now. Try again.",
    errorGeneric: "Unexpected error. Please try again.",
    have: "Already have an account?",
    login: "Login",
    benefitOne: "300 free credits",
    benefitTwo: "Ready free tools",
    benefitThree: "Saved run history",
  },
};

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ next?: string; error?: string }>;
}) {
  const { locale: localeCode } = await params;
  const query = await searchParams;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const t = locale.code === "ar" ? labels.ar : labels.en;
  const prefix = `/${locale.code}`;
  const next = query?.next ?? `/${locale.code}/dashboard`;

  const errorMessage =
    query?.error === "signup_failed"
      ? t.errorSignup
      : query?.error === "oauth_unavailable" || query?.error === "invalid_provider"
        ? t.errorOAuth
        : query?.error
          ? t.errorGeneric
          : null;

  return (
    <main className="we-page we-auth-page we-register-upgraded">
      <div className="we-container we-register-grid">
        <section className="we-register-visual">
          <img src="/brand/web-empire-logo.svg" alt="WEB EMPIRE" className="we-register-logo" />
          <h1>
            <span>{locale.code === "ar" ? "كل أداة تحتاجها." : "Every tool you need."}</span>
            <br />
            <span className="we-gradient-text">{locale.code === "ar" ? "في نظام واحد." : "In one system."}</span>
          </h1>
          <p>
            {locale.code === "ar"
              ? "حساب واحد للوصول إلى الأدوات، الرصيد، سجل التشغيلات، ولوحة التحكم."
              : "One account for tools, credits, run history, and your dashboard."}
          </p>

          <div className="we-register-visual-stack">
            <img src={assets.heroVisual} alt="" />
            <div className="we-register-mini-dashboard">
              <span>WEB EMPIRE</span>
              <div>
                <strong>300</strong>
                <small>{t.benefitOne}</small>
              </div>
              <div>
                <strong>26+</strong>
                <small>{t.benefitTwo}</small>
              </div>
              <div>
                <strong>∞</strong>
                <small>{t.benefitThree}</small>
              </div>
            </div>
          </div>

          <div className="we-register-benefits" aria-label={t.benefitsTitle}>
            <article>
              <strong>01</strong>
              <p>{t.benefitOne}</p>
            </article>
            <article>
              <strong>02</strong>
              <p>{t.benefitTwo}</p>
            </article>
            <article>
              <strong>03</strong>
              <p>{t.benefitThree}</p>
            </article>
          </div>
        </section>

        <section className="we-register-card">
          <p className="we-simple-kicker">CREATE ACCOUNT</p>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>

          {errorMessage ? (
            <p id="register-error" className="we-form-alert" role="alert" aria-live="assertive">
              {errorMessage}
            </p>
          ) : null}

          <form action={signUp} className="we-form we-register-form" aria-describedby={errorMessage ? "register-error" : undefined}>
            <input type="hidden" name="locale" value={locale.code} />
            <h3 className="we-register-subtitle">{t.createAccount}</h3>

            <label>
              {t.email}
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                inputMode="email"
                required
              />
              <small>{t.emailHint}</small>
            </label>

            <label>
              {t.password}
              <input
                name="password"
                type="password"
                placeholder={t.password}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <small>{t.passwordHint}</small>
            </label>

            <label className="we-register-check">
              <input type="checkbox" required />
              <span>
                {locale.code === "ar" ? "أوافق على " : "I agree to the "}
                <Link href={`${prefix}/terms`}>{t.terms}</Link>
                {locale.code === "ar" ? " و" : " and "}
                <Link href={`${prefix}/privacy`}>{t.privacy}</Link>
              </span>
            </label>

            <FormPendingButton className="primary" type="submit" pendingLabel={t.createPending}>
              ✧ {t.create}
            </FormPendingButton>
          </form>

          <div className="we-auth-divider"><span>OR</span></div>

          <p className="we-register-social-label">{t.socialTitle}</p>

          <form action={signInWithProvider} className="we-form we-register-social-form">
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
              <span aria-hidden="true" className="we-social-icon">M</span>
              <span>{t.microsoft}</span>
            </FormPendingButton>
          </form>

          <p className="we-form-note">{t.have} <Link href={`${prefix}/auth/login`}>{t.login}</Link></p>
        </section>
      </div>
    </main>
  );
}
