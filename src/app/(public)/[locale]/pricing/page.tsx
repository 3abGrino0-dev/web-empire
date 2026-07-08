import { notFound } from "next/navigation";

import { PricingAccessSystem } from "@/components/public/pricing-access-system";
import { translate } from "@/localization/messages";
import { getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getActivePlans } from "@/repositories/catalog";

const intro: Record<string, {
  kicker: string;
  title: string;
  body: string;
  levelsLabel: string;
  sequenceTitle: string;
  sequenceChoose: string;
  sequenceCredits: string;
  sequenceRun: string;
  emptyTitle: string;
  emptyBody: string;
  action: {
    freePlan: string;
    subscribe: string;
    openingCheckout: string;
    checkoutError: string;
  };
}> = {
  ar: {
    kicker: "الخطط والنقاط",
    title: "ادفع للاستخدام. لا للضوضاء.",
    body: "الوصول هنا مبني على خطة واضحة ورصيد واضح، بينما تبقى تكلفة المزود داخل النظام.",
    levelsLabel: "مستويات الوصول",
    sequenceTitle: "الخطة ← الرصيد ← الأدوات",
    sequenceChoose: "اختر مستوى الوصول",
    sequenceCredits: "استلم رصيدك الشهري",
    sequenceRun: "شغّل الأدوات باستخدام النقاط",
    emptyTitle: "لا توجد خطط مفعّلة حاليًا",
    emptyBody: "يمكنك المحاولة لاحقًا عند نشر مستويات وصول جديدة.",
    action: {
      freePlan: "الخطة المجانية",
      subscribe: "اشترك الآن",
      openingCheckout: "جاري فتح الدفع...",
      checkoutError: "تعذر بدء الدفع",
    },
  },
  en: {
    kicker: "PLANS & CREDITS",
    title: "Pay for usage. Not noise.",
    body: "Access is structured through real plans and real credits, while provider cost remains inside the system.",
    levelsLabel: "ACCESS LEVELS",
    sequenceTitle: "PLAN ← CREDITS ← TOOLS",
    sequenceChoose: "Choose your access level",
    sequenceCredits: "Receive your monthly credits",
    sequenceRun: "Run tools using credits",
    emptyTitle: "No active plans are available right now",
    emptyBody: "Please check back later when new access levels are published.",
    action: {
      freePlan: "Free plan",
      subscribe: "Subscribe now",
      openingCheckout: "Opening checkout...",
      checkoutError: "Unable to start checkout",
    },
  },
  fr: {
    kicker: "OFFRES & CREDITS",
    title: "Payez pour l'usage. Pas pour le bruit.",
    body: "L'acces est organise par de vraies offres et de vrais credits, tandis que le cout fournisseur reste interne.",
    levelsLabel: "NIVEAUX D'ACCES",
    sequenceTitle: "OFFRE ← CREDITS ← OUTILS",
    sequenceChoose: "Choisissez votre niveau d'acces",
    sequenceCredits: "Recevez vos credits mensuels",
    sequenceRun: "Lancez les outils avec vos credits",
    emptyTitle: "Aucune offre active n'est disponible pour le moment",
    emptyBody: "Revenez plus tard lorsque de nouveaux niveaux d'acces seront publies.",
    action: {
      freePlan: "Offre gratuite",
      subscribe: "S'abonner",
      openingCheckout: "Ouverture du paiement...",
      checkoutError: "Impossible de demarrer le paiement",
    },
  },
  tr: {
    kicker: "PLANLAR VE KREDILER",
    title: "Kullanima ode. Gurultuye degil.",
    body: "Erisim gercek planlar ve gercek kredilerle duzenlenir, saglayici maliyeti sistem icinde kalir.",
    levelsLabel: "ERISIM SEVIYELERI",
    sequenceTitle: "PLAN ← KREDI ← ARACLAR",
    sequenceChoose: "Erisim seviyeni sec",
    sequenceCredits: "Aylik kredini al",
    sequenceRun: "Araclari kredi ile calistir",
    emptyTitle: "Su anda etkin plan yok",
    emptyBody: "Yeni erisim seviyeleri yayinlandiginda tekrar kontrol edin.",
    action: {
      freePlan: "Ucretsiz plan",
      subscribe: "Hemen abone ol",
      openingCheckout: "Odeme aciliyor...",
      checkoutError: "Odeme baslatilamadi",
    },
  },
  ur: {
    kicker: "پلان اور کریڈٹس",
    title: "استعمال کے لیے ادائیگی کریں۔ شور کے لیے نہیں۔",
    body: "رسائی حقیقی پلانز اور حقیقی کریڈٹس سے منظم ہے، جبکہ پرووائیڈر لاگت سسٹم کے اندر رہتی ہے۔",
    levelsLabel: "رسائی کی سطحیں",
    sequenceTitle: "پلان ← کریڈٹس ← ٹولز",
    sequenceChoose: "اپنی رسائی کی سطح منتخب کریں",
    sequenceCredits: "اپنے ماہانہ کریڈٹس حاصل کریں",
    sequenceRun: "کریڈٹس کے ساتھ ٹولز چلائیں",
    emptyTitle: "فی الحال کوئی فعال پلان دستیاب نہیں",
    emptyBody: "نئی رسائی کی سطحیں شائع ہونے پر دوبارہ دیکھیں۔",
    action: {
      freePlan: "مفت پلان",
      subscribe: "ابھی سبسکرائب کریں",
      openingCheckout: "چیک آؤٹ کھل رہا ہے...",
      checkoutError: "چیک آؤٹ شروع نہیں ہو سکا",
    },
  },
};

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();
  const [plans, messages] = await Promise.all([getActivePlans(locale.code), getUiMessages(locale)]);
  const copy = intro[locale.code] ?? intro.en;
  const pointsLabel = translate(messages, "common.points");

  return (
    <PricingAccessSystem
      locale={locale.code}
      localeNumberFormat={locale.locale_code}
      plans={plans}
      pointsLabel={pointsLabel}
      copy={copy}
    />
  );
}
