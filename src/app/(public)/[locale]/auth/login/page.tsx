import { notFound } from "next/navigation";

import { signIn, signInWithProvider, signUp } from "@/actions/auth";
import { normalizeAuthErrorCode } from "@/lib/auth/redirects";
import { getLocaleByCode, getSiteIdentity } from "@/localization/repository";

type AuthCopy = {
  kicker: string;
  title: string;
  body: string;
  account: string;
  heading: string;
  helper: string;
  continueWithGoogle: string;
  continueWithMicrosoft: string;
  continueWithFacebook: string;
  or: string;
  socialHelper: string;
  emailHelper: string;
  authErrorFallback: string;
  email: string;
  password: string;
  signIn: string;
  signUp: string;
};

const authCopy: Record<string, AuthCopy> = {
  ar: {
    kicker: "حسابك",
    title: "مساحتك داخل الإمبراطورية.",
    body: "احفظ جلساتك، راقب رصيدك، وارجع إلى أدواتك من مكان واحد.",
    account: "الدخول",
    heading: "كمّل من حيث توقفت.",
    helper: "سجّل الدخول أو أنشئ حسابًا جديدًا.",
    continueWithGoogle: "المتابعة عبر Google",
    continueWithMicrosoft: "المتابعة عبر Microsoft",
    continueWithFacebook: "المتابعة عبر Facebook",
    or: "أو",
    socialHelper: "اختر مزوّدًا للمتابعة مباشرة إلى حسابك.",
    emailHelper: "أو استخدم بريدك الإلكتروني وكلمة المرور.",
    authErrorFallback: "تعذرت عملية تسجيل الدخول الآن. حاول مرة أخرى.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
  },
  en: {
    kicker: "YOUR ACCOUNT",
    title: "Your space inside the Empire.",
    body: "Keep your session, track credits and return to your tools from one place.",
    account: "ACCESS",
    heading: "Continue where you left off.",
    helper: "Sign in or create a new account.",
    continueWithGoogle: "Continue with Google",
    continueWithMicrosoft: "Continue with Microsoft",
    continueWithFacebook: "Continue with Facebook",
    or: "or",
    socialHelper: "Choose a provider to continue instantly.",
    emailHelper: "Or use your email and password.",
    authErrorFallback: "We could not sign you in right now. Please try again.",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signUp: "Create account",
  },
  fr: {
    kicker: "VOTRE COMPTE",
    title: "Votre espace dans l’Empire.",
    body: "Retrouvez vos outils et votre solde depuis un seul endroit.",
    account: "ACCÈS",
    heading: "Reprenez là où vous vous êtes arrêté.",
    helper: "Connectez-vous ou créez un compte.",
    continueWithGoogle: "Continuer avec Google",
    continueWithMicrosoft: "Continuer avec Microsoft",
    continueWithFacebook: "Continuer avec Facebook",
    or: "ou",
    socialHelper: "Choisissez un fournisseur pour continuer immédiatement.",
    emailHelper: "Ou utilisez votre e-mail et votre mot de passe.",
    authErrorFallback: "Connexion impossible pour le moment. Réessayez.",
    email: "E-mail",
    password: "Mot de passe",
    signIn: "Se connecter",
    signUp: "Créer un compte",
  },
  tr: {
    kicker: "HESABIN",
    title: "İmparatorluk içindeki alanın.",
    body: "Araçlarına ve kredi bakiyene tek yerden dön.",
    account: "ERİŞİM",
    heading: "Kaldığın yerden devam et.",
    helper: "Giriş yap veya yeni hesap oluştur.",
    continueWithGoogle: "Google ile devam et",
    continueWithMicrosoft: "Microsoft ile devam et",
    continueWithFacebook: "Facebook ile devam et",
    or: "veya",
    socialHelper: "Hemen devam etmek için bir sağlayıcı seç.",
    emailHelper: "Ya da e-posta ve şifre ile devam et.",
    authErrorFallback: "Şu anda giriş yapılamıyor. Lütfen tekrar dene.",
    email: "E-posta",
    password: "Şifre",
    signIn: "Giriş yap",
    signUp: "Hesap oluştur",
  },
  ur: {
    kicker: "آپ کا اکاؤنٹ",
    title: "ایمپائر کے اندر آپ کی جگہ۔",
    body: "اپنے ٹولز اور کریڈٹ بیلنس تک ایک جگہ سے واپس آئیں۔",
    account: "رسائی",
    heading: "جہاں چھوڑا تھا وہیں سے جاری رکھیں۔",
    helper: "سائن ان کریں یا نیا اکاؤنٹ بنائیں۔",
    continueWithGoogle: "Google کے ساتھ جاری رکھیں",
    continueWithMicrosoft: "Microsoft کے ساتھ جاری رکھیں",
    continueWithFacebook: "Facebook کے ساتھ جاری رکھیں",
    or: "یا",
    socialHelper: "فوری طور پر جاری رکھنے کے لئے ایک فراہم کنندہ منتخب کریں۔",
    emailHelper: "یا ای میل اور پاس ورڈ استعمال کریں۔",
    authErrorFallback: "اس وقت سائن اِن ممکن نہیں۔ دوبارہ کوشش کریں۔",
    email: "ای میل",
    password: "پاس ورڈ",
    signIn: "سائن ان",
    signUp: "اکاؤنٹ بنائیں",
  },
};

