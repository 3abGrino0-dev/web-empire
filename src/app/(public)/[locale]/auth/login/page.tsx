import Link from "next/link";
import { notFound } from "next/navigation";

import { getLocaleByCode } from "@/localization/repository";
import { webEmpireLightAssets as assets } from "@/brand/web-empire-light-assets";

const labels = {
  ar: { title: "تسجيل الدخول", body: "مرحبًا بعودتك. سجل دخولك للمتابعة", email: "البريد الإلكتروني", password: "كلمة المرور", remember: "تذكرني", forgot: "نسيت كلمة المرور؟", login: "دخول", google: "المتابعة عبر Google", apple: "المتابعة عبر Apple", noAccount: "ما عندك حساب؟", create: "إنشاء حساب" },
  en: { title: "Login", body: "Welcome back. Sign in to continue.", email: "Email", password: "Password", remember: "Remember me", forgot: "Forgot password?", login: "Login", google: "Continue with Google", apple: "Continue with Apple", noAccount: "No account?", create: "Create account" },
};

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const t = locale.code === "ar" ? labels.ar : labels.en;
  const prefix = `/${locale.code}`;

  return (
    <main className="we-page we-auth-page">
      <div className="we-container we-auth-grid">
        <section className="we-auth-visual-card">
          <img src="/brand/web-empire-logo.svg" alt="WEB EMPIRE" style={{ maxWidth: 300 }} />
          <h1><span>{locale.code === "ar" ? "كل أداة تحتاجها." : "Every tool you need."}</span><br /><span className="we-gradient-text">{locale.code === "ar" ? "في نظام واحد." : "In one system."}</span></h1>
          <p>{locale.code === "ar" ? "نفس حسابك للوصول إلى أدواتك وسجل تشغيلاتك ورصيدك." : "One account for your tools, runs, and credits."}</p>
          <img src={assets.authVisual} alt="" />
        </section>

        <section className="we-auth-card">
          <h1>{t.title}</h1>
          <p className="we-form-note">{t.body}</p>
          <form className="we-form">
            <label>{t.email}<input type="email" placeholder="name@example.com" /></label>
            <label>{t.password}<input type="password" placeholder={t.password} /></label>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center" }}><input type="checkbox" defaultChecked style={{ minHeight: 18 }} /> {t.remember}</label>
              <Link href={`${prefix}/auth/forgot-password`}>{t.forgot}</Link>
            </div>
            <button className="primary" type="button">{t.login} ←</button>
            <button type="button">{t.google}</button>
            <button type="button">{t.apple}</button>
            <p className="we-form-note">{t.noAccount} <Link href={`${prefix}/auth/register`}>{t.create}</Link></p>
          </form>
        </section>
      </div>
    </main>
  );
}
