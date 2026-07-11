import Link from "next/link";
import { notFound } from "next/navigation";

import { signInWithProvider, signUp } from "@/actions/auth";
import { getLocaleByCode } from "@/localization/repository";
import { webEmpireLightAssets as assets } from "@/brand/web-empire-light-assets";

const labels = {
  ar: {
    title: "ابدأ إمبراطوريتك الآن",
    subtitle: "أنشئ حسابك خلال دقيقة وابدأ استخدام الأدوات الذكية.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    agree: "أوافق على الشروط والأحكام وسياسة الخصوصية",
    create: "إنشاء الحساب",
    google: "المتابعة عبر Google",
    microsoft: "المتابعة عبر Microsoft",
    have: "لديك حساب بالفعل؟",
    login: "تسجيل الدخول",
    benefitOne: "300 نقطة مجانية",
    benefitTwo: "أدوات مجانية جاهزة",
    benefitThree: "سجل تشغيلات محفوظ",
  },
  en: {
    title: "Start your empire now",
    subtitle: "Create your account in a minute and start using smart tools.",
    email: "Email",
    password: "Password",
    agree: "I agree to the terms and privacy policy",
    create: "Create account",
    google: "Continue with Google",
    microsoft: "Continue with Microsoft",
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
        </section>

        <section className="we-register-card">
          <p className="we-simple-kicker">CREATE ACCOUNT</p>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>

          {query?.error ? (
            <p className="we-form-alert">
              {locale.code === "ar" ? "تعذر إنشاء الحساب. حاول مرة أخرى." : "Could not create account. Try again."}
            </p>
          ) : null}

          <form action={signUp} className="we-form">
            <input type="hidden" name="locale" value={locale.code} />
            <label>{t.email}<input name="email" type="email" placeholder="name@example.com" required /></label>
            <label>{t.password}<input name="password" type="password" placeholder={t.password} minLength={8} required /></label>
            <label className="we-register-check"><input type="checkbox" required /> {t.agree}</label>
            <button className="primary" type="submit">✧ {t.create}</button>
          </form>

          <div className="we-auth-divider"><span>OR</span></div>

          <form action={signInWithProvider} className="we-form">
            <input type="hidden" name="locale" value={locale.code} />
            <input type="hidden" name="next" value={next} />
            <button type="submit" name="provider" value="google">{t.google}</button>
            <button type="submit" name="provider" value="azure">{t.microsoft}</button>
          </form>

          <p className="we-form-note">{t.have} <Link href={`${prefix}/auth/login`}>{t.login}</Link></p>
        </section>
      </div>
    </main>
  );
}
