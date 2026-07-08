import { notFound } from "next/navigation";

import { ToolCard } from "@/components/tool-card";
import { translate } from "@/localization/messages";
import { getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getActiveTools } from "@/repositories/catalog";

const intro: Record<string, { kicker: string; title: string; body: string }> = {
  ar: { kicker: "كتالوج الأدوات", title: "كل أداة. مساحة إنجاز مستقلة.", body: "الأدوات المنشورة فعليًا داخل إمبراطورية الويب، مرتبة كواجهة أعمال بدل شبكة بطاقات متكررة." },
  en: { kicker: "TOOL CATALOG", title: "Every tool. Its own working space.", body: "The tools currently published inside Web Empire, presented as a showcase instead of a repeated SaaS card grid." },
  fr: { kicker: "CATALOGUE", title: "Chaque outil. Son propre espace de travail.", body: "Les outils réellement publiés dans Web Empire, présentés comme une sélection de produits." },
  tr: { kicker: "ARAÇ KATALOĞU", title: "Her araç. Kendi çalışma alanı.", body: "Web Empire içinde gerçekten yayında olan araçlar, tekrarlanan SaaS kartları yerine ürün vitrini olarak sunulur." },
  ur: { kicker: "ٹول کیٹلاگ", title: "ہر ٹول۔ اپنی کام کی جگہ۔", body: "Web Empire میں واقعی شائع شدہ ٹولز، ایک یکساں کارڈ گرڈ کے بجائے پروڈکٹ شوکیس کی صورت میں۔" },
};

export default async function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();
  const [tools, messages] = await Promise.all([getActiveTools(locale.code), getUiMessages(locale)]);
  const copy = intro[locale.code] ?? intro.en;

  return (
    <main className="editorial-page">
      <section className="editorial-page-hero"><div className="container editorial-page-hero-grid"><div><p className="empire-section-kicker">{copy.kicker}</p><h1 className="editorial-page-title">{copy.title}</h1></div><p className="editorial-page-intro">{copy.body}</p></div></section>
      <section className="container editorial-tools-wrap">
        <div className="editorial-tools-count"><span>{String(tools.length).padStart(2, "0")}</span><p>{translate(messages, "tools.title")}</p></div>
        <div className="editorial-tools-grid">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} locale={locale.code} messages={messages} />)}</div>
      </section>
    </main>
  );
}
