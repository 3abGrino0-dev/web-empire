"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

type IconName =
  | "crown"
  | "dashboard"
  | "users"
  | "activity"
  | "tools"
  | "plans"
  | "ai"
  | "audit"
  | "settings"
  | "languages"
  | "appearance"
  | "connections"
  | "workflow"
  | "search"
  | "bell"
  | "menu"
  | "chevron"
  | "external";

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "الرئيسية",
    items: [
      { label: "لوحة التحكم", href: "/admin", icon: "dashboard" },
      { label: "المستخدمون", href: "/admin/users", icon: "users" },
      { label: "عمليات التشغيل", href: "/admin/runs", icon: "activity" },
    ],
  },
  {
    title: "الإدارة والتشغيل",
    items: [
      { label: "الأدوات", href: "/admin/tools", icon: "tools" },
      { label: "الخطط والنقاط", href: "/admin/plans", icon: "plans" },
      { label: "الذكاء الاصطناعي", href: "/admin/providers", icon: "ai" },
      { label: "الفوترة", href: "/admin/billing", icon: "activity" },
    ],
  },
  {
    title: "النظام",
    items: [
      { label: "سجل الإجراءات", href: "/admin/audit", icon: "audit" },
      { label: "اللغات والترجمة", href: "/admin/localization", icon: "languages" },
      { label: "الهوية والمظهر", href: "/admin/appearance", icon: "appearance" },
      { label: "الاتصالات", href: "/admin/connections", icon: "connections" },
      { label: "سير العمل", href: "/admin/workflows", icon: "workflow" },
      { label: "الإعدادات", href: "/admin/skills", icon: "settings" },
    ],
  },
];

const titleMap: Record<string, string> = {
  "/admin": "لوحة التحكم",
  "/admin/users": "إدارة المستخدمين",
  "/admin/runs": "عمليات التشغيل",
  "/admin/tools": "إدارة الأدوات",
  "/admin/plans": "الخطط والنقاط",
  "/admin/providers": "الذكاء الاصطناعي",
  "/admin/billing": "الفوترة",
  "/admin/audit": "سجل الإجراءات",
  "/admin/localization": "اللغات والترجمة",
  "/admin/appearance": "الهوية والمظهر",
  "/admin/connections": "الاتصالات",
  "/admin/workflows": "سير العمل",
  "/admin/skills": "الإعدادات",
};

function Icon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {name === "crown" ? (
        <>
          <path {...common} d="M3 7l4 4 5-7 5 7 4-4-2 11H5L3 7Z" />
          <path {...common} d="M6 21h12" />
        </>
      ) : null}
      {name === "dashboard" ? (
        <>
          <rect {...common} x="3" y="3" width="7" height="7" rx="2" />
          <rect {...common} x="14" y="3" width="7" height="7" rx="2" />
          <rect {...common} x="3" y="14" width="7" height="7" rx="2" />
          <rect {...common} x="14" y="14" width="7" height="7" rx="2" />
        </>
      ) : null}
      {name === "users" ? (
        <>
          <path {...common} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle {...common} cx="9" cy="7" r="4" />
          <path {...common} d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ) : null}
      {name === "activity" ? <path {...common} d="M3 12h4l2.5-7 5 14 2.5-7h4" /> : null}
      {name === "tools" ? (
        <path {...common} d="M14.7 6.3a4 4 0 0 0-5-5L7.5 3.5l3 3 2.2-2.2a4 4 0 0 0 2 5L8 16l-2-2-4 4 4 4 4-4-2-2 6.7-6.7a4 4 0 0 0 5-5l-2.2 2.2-3-3 2.2-2.2Z" />
      ) : null}
      {name === "plans" ? (
        <>
          <circle {...common} cx="12" cy="12" r="9" />
          <path {...common} d="M8 12h8M12 8v8" />
        </>
      ) : null}
      {name === "ai" ? (
        <>
          <rect {...common} x="4" y="4" width="16" height="16" rx="4" />
          <path {...common} d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
        </>
      ) : null}
      {name === "audit" ? (
        <>
          <path {...common} d="M9 11l3 3L22 4" />
          <path {...common} d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </>
      ) : null}
      {name === "settings" ? (
        <>
          <circle {...common} cx="12" cy="12" r="3" />
          <path {...common} d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.37.28.73.63 1 .98.27.35.4.78.4 1.22v.8c0 .44-.13.87-.4 1.22-.27.35-.63.7-1 .98Z" />
        </>
      ) : null}
      {name === "languages" ? (
        <>
          <circle {...common} cx="12" cy="12" r="9" />
          <path {...common} d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </>
      ) : null}
      {name === "appearance" ? (
        <>
          <circle {...common} cx="12" cy="12" r="9" />
          <path {...common} d="M12 3a9 9 0 0 0 0 18c-2.5-2.2-3.5-4.5-3.5-7s1-4.8 3.5-7Z" />
        </>
      ) : null}
      {name === "connections" ? (
        <>
          <path {...common} d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1" />
          <path {...common} d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" />
        </>
      ) : null}
      {name === "workflow" ? (
        <>
          <circle {...common} cx="6" cy="6" r="2" />
          <circle {...common} cx="18" cy="6" r="2" />
          <circle {...common} cx="12" cy="18" r="2" />
          <path {...common} d="M8 6h8M7 8l4 8M17 8l-4 8" />
        </>
      ) : null}
      {name === "search" ? (
        <>
          <circle {...common} cx="11" cy="11" r="7" />
          <path {...common} d="m16 16 4 4" />
        </>
      ) : null}
      {name === "bell" ? (
        <>
          <path {...common} d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path {...common} d="M10 21h4" />
        </>
      ) : null}
      {name === "menu" ? <path {...common} d="M4 7h16M4 12h16M4 17h16" /> : null}
      {name === "chevron" ? <path {...common} d="m15 18-6-6 6-6" /> : null}
      {name === "external" ? (
        <>
          <path {...common} d="M14 3h7v7M10 14 21 3" />
          <path {...common} d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </>
      ) : null}
    </svg>
  );
}

