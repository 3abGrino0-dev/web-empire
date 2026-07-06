import { notFound } from "next/navigation";

import { signIn, signUp } from "@/actions/auth";
import { getLocaleByCode, getSiteIdentity } from "@/localization/repository";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ locale: localeCode }, { error }] = await Promise.all([params, searchParams]);
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();
  const identity = await getSiteIdentity(locale);

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="eyebrow">{identity.siteName}</div>
        <h1>{locale.code === "ar" ? "الدخول أو إنشاء حساب" : "Sign in or create an account"}</h1>
        <p>{identity.tagline}</p>
        {error ? <div className="error-box">{error}</div> : null}
        <form>
          <input type="hidden" name="locale" value={locale.code} />
          <label className="field">
            <span>{locale.code === "ar" ? "البريد الإلكتروني" : "Email"}</span>
            <input name="email" type="email" required />
          </label>
          <label className="field">
            <span>{locale.code === "ar" ? "كلمة المرور" : "Password"}</span>
            <input name="password" type="password" required minLength={8} />
          </label>
          <div className="hero-actions">
            <button formAction={signIn} className="button button-primary">{locale.code === "ar" ? "تسجيل الدخول" : "Sign in"}</button>
            <button formAction={signUp} className="button button-dark">{locale.code === "ar" ? "إنشاء حساب" : "Create account"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
