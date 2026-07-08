import Link from "next/link";
import { notFound } from "next/navigation";

import { CapabilitiesShowcase } from "@/components/public/capabilities-showcase";
import { FeaturedToolShowcase } from "@/components/public/featured-tool-showcase";
import { translate } from "@/localization/messages";
import {
  getActiveLocales,
  getLocaleByCode,
  getSiteIdentity,
  getUiMessages,
} from "@/localization/repository";
import { getActivePlans, getActiveTools } from "@/repositories/catalog";

const homeCopy = {
  ar: {
    kicker: "منصة أدوات رقمية تعمل فعلًا",
    titleOne: "إمبراطورية",
    titleTwo: "الويب",
    statement: "أداة واحدة قد تختصر ساعات.",
    description:
      "اختر ما تريد إنجازه: احسب، حوّل، حلّل، اربط أو شغّل سير عمل. إمبراطورية الويب تجمع الأدوات داخل تجربة واحدة واضحة.",
    processLink: "شاهد الرحلة",
    toolsMetric: "أداة منشورة",
    enginesMetric: "محركات مستخدمة",
    localesMetric: "لغات نشطة",
    plansMetric: "خطط متاحة",
    showcaseKicker: "من داخل الإمبراطورية",
    showcaseTitle: "أدوات تُعرض مثل الأعمال. وتعمل مثل المنتجات.",
    showcaseBody:
      "هذه الأدوات مأخوذة من كتالوج المنصة نفسه. افتح أي أداة وانتقل مباشرة إلى تجربة التشغيل.",
    allTools: "كل الأدوات",
    capabilityKicker: "ما وراء الواجهة",
    capabilityTitle: "المهمة تحدد المحرك. لا العكس.",
    capabilityBody:
      "الحساب لا يحتاج ذكاءً اصطناعيًا دائمًا. وبعض المهام تحتاج API أو Webhook أو Workflow. لهذا بُنيت المنصة بعدة محركات.",
    capabilities: [
      { title: "احسب", description: "نتيجة دقيقة عندما تكون المعادلة هي الطريق الأقصر.", motif: "calculate" },
      { title: "أنشئ", description: "صياغة محتوى واضح للمهام التي تبدأ من فكرة.", motif: "create" },
      { title: "حوّل", description: "تغيير الشكل أو النمط بقواعد يمكن الوثوق بها.", motif: "transform" },
      { title: "حلّل", description: "قراءة البيانات واستخراج ما يهم لاتخاذ القرار.", motif: "analyze" },
      { title: "أتمت", description: "ربط خطوات متعددة في تدفق واحد قابل للتكرار.", motif: "automate" },
      { title: "اربط", description: "وصل مهامك بخدمات ونقاط نهاية خارجية بثبات.", motif: "connect" },
    ],
    processKicker: "كيف تعمل",
    processTitle: "خمس حركات. من الفكرة إلى الناتج.",
    engineKicker: "المحركات",
    engineTitle: "من معادلة بسيطة إلى سير عمل كامل.",
    engineBody:
      "محرك التنفيذ يبقى خلف الكواليس. أمامك حقل واضح، زر واحد، ونتيجة قابلة للاستخدام.",
    pricingKicker: "الخطط والنقاط",
    pricingTitle: "استخدم المجاني. ووسّع رصيدك عندما تحتاج.",
    pricingBody:
      "الخطط المعروضة تأتي من نظام الخطط الفعلي داخل المنصة، بدون أرقام تسويقية مختلقة.",
    pricingLink: "تفاصيل الخطط",
    finalKicker: "ابدأ من هنا",
    finalTitle: "عندك مهمة؟ غالبًا عندنا أداة لها.",
    finalBody: "ادخل، اختر، وشغّل.",
    enter: "استكشف الإمبراطورية",
    steps: [
      ["01", "اختر", "ابدأ من الأداة الأقرب للمهمة."],
      ["02", "أدخل", "أضف النص أو الأرقام أو البيانات المطلوبة."],
      ["03", "شغّل", "المحرك المناسب يتولى التنفيذ."],
      ["04", "راجع", "النتيجة تظهر في مساحة واضحة وقابلة للفحص."],
      ["05", "استخدم", "خذ الناتج وكمل شغلك."],
    ],
    engines: {
      formula: ["FORMULA", "احسب", "نتائج حتمية عندما تكون المعادلة هي الحل الصحيح."],
      text_transform: ["TEXT", "حوّل", "إعادة تشكيل النصوص بقواعد واضحة ومتوقعة."],
      ai_text: ["AI TEXT", "اكتب", "نماذج لغوية للمهام التي تحتاج توليدًا مرنًا."],
      ai_structured: ["AI DATA", "نظّم", "مخرجات منظمة عندما تحتاج بنية قابلة للمعالجة."],
      http_api: ["API", "اتصل", "استدعاء خدمات خارجية عبر اتصالات موثوقة."],
      webhook: ["WEBHOOK", "أرسل", "تسليم الأحداث والبيانات إلى نقاط اتصال محددة."],
      workflow: ["WORKFLOW", "أتمت", "عدة خطوات تعمل كسلسلة تنفيذ واحدة."],
    },
  },
  en: {
    kicker: "A digital tool platform that actually runs",
    titleOne: "WEB",
    titleTwo: "EMPIRE",
    statement: "One tool can save hours.",
    description:
      "Choose the job: calculate, transform, analyze, connect or run a workflow. Web Empire brings useful tools into one clear experience.",
    processLink: "See the journey",
    toolsMetric: "published tools",
    enginesMetric: "engines in use",
    localesMetric: "active locales",
    plansMetric: "available plans",
    showcaseKicker: "Inside the Empire",
    showcaseTitle: "Tools presented like work. Built like products.",
    showcaseBody:
      "These tools come directly from the platform catalog. Open one and move straight into the live runner.",
    allTools: "All tools",
    capabilityKicker: "Behind the interface",
    capabilityTitle: "The job chooses the engine. Not the other way around.",
    capabilityBody:
      "A calculation does not always need AI. Some jobs need an API, webhook or workflow. That is why the platform supports multiple runtimes.",
    capabilities: [
      { title: "Calculate", description: "Use deterministic logic when precision is the requirement.", motif: "calculate" },
      { title: "Create", description: "Generate first drafts and structured writing from intent.", motif: "create" },
      { title: "Transform", description: "Reshape content into the format your workflow needs.", motif: "transform" },
      { title: "Analyze", description: "Inspect text or data and surface clear decision signals.", motif: "analyze" },
      { title: "Automate", description: "Chain repeatable steps into one reliable execution path.", motif: "automate" },
      { title: "Connect", description: "Route tasks to APIs, webhooks and external systems safely.", motif: "connect" },
    ],
    processKicker: "How it works",
    processTitle: "Five moves. From intent to output.",
    engineKicker: "Runtime engines",
    engineTitle: "From a simple formula to a complete workflow.",
    engineBody:
      "The runtime stays behind the scenes. You get a clear input, one action and an output you can use.",
    pricingKicker: "Plans and credits",
    pricingTitle: "Use free tools. Add more capacity when you need it.",
    pricingBody:
      "Plans are read from the live plan catalog. No invented marketing numbers.",
    pricingLink: "Plan details",
    finalKicker: "Start here",
    finalTitle: "Have a task? There is probably a tool for it.",
    finalBody: "Enter, choose and run.",
    enter: "Explore the Empire",
    steps: [
      ["01", "Choose", "Start with the tool closest to the job."],
      ["02", "Input", "Add the text, numbers or data the tool needs."],
      ["03", "Run", "The appropriate runtime engine executes the task."],
      ["04", "Review", "The output appears in a clear reviewable canvas."],
      ["05", "Use", "Take the result and continue your work."],
    ],
    engines: {
      formula: ["FORMULA", "Calculate", "Deterministic results when a formula is the right answer."],
      text_transform: ["TEXT", "Transform", "Reshape text with clear and predictable rules."],
      ai_text: ["AI TEXT", "Write", "Language models for flexible generation tasks."],
      ai_structured: ["AI DATA", "Structure", "Structured output when the result needs a schema."],
      http_api: ["API", "Connect", "Call external services through trusted connections."],
      webhook: ["WEBHOOK", "Send", "Deliver events and data to configured endpoints."],
      workflow: ["WORKFLOW", "Automate", "Multiple steps executed as one coordinated run."],
    },
  },
  fr: {
    kicker: "Une plateforme d’outils numériques qui fonctionne vraiment",
    titleOne: "WEB",
    titleTwo: "EMPIRE",
    statement: "Un outil peut faire gagner des heures.",
    description:
      "Calculez, transformez, analysez, connectez ou lancez un workflow. Web Empire réunit des outils utiles dans une expérience claire.",
    processLink: "Voir le parcours",
    toolsMetric: "outils publiés",
    enginesMetric: "moteurs utilisés",
    localesMetric: "langues actives",
    plansMetric: "offres disponibles",
    showcaseKicker: "Dans l’Empire",
    showcaseTitle: "Des outils présentés comme des créations. Construits comme des produits.",
    showcaseBody: "Les outils proviennent directement du catalogue actif de la plateforme.",
    allTools: "Tous les outils",
    capabilityKicker: "Derrière l’interface",
    capabilityTitle: "La tâche choisit le moteur. Pas l’inverse.",
    capabilityBody: "Calcul, texte, IA, API, webhook ou workflow: le moteur dépend du besoin réel.",
    capabilities: [
      { title: "Calculer", description: "Des résultats fiables lorsque la précision est prioritaire.", motif: "calculate" },
      { title: "Créer", description: "Produire du contenu initial à partir d’une intention claire.", motif: "create" },
      { title: "Transformer", description: "Adapter la forme d’un contenu à votre contexte réel.", motif: "transform" },
      { title: "Analyser", description: "Lire les données et faire ressortir les signaux utiles.", motif: "analyze" },
      { title: "Automatiser", description: "Enchaîner plusieurs étapes dans un flux exécutable.", motif: "automate" },
      { title: "Connecter", description: "Relier les tâches aux API et endpoints externes.", motif: "connect" },
    ],
    processKicker: "Comment ça marche",
    processTitle: "Cinq gestes. De l’intention au résultat.",
    engineKicker: "Moteurs",
    engineTitle: "D’une formule simple à un workflow complet.",
    engineBody: "Le moteur reste en coulisses. Vous voyez une saisie claire, une action et un résultat exploitable.",
    pricingKicker: "Offres et crédits",
    pricingTitle: "Commencez gratuitement. Ajoutez de la capacité quand il le faut.",
    pricingBody: "Les offres affichées viennent du catalogue réel de la plateforme.",
    pricingLink: "Voir les offres",
    finalKicker: "Commencez ici",
    finalTitle: "Une tâche à faire? Il existe probablement un outil pour elle.",
    finalBody: "Entrez, choisissez, lancez.",
    enter: "Explorer l’Empire",
    steps: [
      ["01", "Choisir", "Choisissez l’outil le plus proche de votre tâche."],
      ["02", "Saisir", "Ajoutez le texte, les chiffres ou les données nécessaires."],
      ["03", "Lancer", "Le moteur approprié exécute la tâche."],
      ["04", "Vérifier", "Le résultat apparaît dans un espace clair."],
      ["05", "Utiliser", "Prenez le résultat et continuez votre travail."],
    ],
    engines: {
      formula: ["FORMULA", "Calculer", "Résultats déterministes quand une formule suffit."],
      text_transform: ["TEXT", "Transformer", "Transformer le texte avec des règles prévisibles."],
      ai_text: ["AI TEXT", "Écrire", "Modèles de langage pour la génération flexible."],
      ai_structured: ["AI DATA", "Structurer", "Sorties structurées selon un schéma."],
      http_api: ["API", "Connecter", "Appeler des services externes via des connexions fiables."],
      webhook: ["WEBHOOK", "Envoyer", "Transmettre événements et données à un endpoint."],
      workflow: ["WORKFLOW", "Automatiser", "Plusieurs étapes dans une seule exécution."],
    },
  },
  tr: {
    kicker: "Gerçekten çalışan dijital araç platformu",
    titleOne: "WEB",
    titleTwo: "EMPIRE",
    statement: "Tek bir araç saatler kazandırabilir.",
    description: "Hesapla, dönüştür, analiz et, bağlan veya bir iş akışı çalıştır. Web Empire araçları tek ve net bir deneyimde toplar.",
    processLink: "Akışı gör",
    toolsMetric: "yayındaki araç",
    enginesMetric: "kullanılan motor",
    localesMetric: "aktif dil",
    plansMetric: "mevcut plan",
    showcaseKicker: "İmparatorluğun içinde",
    showcaseTitle: "İş gibi sergilenen, ürün gibi çalışan araçlar.",
    showcaseBody: "Bu araçlar doğrudan aktif platform kataloğundan gelir.",
    allTools: "Tüm araçlar",
    capabilityKicker: "Arayüzün arkasında",
    capabilityTitle: "Motoru iş seçer. Tersi değil.",
    capabilityBody: "Her görev yapay zekâ gerektirmez. Formül, metin, API, webhook ve workflow farklı ihtiyaçlar içindir.",
    capabilities: [
      { title: "Hesapla", description: "Kesinliğin gerekli olduğu yerde deterministik sonuçlar al.", motif: "calculate" },
      { title: "Oluştur", description: "Fikirden başlayıp kullanılabilir ilk metni üret.", motif: "create" },
      { title: "Donustur", description: "Icerigi ihtiyaca uygun bicime guvenli sekilde cevir.", motif: "transform" },
      { title: "Analiz et", description: "Veriyi okuyup karar icin net sinyaller cikar.", motif: "analyze" },
      { title: "Otomatize et", description: "Tekrarlanan adimlari tek bir akista birlestir.", motif: "automate" },
      { title: "Baglan", description: "Gorevleri API ve webhook noktalarina istikrarla ulastir.", motif: "connect" },
    ],
    processKicker: "Nasıl çalışır",
    processTitle: "Beş hareket. Niyetten çıktıya.",
    engineKicker: "Motorlar",
    engineTitle: "Basit bir formülden tam bir iş akışına.",
    engineBody: "Çalışma motoru arka planda kalır. Önünüzde net bir giriş, tek aksiyon ve kullanılabilir sonuç vardır.",
    pricingKicker: "Planlar ve krediler",
    pricingTitle: "Ücretsiz başla. Gerektiğinde kapasiteyi artır.",
    pricingBody: "Gösterilen planlar platformun gerçek plan kataloğundan gelir.",
    pricingLink: "Plan detayları",
    finalKicker: "Buradan başla",
    finalTitle: "Bir görevin mi var? Büyük ihtimalle bir aracı vardır.",
    finalBody: "Gir, seç ve çalıştır.",
    enter: "İmparatorluğu keşfet",
    steps: [
      ["01", "Seç", "Göreve en yakın aracı seç."],
      ["02", "Gir", "Gerekli metin, sayı veya veriyi ekle."],
      ["03", "Çalıştır", "Uygun motor görevi uygular."],
      ["04", "İncele", "Sonucu net bir alanda kontrol et."],
      ["05", "Kullan", "Çıktıyı al ve işine devam et."],
    ],
    engines: {
      formula: ["FORMULA", "Hesapla", "Formülün doğru çözüm olduğu görevler."],
      text_transform: ["TEXT", "Dönüştür", "Metni öngörülebilir kurallarla yeniden şekillendir."],
      ai_text: ["AI TEXT", "Yaz", "Esnek üretim görevleri için dil modelleri."],
      ai_structured: ["AI DATA", "Yapılandır", "Şemalı ve yapılandırılmış çıktılar."],
      http_api: ["API", "Bağlan", "Güvenilir bağlantılarla dış servisleri çağır."],
      webhook: ["WEBHOOK", "Gönder", "Olay ve verileri yapılandırılmış uç noktalara ilet."],
      workflow: ["WORKFLOW", "Otomatize et", "Birden çok adımı tek çalıştırmada yürüt."],
    },
  },
  ur: {
    kicker: "ایک ڈیجیٹل ٹول پلیٹ فارم جو واقعی کام کرتا ہے",
    titleOne: "WEB",
    titleTwo: "EMPIRE",
    statement: "ایک ٹول کئی گھنٹے بچا سکتا ہے۔",
    description: "حساب کریں، تبدیل کریں، تجزیہ کریں، کنیکٹ کریں یا ورک فلو چلائیں۔ Web Empire مفید ٹولز کو ایک واضح تجربے میں جمع کرتا ہے۔",
    processLink: "طریقہ دیکھیں",
    toolsMetric: "شائع شدہ ٹولز",
    enginesMetric: "استعمال شدہ انجن",
    localesMetric: "فعال زبانیں",
    plansMetric: "دستیاب پلانز",
    showcaseKicker: "ایمپائر کے اندر",
    showcaseTitle: "ٹولز جو کام کی طرح دکھتے اور پروڈکٹ کی طرح چلتے ہیں۔",
    showcaseBody: "یہ ٹولز براہ راست فعال پلیٹ فارم کیٹلاگ سے آتے ہیں۔",
    allTools: "تمام ٹولز",
    capabilityKicker: "انٹرفیس کے پیچھے",
    capabilityTitle: "کام انجن چنتا ہے۔ الٹا نہیں۔",
    capabilityBody: "ہر کام کے لیے AI ضروری نہیں۔ فارمولا، متن، API، webhook اور workflow مختلف ضرورتوں کے لیے ہیں۔",
    capabilities: [
      { title: "حساب", description: "جب درستگی لازم ہو تو متعین نتیجہ حاصل کریں۔", motif: "calculate" },
      { title: "تخلیق", description: "ارادے سے آغاز کر کے مفید ابتدائی مواد تیار کریں۔", motif: "create" },
      { title: "تبدیل", description: "مواد کو مطلوبہ شکل میں واضح قواعد سے بدلیں۔", motif: "transform" },
      { title: "تجزیہ", description: "ڈیٹا پڑھ کر فیصلے کے لیے اہم اشارے نکالیں۔", motif: "analyze" },
      { title: "خودکار", description: "متعدد اقدامات کو ایک قابلِ تکرار بہاؤ میں جوڑیں۔", motif: "automate" },
      { title: "ربط", description: "کام کو API اور webhook پوائنٹس سے قابلِ اعتماد طور پر ملائیں۔", motif: "connect" },
    ],
    processKicker: "یہ کیسے کام کرتا ہے",
    processTitle: "پانچ قدم۔ ارادے سے نتیجے تک۔",
    engineKicker: "رن ٹائم انجن",
    engineTitle: "سادہ فارمولے سے مکمل ورک فلو تک۔",
    engineBody: "انجن پس منظر میں رہتا ہے۔ آپ کو واضح ان پٹ، ایک ایکشن اور قابل استعمال نتیجہ ملتا ہے۔",
    pricingKicker: "پلان اور کریڈٹس",
    pricingTitle: "مفت شروع کریں۔ ضرورت پر صلاحیت بڑھائیں۔",
    pricingBody: "دکھائے گئے پلان پلیٹ فارم کے حقیقی پلان کیٹلاگ سے آتے ہیں۔",
    pricingLink: "پلان کی تفصیل",
    finalKicker: "یہاں سے شروع کریں",
    finalTitle: "کوئی کام ہے؟ غالباً اس کے لیے ایک ٹول موجود ہے۔",
    finalBody: "داخل ہوں، چنیں اور چلائیں۔",
    enter: "ایمپائر دریافت کریں",
    steps: [
      ["01", "چنیں", "اپنے کام کے قریب ترین ٹول سے شروع کریں۔"],
      ["02", "داخل کریں", "ضروری متن، اعداد یا ڈیٹا شامل کریں۔"],
      ["03", "چلائیں", "مناسب انجن کام مکمل کرتا ہے۔"],
      ["04", "جائزہ لیں", "نتیجہ واضح جگہ پر دیکھیں۔"],
      ["05", "استعمال کریں", "آؤٹ پٹ لیں اور اپنا کام جاری رکھیں۔"],
    ],
    engines: {
      formula: ["FORMULA", "حساب", "جب فارمولا درست حل ہو تو متعین نتائج۔"],
      text_transform: ["TEXT", "تبدیل", "واضح قواعد کے ساتھ متن کی تبدیلی۔"],
      ai_text: ["AI TEXT", "لکھیں", "لچکدار تخلیقی کاموں کے لیے زبان ماڈلز۔"],
      ai_structured: ["AI DATA", "منظم", "اسکیما کے مطابق منظم نتائج۔"],
      http_api: ["API", "کنیکٹ", "قابل اعتماد کنکشن کے ذریعے بیرونی سروسز۔"],
      webhook: ["WEBHOOK", "بھیجیں", "ایونٹس اور ڈیٹا مقررہ اینڈ پوائنٹس تک۔"],
      workflow: ["WORKFLOW", "خودکار", "متعدد مراحل ایک مربوط رن میں۔"],
    },
  },
} as const;

