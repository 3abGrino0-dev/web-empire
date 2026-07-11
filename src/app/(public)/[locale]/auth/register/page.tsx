import Link from "next/link";
import { notFound } from "next/navigation";

import { getLocaleByCode } from "@/localization/repository";
import { webEmpireLightAssets as assets } from "@/brand/web-empire-light-assets";

const labels = {
  ar: { title: "إنشاء حساب", body: "أنشئ حسابك وابدأ رحلتك مع إمبراطورية الويب", name: "الاسم الكامل", email: "البريد الإلكتروني", password: "كلمة المرور", confirm: "تأكيد كلمة المرور", agree: "أوافق على الشروط والأحكام وسياسة الخصوصية", create: "إنشاء الحساب", google: "المتابعة عبر Google", apple: "المتابعة عبر Apple", have: "لديك حساب بالفعل؟", login: "تسجيل الدخول" },
  en: { title: "Create account", body: "Create your account and start with Web Empire.", name: "Full name", email: "Email", password: "Password", confirm: "Confirm password", agree: "I agree to the terms and privacy policy", create: "Create account", google: "Continue with Google", apple: "Continue with Apple", have: "Already have an account?", login: "Login" },
};

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const t = locale.code === "ar" ? labels.ar : labels.en;
  const prefix = `/${locale.code}`;

  return (
    <main className="we-page we-auth-page">
      <div className="we-container we-auth-grid">
        <section className="we-auth-visual-card">
          <h1><span>{locale.code === "ar" ? "كل أداة تحتاجها." : "Every tool you need."}</span><br /><span className="we-gradient-text">{locale.code === "ar" ? "في نظام واحد." : "In one system."}</span></h1>
          <p>{locale.code === "ar" ? "انضم واحصل على وصول غير محدود إلى جميع الأدوات الذكية في مكان واحد." : "Join and access all smart tools in one place."}</p>
          <img src={assets.authVisual} alt="" />
          <img src={assets.dashboardPreview} alt="" />
        </section>

        <section className="we-auth-card">
          <h1>{t.title}</h1>
          <p className="we-form-note">{t.body}</p>
          <form className="we-form">
            <label>{t.name}<input type="text" placeholder={t.name} /></label>
            <label>{t.email}<input type="email" placeholder="name@example.com" /></label>
            <label>{t.password}<input type="password" placeholder={t.password} /></label>
            <label>{t.confirm}<input type="password" placeholder={t.confirm} /></label>
            <label style={{ display: "flex", alignItems: "center" }}><input type="checkbox" style={{ minHeight: 18 }} /> {t.agree}</label>
            <button className="primary" type="button">{t.create}</button>
            <button type="button">{t.google}</button>
            <button type="button">{t.apple}</button>
            <p className="we-form-note">{t.have} <Link href={`${prefix}/auth/login`}>{t.login}</Link></p>
          </form>
        </section>
      </div>
    </main>
  );
}