function resolveErrorMessage(code: string | undefined, copy: AuthCopy): string | null {
  if (!code) return null;

  switch (normalizeAuthErrorCode(code)) {
    case "invalid_credentials":
      return copy.authErrorFallback;
    case "signup_failed":
      return copy.authErrorFallback;
    case "invalid_provider":
      return copy.authErrorFallback;
    case "oauth_unavailable":
      return copy.authErrorFallback;
    case "oauth_callback_failed":
      return copy.authErrorFallback;
    default:
      return copy.authErrorFallback;
  }
}

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ locale: localeCode }, { error }] = await Promise.all([params, searchParams]);
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();
  const identity = await getSiteIdentity(locale);
  const copy = authCopy[locale.code] ?? authCopy.en;
  const errorMessage = resolveErrorMessage(error, copy);
  const dashboardPath = `/${locale.code}/dashboard`;

  return (
    <main className="editorial-auth">
      <section className="editorial-auth-story">
        <p className="empire-section-kicker">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <span className="editorial-auth-brand">♛ {identity.siteName}</span>
      </section>

      <section className="editorial-auth-form">
        <p className="empire-section-kicker">{copy.account}</p>
        <h2>{copy.heading}</h2>
        <p>{copy.helper}</p>

        {errorMessage ? (
          <div className="error-box" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <div className="editorial-auth-social">
          <p>{copy.socialHelper}</p>
          <div className="editorial-auth-social-list">
            <form action={signInWithProvider}>
              <input type="hidden" name="locale" value={locale.code} />
              <input type="hidden" name="provider" value="google" />
              <input type="hidden" name="next" value={dashboardPath} />
              <button type="submit" className="editorial-auth-provider button button-ghost">
                <span className="editorial-auth-provider-mark" aria-hidden="true">G</span>
                <span>{copy.continueWithGoogle}</span>
              </button>
            </form>

            <form action={signInWithProvider}>
              <input type="hidden" name="locale" value={locale.code} />
              <input type="hidden" name="provider" value="azure" />
              <input type="hidden" name="next" value={dashboardPath} />
              <button type="submit" className="editorial-auth-provider button button-ghost">
                <span className="editorial-auth-provider-mark" aria-hidden="true">M</span>
                <span>{copy.continueWithMicrosoft}</span>
              </button>
            </form>

            <form action={signInWithProvider}>
              <input type="hidden" name="locale" value={locale.code} />
              <input type="hidden" name="provider" value="facebook" />
              <input type="hidden" name="next" value={dashboardPath} />
              <button type="submit" className="editorial-auth-provider button button-ghost">
                <span className="editorial-auth-provider-mark" aria-hidden="true">f</span>
                <span>{copy.continueWithFacebook}</span>
              </button>
            </form>
          </div>
        </div>

        <div className="editorial-auth-divider" aria-hidden="true">
          <span>{copy.or}</span>
        </div>

        <form className="editorial-auth-email">
          <input type="hidden" name="locale" value={locale.code} />
          <p>{copy.emailHelper}</p>
          <label className="field">
            <span>{copy.email}</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="field">
            <span>{copy.password}</span>
            <input name="password" type="password" required minLength={8} autoComplete="current-password" />
          </label>
          <div className="editorial-auth-actions">
            <button formAction={signIn} className="button button-primary">
              {copy.signIn}
            </button>
            <button formAction={signUp} className="button button-ghost">
              {copy.signUp}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
