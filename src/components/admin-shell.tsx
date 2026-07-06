import Link from "next/link";

const items = [
  ["/admin", "لوحة التحكم"],
  ["/admin/tools", "الأدوات"],
  ["/admin/connections", "Connections"],
  ["/admin/workflows", "Workflows"],
  ["/admin/providers", "مزودو AI والنماذج"],
  ["/admin/skills", "Skills"],
  ["/admin/plans", "النقاط والخطط"],
  ["/admin/billing", "الاشتراكات والدفع"],
  ["/admin/localization", "اللغات والدول"],
  ["/admin/appearance", "المظهر والهوية"],
  ["/admin/runs", "التشغيلات"],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/admin" className="brand">
          <span className="brand-crown">♛</span>
          <span>إدارة الإمبراطورية</span>
        </Link>

        <nav>
          {items.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>

        <Link href="/" className="button button-ghost">العودة للموقع</Link>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