type HomeCopy = (typeof homeCopy)[keyof typeof homeCopy];
type EngineCopyKey = keyof HomeCopy["engines"];

function resolveCopy(localeCode: string): HomeCopy {
  return homeCopy[localeCode as keyof typeof homeCopy] ?? homeCopy.en;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const [tools, plans, locales, messages, identity] = await Promise.all([
    getActiveTools(locale.code),
    getActivePlans(locale.code),
    getActiveLocales(),
    getUiMessages(locale),
    getSiteIdentity(locale),
  ]);

  const copy = resolveCopy(locale.code);
  const featuredTools = tools.filter((tool) => tool.is_featured);
  const showcase = (featuredTools.length ? featuredTools : tools).slice(0, 6);
  const usedEngines = Array.from(new Set(tools.map((tool) => tool.engine_type))).filter(
    (engine): engine is EngineCopyKey => engine !== "custom_runtime" && engine in copy.engines,
  );
  const previewPlans = plans.slice(0, 3);
  const percentageTool = tools.find((tool) => tool.slug === "percentage-calculator");

  return (
    <main className="empire-home">
      <section className="empire-hero">
        <div className="container empire-hero-grid">
          <div className="empire-hero-copy">
            <p className="empire-kicker">{copy.kicker}</p>
            <h1 className="empire-hero-title" aria-label={identity.siteName}>
              <span>{copy.titleOne}</span>
              <span>{copy.titleTwo}</span>
            </h1>

            <div className="empire-hero-summary">
              <div className="empire-hero-support">
                <p className="empire-hero-description">{copy.description}</p>
                <p className="empire-hero-statement">
                  {locale.code === "ar" ? (
                    <>
                      أداة واحدة قد
                      <br />
                      تختصر ساعات.
                    </>
                  ) : (
                    copy.statement
                  )}
                </p>
                <div className="empire-actions">
                  <Link href={`/${locale.code}/tools`} className="button button-primary">
                    {translate(messages, "home.explore")}
                  </Link>
                  <a href="#empire-process" className="button button-ghost">
                    {copy.processLink}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="empire-hero-collage" aria-hidden="true">
            <div className="empire-window empire-window-main">
              <div className="empire-window-bar"><span /><span /><span /></div>
              <small>FORMULA · LIVE</small>
              <h3>{percentageTool?.title ?? (locale.code === "ar" ? "حاسبة النسبة المئوية" : "Percentage calculator")}</h3>
              <div className="empire-demo-equation">
                <span>25</span><b>÷</b><span>200</span>
              </div>
              <div className="empire-demo-result">
                <small>{locale.code === "ar" ? "النتيجة" : "RESULT"}</small>
                <strong>12.5</strong>
              </div>
            </div>
            <div className="empire-window empire-window-ai"><small>AI DATA</small><strong>{locale.code === "ar" ? "مخرجات منظمة" : "Structured output"}</strong><span>{"{ }"}</span></div>
            <div className="empire-window empire-window-flow"><small>WORKFLOW</small><strong>01 → 02 → 03</strong><span>{locale.code === "ar" ? "خطوات مترابطة" : "Connected steps"}</span></div>
            <div className="empire-sticker">WEB<br />EMPIRE</div>
          </div>
        </div>
      </section>

      <section className="empire-proof" aria-label="Platform facts">
        <div className="container empire-proof-grid">
          <div className="empire-proof-item"><strong>{tools.length}</strong><span>{copy.toolsMetric}</span></div>
          <div className="empire-proof-item"><strong>{usedEngines.length}</strong><span>{copy.enginesMetric}</span></div>
          <div className="empire-proof-item"><strong>{locales.length}</strong><span>{copy.localesMetric}</span></div>
          <div className="empire-proof-item"><strong>{plans.length}</strong><span>{copy.plansMetric}</span></div>
        </div>
      </section>

      <section className="empire-section empire-section-light">
        <div className="container">
          <FeaturedToolShowcase
            tools={showcase}
            locale={locale.code}
            messages={messages}
            copy={{
              showcaseKicker: copy.showcaseKicker,
              showcaseTitle: copy.showcaseTitle,
              showcaseBody: copy.showcaseBody,
              allTools: copy.allTools,
            }}
          />
        </div>
      </section>

      <CapabilitiesShowcase
        copy={{
          capabilityKicker: copy.capabilityKicker,
          capabilityTitle: copy.capabilityTitle,
          capabilityBody: copy.capabilityBody,
          capabilities: copy.capabilities,
        }}
      />

      <section id="empire-process" className="empire-section empire-process">
        <div className="container">
          <p className="empire-section-kicker">{copy.processKicker}</p>
          <h2 className="empire-display empire-process-title">{copy.processTitle}</h2>
          <div className="empire-process-grid">
            {copy.steps.map(([number, title, description]) => (
              <article className="empire-step" key={number}><span className="empire-step-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="empire-section empire-engine-section">
        <div className="container empire-engine-layout">
          <div className="empire-engine-copy"><p className="empire-section-kicker">{copy.engineKicker}</p><h2 className="empire-display">{copy.engineTitle}</h2><p>{copy.engineBody}</p></div>
          <div className="empire-engine-stack">
            {(usedEngines.length ? usedEngines : (["formula"] as EngineCopyKey[])).map((engine, index) => {
              const [code, title, description] = copy.engines[engine];
              return <article className="empire-engine-row" key={engine}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{description}</p></div><em>{code}</em></article>;
            })}
          </div>
        </div>
      </section>

      {previewPlans.length ? (
        <section className="empire-section empire-pricing-section">
          <div className="container">
            <div className="empire-section-head empire-section-head-light">
              <div><p className="empire-section-kicker">{copy.pricingKicker}</p><h2 className="empire-display">{copy.pricingTitle}</h2></div>
              <div><p>{copy.pricingBody}</p><Link href={`/${locale.code}/pricing`} className="empire-section-link">{copy.pricingLink}<span aria-hidden="true">↗</span></Link></div>
            </div>
            <div className="empire-pricing-grid">
              {previewPlans.map((plan) => (
                <article className={`empire-plan ${plan.slug === "pro" ? "is-featured" : ""}`} key={plan.id}>
                  <div className="empire-plan-label"><span>{plan.slug}</span><span>{Number(plan.monthly_credits).toLocaleString(locale.locale_code)} {translate(messages, "common.points")}</span></div>
                  <h3>{plan.localizedName}</h3><p>{plan.localizedDescription}</p>
                  <div className="empire-plan-price"><strong>{plan.price_sar}</strong><span>SAR</span></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="empire-final">
        <div className="container empire-final-inner">
          <div><p className="empire-section-kicker">{copy.finalKicker}</p><h2>{copy.finalTitle}</h2><p>{copy.finalBody}</p></div>
          <Link href={`/${locale.code}/tools`} className="button button-dark">{copy.enter}</Link>
        </div>
      </section>
    </main>
  );
}