function resolvePageTitle(pathname: string) {
  const exact = titleMap[pathname];
  if (exact) return exact;

  const candidate = Object.entries(titleMap)
    .filter(([path]) => path !== "/admin" && pathname.startsWith(`${path}/`))
    .sort(([a], [b]) => b.length - a.length)[0];

  return candidate?.[1] ?? "لوحة الإدارة";
}

export function AdminShell({
  children,
  productVersion,
}: {
  children: ReactNode;
  productVersion: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = useMemo(() => resolvePageTitle(pathname), [pathname]);

  return (
    <div
      className={`adminv3-layout ${collapsed ? "is-collapsed" : ""}`}
      data-mobile-open={mobileOpen ? "true" : "false"}
    >
      <button
        type="button"
        className="adminv3-backdrop"
        aria-label="إغلاق القائمة"
        onClick={() => setMobileOpen(false)}
      />

      <aside className="adminv3-sidebar" aria-label="التنقل الإداري">
        <div className="adminv3-brand-row">
          <Link href="/admin" className="adminv3-brand" onClick={() => setMobileOpen(false)}>
            <span className="adminv3-brand-mark"><Icon name="crown" /></span>
            <span className="adminv3-brand-copy">
              <strong>WEB EMPIRE</strong>
              <small>CONTROL CENTER</small>
            </span>
          </Link>
        </div>

        <nav className="adminv3-nav">
          {navGroups.map((group) => (
            <section className="adminv3-nav-group" key={group.title}>
              <h2>{group.title}</h2>
              <div className="adminv3-nav-list">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`adminv3-nav-link ${isActive ? "is-active" : ""}`}
                      title={collapsed ? item.label : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="adminv3-nav-icon"><Icon name={item.icon} /></span>
                      <span className="adminv3-nav-label">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="adminv3-sidebar-footer">
          <div className="adminv3-admin-card">
            <span className="adminv3-avatar">A</span>
            <span className="adminv3-admin-copy">
              <strong>Admin</strong>
              <small>مدير النظام</small>
            </span>
          </div>
          <Link href="/" className="adminv3-site-link">
            <Icon name="external" />
            <span>العودة إلى الموقع</span>
          </Link>
        </div>
      </aside>

      <div className="adminv3-main-wrap">
        <header className="adminv3-header">
          <div className="adminv3-header-primary">
            <button
              type="button"
              className="adminv3-icon-button adminv3-mobile-menu"
              aria-label="فتح القائمة"
              onClick={() => setMobileOpen((current) => !current)}
            >
              <Icon name="menu" />
            </button>

            <button
              type="button"
              className="adminv3-icon-button adminv3-collapse-button"
              aria-label={collapsed ? "توسيع القائمة" : "تصغير القائمة"}
              onClick={() => setCollapsed((current) => !current)}
            >
              <Icon name="chevron" />
            </button>

            <div className="adminv3-title-block">
              <p>WEB EMPIRE ADMIN</p>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="adminv3-header-actions">
            <div className="adminv3-search" role="search">
              <Icon name="search" />
              <span>بحث سريع...</span>
              <kbd>⌘ K</kbd>
            </div>

            <button type="button" className="adminv3-icon-button" aria-label="الإشعارات">
              <Icon name="bell" />
              <span className="adminv3-notification-dot" />
            </button>

            <div className="adminv3-header-account">
              <span className="adminv3-avatar">A</span>
              <span>
                <strong>Admin</strong>
                <small>{productVersion}</small>
              </span>
            </div>
          </div>
        </header>

        <main className="adminv3-main">{children}</main>
      </div>
    </div>
  );
}
