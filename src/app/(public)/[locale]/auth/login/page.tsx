import { notFound } from "next/navigation";

import { signIn, signUp } from "@/actions/auth";
import { getLocaleByCode, getSiteIdentity } from "@/localization/repository";

const authCopy: Record<string, { kicker: string; title: string; body: string; account: string; heading: string; helper: string; email: string; password: string; signIn: string; signUp: string }> = {
  ar: { kicker: "حسابك", title: "مساحتك داخل الإمبراطورية.", body: "احفظ جلساتك، راقب رصيدك، وارجع إلى أدواتك من مكان واحد.", account: "الدخول", heading: "كمّل من حيث توقفت.", helper: "سجّل الدخول أو أنشئ حسابًا جديدًا.", email: "البريد الإلكتروني", password: "كلمة المرور", signIn: "تسجيل الدخول", signUp: "إنشاء حساب" },
  en: { kicker: "YOUR ACCOUNT", title: "Your space inside the Empire.", body: "Keep your session, track credits and return to your tools from one place.", account: "ACCESS", heading: "Continue where you left off.", helper: "Sign in or create a new account.", email: "Email", password: "Password", signIn: "Sign in", signUp: "Create account" },
  fr: { kicker: "VOTRE COMPTE", title: "Votre espace dans l’Empire.", body: "Retrouvez vos outils et votre solde depuis un seul endroit.", account: "ACCÈS", heading: "Reprenez là où vous vous êtes arrêté.", helper: "Connectez-vous ou créez un compte.", email: "E-mail", password: "Mot de passe", signIn: "Se connecter", signUp: "Créer un compte" },
  tr: { kicker: "HESABIN", title: "İmparatorluk içindeki alanın.", body: "Araçlarına ve kredi bakiyene tek yerden dön.", account: "ERİŞİM", heading: "Kaldığın yerden devam et.", helper: "Giriş yap veya yeni hesap oluştur.", email: "E-posta", password: "Şifre", signIn: "Giriş yap", signUp: "Hesap oluştur" },
  ur: { kicker: "آپ کا اکاؤنٹ", title: "ایمپائر کے اندر آپ کی جگہ۔", body: "اپنے ٹولز اور کریڈٹ بیلنس تک ایک جگہ سے واپس آئیں۔", account: "رسائی", heading: "جہاں چھوڑا تھا وہیں سے جاری رکھیں۔", helper: "سائن ان کریں یا نیا اکاؤنٹ بنائیں۔", email: "ای میل", password: "پاس ورڈ", signIn: "سائن ان", signUp: "اکاؤنٹ بنائیں" },
};

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ locale: localeCode }, { error }] = await Promise.all([params, searchParams]);
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();
  const identity = await getSiteIdentity(locale);
  const copy = authCopy[locale.code] ?? authCopy.en;

  return (
    <main className="editorial-auth">
      <section className="editorial-auth-story"><p className="empire-section-kicker">{copy.kicker}</p><h1>{copy.title}</h1><p>{copy.body}</p><span className="editorial-auth-brand">♛ {identity.siteName}</span></section>
      <section className="editorial-auth-form"><p className="empire-section-kicker">{copy.account}</p><h2>{copy.heading}</h2><p>{copy.helper}</p>{error ? <div className="error-box">{error}</div> : null}<form><input type="hidden" name="locale" value={locale.code} /><label className="field"><span>{copy.email}</span><input name="email" type="email" required autoComplete="email" /></label><label className="field"><span>{copy.password}</span><input name="password" type="password" required minLength={8} autoComplete="current-password" /></label><div className="editorial-auth-actions"><button formAction={signIn} className="button button-primary">{copy.signIn}</button><button formAction={signUp} className="button button-ghost">{copy.signUp}</button></div></form></section>
    </main>
  );
}
