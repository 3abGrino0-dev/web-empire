import Link from "next/link";
import { notFound } from "next/navigation";

import { signInWithProvider, signUp } from "@/actions/auth";
import { getLocaleByCode } from "@/localization/repository";
import { webEmpireLightAssets as assets } from "@/brand/web-empire-light-assets";

const labels = {
  ar: {
    title: "إنشاء حساب",
    body: "أنشئ حسابك وابدأ رحلتك مع إمبراطورية الويب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    agree: "أوافق على الشروط والأحكام وسياسة الخصوصية",
    create: "إنشاء الحساب",
    google: "المتابعة عبر Google",
    microsoft: "المتابعة عبر Microsoft",
    have: "لديك حساب بالفعل؟",
    login: "تسجيل الدخول",
  },
  en: {
    title: "Create account",
    body: "Create your account and start with Web Empire.",
    email: "Email",
    password: "Password",
    agree: "I agree to the terms and privacy policy",
    create: "Create account",
    google: "Continue with Google",
    microsoft: "Continue with Microsoft",
    have: "Already have an account?",
    login: "Login",
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
    <main className="we-page we-auth-page">
      <div className="we-container we-auth-grid">
        <section className="we-auth-visual-card">
          <h1>
            <span>{locale.code === "ar" ? "كل أداة تحتاجها." : "Every tool you need."}</span>
            <br />
            <span className="we-gradient-text">{locale.code === "ar" ? "في نظام واحد." : "In one system."}</span>
          </h1>
          <p>{locale.code === "ar" ? "انضم واحصل على وصول إلى الأدوات الذكية في مكان واحد." : "Join and access smart tools in one place."}</p>
          <img src={assets.authVisual} alt="" />
          <img src={assets.dashboardPreview} alt="" />
        </section>

        <section className="we-auth-card">
          <h1>{t.title}</h1>
          <p className="we-form-note">{t.body}</p>

          {query?.error ? (
            <p className="we-form-alert">
              {locale.code === "ar" ? "تعذر إنشاء الحساب. حاول مرة أخرى." : "Could not create account. Try again."}
            </p>
          ) : null}

          <form action={signUp} className="we-form">
            <input type="hidden" name="locale" value={locale.code} />
            <label>{t.email}<input name="email" type="email" placeholder="name@example.com" required /></label>
            <label>{t.password}<input name="password" type="password" placeholder={t.password} minLength={8} required /></label>
            <label style={{ display: "flex", alignItems: "center" }}><input type="checkbox" required style={{ minHeight: 18 }} /> {t.agree}</label>
            <button className="primary" type="submit">{t.create}</button>
          </form>

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
