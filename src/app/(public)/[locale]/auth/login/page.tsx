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
  const isArabic = locale.code === "ar";

  return (
    <main className="editorial-auth">
      <section className="editorial-auth-story">
        <p className="empire-section-kicker">{identity.siteName}</p>
        <h1>{isArabic ? "مساحتك داخل الإمبراطورية." : "Your space inside the Empire."}</h1>
        <p>{identity.tagline}</p>
      </section>

      <section className="editorial-auth-form">
        <p className="empire-section-kicker">{isArabic ? "الحساب" : "ACCOUNT"}</p>
        <h2>{isArabic ? "ادخل أو ابدأ من الصفر." : "Sign in or start from zero."}</h2>
        <p>{isArabic ? "نفس حساب Supabase الحالي. غيّرنا التجربة البصرية فقط." : "The same Supabase account flow. Only the public experience has changed."}</p>

        {error ? <div className="error-box">{error}</div> : null}

        <form>
          <input type="hidden" name="locale" value={locale.code} />

          <label className="field">
            <span>{isArabic ? "البريد الإلكتروني" : "Email"}</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>

          <label className="field">
            <span>{isArabic ? "كلمة المرور" : "Password"}</span>
            <input name="password" type="password" required minLength={8} autoComplete="current-password" />
          </label>

          <div className="editorial-auth-actions">
            <button formAction={signIn} className="button button-primary">
              {isArabic ? "تسجيل الدخول" : "Sign in"}
            </button>
            <button formAction={signUp} className="button button-ghost">
              {isArabic ? "إنشاء حساب" : "Create account"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
