import Link from "next/link";
import { notFound } from "next/navigation";

import { signIn, signInWithProvider } from "@/actions/auth";
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
    <main className="we-page we-auth-page">
      <div className="we-container we-auth-grid">
        <section className="we-auth-visual-card">
          <img src="/brand/web-empire-logo.svg" alt="WEB EMPIRE" style={{ maxWidth: 300 }} />
          <h1>
            <span>{locale.code === "ar" ? "كل أداة تحتاجها." : "Every tool you need."}</span>
            <br />
            <span className="we-gradient-text">{locale.code === "ar" ? "في نظام واحد." : "In one system."}</span>
          </h1>
          <p>{locale.code === "ar" ? "نفس حسابك للوصول إلى أدواتك وسجل تشغيلاتك ورصيدك." : "One account for your tools, runs, and credits."}</p>
          <img src={assets.authVisual} alt="" />
        </section>

        <section className="we-auth-card">
          <h1>{t.title}</h1>
          <p className="we-form-note">{t.body}</p>

          {query?.error ? (
            <p className="we-form-alert">
              {locale.code === "ar" ? "تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى." : "Sign in failed. Check your details and try again."}
            </p>
          ) : null}

          <form action={signIn} className="we-form">
            <input type="hidden" name="locale" value={locale.code} />
            <label>{t.email}<input name="email" type="email" placeholder="name@example.com" required /></label>
            <label>{t.password}<input name="password" type="password" placeholder={t.password} required /></label>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center" }}><input type="checkbox" defaultChecked style={{ minHeight: 18 }} /> {t.remember}</label>
              <Link href={`${prefix}/auth/forgot-password`}>{t.forgot}</Link>
            </div>
            <button className="primary" type="submit">{t.login} ←</button>
          </form>

          <form action={signInWithProvider} className="we-form">
            <input type="hidden" name="locale" value={locale.code} />
            <input type="hidden" name="next" value={next} />
            <button type="submit" name="provider" value="google">{t.google}</button>
            <button type="submit" name="provider" value="azure">{t.microsoft}</button>
          </form>

          <p className="we-form-note">{t.noAccount} <Link href={`${prefix}/auth/register`}>{t.create}</Link></p>
        </section>
      </div>
    </main>
  );
}
