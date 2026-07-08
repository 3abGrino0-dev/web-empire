import { notFound } from "next/navigation";

import { ToolsArchive } from "@/components/public/tools-archive";
import { translate } from "@/localization/messages";
import { getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getActiveTools } from "@/repositories/catalog";

const intro: Record<
  string,
  {
    kicker: string;
    title: string;
    body: string;
    countLabel: string;
    archiveLabel: string;
    engineLabel: string;
    pricingLabel: string;
    openLabel: string;
    fromLabel: string;
    emptyTitle: string;
    emptyBody: string;
  }
> = {
  ar: {
    kicker: "أرشيف الأدوات",
    title: "كل أداة. مهمة واضحة. نتيجة قابلة للاستخدام.",
    body: "فهرس كامل للأدوات المنشورة داخل إمبراطورية الويب. اختر المهمة وافتح الأداة مباشرة.",
    countLabel: "أداة منشورة",
    archiveLabel: "فهرس الأدوات",
    engineLabel: "المحرك",
    pricingLabel: "النقاط",
    openLabel: "افتح الأداة",
    fromLabel: "من",
    emptyTitle: "لا توجد أدوات منشورة الآن",
    emptyBody: "ارجع لاحقًا. سيتم عرض الأدوات النشطة هنا مباشرة عند نشرها.",
  },
  en: {
    kicker: "TOOL ARCHIVE",
    title: "Every tool. One clear task. One usable result.",
    body: "A complete index of published tools inside Web Empire. Pick the job and open the tool directly.",
    countLabel: "published tools",
    archiveLabel: "Tool archive",
    engineLabel: "Engine",
    pricingLabel: "Credits",
    openLabel: "Open tool",
    fromLabel: "From",
    emptyTitle: "No published tools yet",
    emptyBody: "Check back soon. Active tools will appear here as soon as they are published.",
  },
  fr: {
    kicker: "ARCHIVE DES OUTILS",
    title: "Chaque outil. Une mission claire. Un résultat exploitable.",
    body: "Un index complet des outils publiés dans Web Empire. Choisissez la mission et ouvrez l’outil directement.",
    countLabel: "outils publiés",
    archiveLabel: "Archive des outils",
    engineLabel: "Moteur",
    pricingLabel: "Crédits",
    openLabel: "Ouvrir l’outil",
    fromLabel: "À partir de",
    emptyTitle: "Aucun outil publié pour le moment",
    emptyBody: "Revenez bientôt. Les outils actifs apparaîtront ici dès leur publication.",
  },
  tr: {
    kicker: "ARAC ARSIVI",
    title: "Her arac. Net bir gorev. Kullanilabilir bir sonuc.",
    body: "Web Empire icinde yayinda olan araclarin tam dizini. Gorevi secin ve araci dogrudan acin.",
    countLabel: "yayindaki arac",
    archiveLabel: "Arac arsivi",
    engineLabel: "Motor",
    pricingLabel: "Puan",
    openLabel: "Araci ac",
    fromLabel: "En az",
    emptyTitle: "Henuz yayinda arac yok",
    emptyBody: "Kisa sure sonra tekrar bakin. Aktif araclar yayinlandiginda burada gorunecek.",
  },
  ur: {
    kicker: "ٹول آرکائیو",
    title: "ہر ٹول۔ واضح کام۔ قابلِ استعمال نتیجہ۔",
    body: "Web Empire میں شائع شدہ ٹولز کا مکمل انڈیکس۔ کام منتخب کریں اور ٹول براہ راست کھولیں۔",
    countLabel: "شائع شدہ ٹولز",
    archiveLabel: "ٹول آرکائیو",
    engineLabel: "انجن",
    pricingLabel: "پوائنٹس",
    openLabel: "ٹول کھولیں",
    fromLabel: "سے",
    emptyTitle: "ابھی کوئی شائع شدہ ٹول موجود نہیں",
    emptyBody: "بعد میں دوبارہ دیکھیں۔ فعال ٹولز شائع ہوتے ہی یہاں دکھائی دیں گے۔",
  },
};

export default async function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();
  const [tools, messages] = await Promise.all([getActiveTools(locale.code), getUiMessages(locale)]);
  const copy = intro[locale.code] ?? intro.en;
  const archiveTools = tools.map((tool) => ({
    key: String(tool.id),
    slug: tool.slug,
    title: tool.title,
    description: tool.localizedDescription,
    engineType: tool.engine_type,
    pricingMode: tool.pricing_mode,
    fixedPoints: Number(tool.fixed_points),
    minimumPoints: Number(tool.minimum_points),
  }));
  const engines = Array.from(new Set(archiveTools.map((tool) => tool.engineType)));

  return (
    <main className="empire-archive-page">
      <header className="empire-archive-hero">
        <div className="container empire-archive-hero-grid">
          <div>
            <p className="empire-section-kicker">{copy.kicker}</p>
            <h1 className="empire-archive-title">{copy.title}</h1>
          </div>

          <div className="empire-archive-side">
            <p className="empire-archive-intro">{copy.body}</p>
            <p className="empire-archive-count" aria-label={copy.countLabel}>
              <strong>{String(tools.length).padStart(2, "0")}</strong>
              <span>{copy.countLabel}</span>
            </p>
          </div>
        </div>
      </header>

      <section className="container empire-archive-wrap">
        <ToolsArchive
          locale={locale.code}
          localeCode={locale.locale_code}
          tools={archiveTools}
          engines={engines}
          labels={{
            archiveLabel: copy.archiveLabel,
            engineLabel: copy.engineLabel,
            pricingLabel: copy.pricingLabel,
            openLabel: copy.openLabel,
            freeLabel: translate(messages, "common.free"),
            pointsLabel: translate(messages, "common.points"),
            fromLabel: copy.fromLabel,
            emptyTitle: copy.emptyTitle,
            emptyBody: copy.emptyBody,
          }}
        />
      </section>
    </main>
  );
}
