"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = {
  label: string;
  href?: string;
  status?: "active" | "coming_soon";
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "نظرة عامة",
    items: [
      { label: "لوحة التحكم", href: "/admin", status: "active" },
      { label: "المستخدمون", status: "coming_soon" },
      { label: "حالة النظام", href: "/admin#system-status", status: "active" },
      { label: "الإصدار", href: "/admin#version", status: "active" },
      { label: "السجلات", status: "coming_soon" },
    ],
  },
  {
    title: "الأدوات",
    items: [
      { label: "جميع الأدوات", href: "/admin/tools", status: "active" },
      { label: "إضافة أداة", href: "/admin/tools/new", status: "active" },
      { label: "التصنيفات", status: "coming_soon" },
      { label: "محتوى و SEO", status: "coming_soon" },
      { label: "الأدوات ذات الصلة", status: "coming_soon" },
    ],
  },
  {
    title: "الذكاء الاصطناعي",
    items: [
      { label: "المزودون", href: "/admin/providers", status: "active" },
      { label: "النماذج", href: "/admin/providers#models", status: "active" },
      { label: "AI Routing", href: "/admin/providers#routing", status: "active" },
      { label: "AI Chat", href: "/admin/providers#ai-chat", status: "active" },
      { label: "استخدام AI المخصص", status: "coming_soon" },
    ],
  },
  {
    title: "التشغيل",
    items: [
      { label: "عمليات التشغيل", href: "/admin/runs", status: "active" },
      { label: "الأخطاء المفلترة", status: "coming_soon" },
      { label: "المحركات", status: "coming_soon" },
    ],
  },
  {
    title: "الخطط والنقاط",
    items: [
      { label: "الخطط", href: "/admin/plans", status: "active" },
      { label: "Credits", href: "/admin/plans", status: "active" },
      { label: "الفوترة", href: "/admin/billing", status: "active" },
    ],
  },
  {
    title: "الإدارة المتقدمة",
    items: [
      { label: "إدارة اللغات", href: "/admin/localization", status: "active" },
      { label: "الهوية والمظهر", href: "/admin/appearance", status: "active" },
      { label: "الاتصالات", href: "/admin/connections", status: "active" },
      { label: "المهارات", href: "/admin/skills", status: "active" },
      { label: "سير العمل", href: "/admin/workflows", status: "active" },
    ],
  },
];

const crumbLabelMap: Record<string, string> = {
  admin: "نظرة عامة",
  tools: "الأدوات",
  new: "إضافة أداة",
  providers: "الذكاء الاصطناعي",
  runs: "عمليات التشغيل",
  plans: "الخطط والنقاط",
  billing: "الفوترة",
  localization: "اللغات والترجمة",
  appearance: "المظهر والهوية",
  workflows: "المحركات",
  connections: "الاتصالات",
  skills: "المهارات",
  translations: "الترجمات",
};

function resolveTitle(pathname: string) {
  if (pathname === "/admin") {
    return "WEB EMPIRE ADMIN";
  }

  const segments = pathname.split("/").filter(Boolean);
  const last = segments.at(-1) ?? "admin";
  return crumbLabelMap[last] ?? "لوحة الإدارة";
}

function getPathnameFromHref(href: string) {
  if (!href.startsWith("/")) return null;
  try {
    return new URL(href, "http://localhost").pathname;
  } catch {
    return null;
  }
}

export function AdminShell({
  children,
  productVersion,
}: {
  children: React.ReactNode;
  productVersion: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const parts: Array<{ href: string; label: string }> = [];
    let current = "";

    for (const segment of segments) {
      current += `/${segment}`;
      parts.push({
        href: current,
        label: crumbLabelMap[segment] ?? segment,
      });
    }

    return parts;
  }, [pathname]);

  const pageTitle = resolveTitle(pathname);

  return (
    <div
      className={`adminv2-layout ${collapsed ? "is-collapsed" : ""}`}
      data-mobile-open={mobileOpen ? "true" : "false"}
    >
      <div
        className="adminv2-backdrop"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside className="adminv2-sidebar" aria-label="Admin Navigation">
        <div className="adminv2-brand-row">
          <Link href="/admin" className="adminv2-brand" onClick={() => setMobileOpen(false)}>
            <span className="adminv2-brand-title">WEB EMPIRE ADMIN</span>
            <span className="adminv2-brand-subtitle">Control Surface</span>
          </Link>
        </div>

        <nav className="adminv2-nav" aria-label="Sidebar Sections">
          {navGroups.map((group) => (
            <section key={group.title} className="adminv2-nav-group">
              <h2>{group.title}</h2>
              <div className="adminv2-nav-links">
                {group.items.map((item) => {
                  const targetPathname = item.href ? getPathnameFromHref(item.href) : null;
                  const hasHashTarget = Boolean(item.href?.includes("#"));
                  const isActive = Boolean(
                    targetPathname && !hasHashTarget && item.status !== "coming_soon" && pathname === targetPathname
                  );

                  if (!item.href || item.status === "coming_soon") {
                    return (
                      <div key={`${item.label}-${group.title}`} className="adminv2-nav-item-row">
                        <span className="adminv2-nav-link is-coming-soon" aria-disabled="true">
                          {item.label}
                        </span>
                        <span className="adminv2-soon-badge">قريبًا</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      className={`adminv2-nav-link ${isActive ? "is-active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="adminv2-sidebar-footer">
          <span>WEB EMPIRE</span>
          <span className="adminv2-version-pill" dir="ltr">{productVersion}</span>
          <Link href="/" className="adminv2-back-link" onClick={() => setMobileOpen(false)}>
            العودة للموقع
          </Link>
        </div>
      </aside>

      <div className="adminv2-main-wrap">
        <header className="adminv2-header">
          <div className="adminv2-header-start">
            <button
              type="button"
              className="adminv2-icon-btn only-mobile"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <button
              type="button"
              className="adminv2-icon-btn only-desktop"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label="Collapse sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="adminv2-header-title">
              <p className="adminv2-header-kicker">WEB EMPIRE</p>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="adminv2-header-end">
            <div className="adminv2-search-slot" role="search" aria-label="Admin Search Slot">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16.5 16.5L20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span>بحث الإدارة (قريبًا)</span>
            </div>
            <div className="adminv2-account-slot">
              <span className="adminv2-avatar" aria-hidden="true">A</span>
              <span>Admin</span>
            </div>
          </div>
        </header>

        <div className="adminv2-breadcrumbs" aria-label="Breadcrumb">
          {crumbs.map((crumb, index) => (
            <div key={crumb.href} className="adminv2-crumb-item">
              <Link href={crumb.href}>{crumb.label}</Link>
              {index < crumbs.length - 1 ? <span aria-hidden="true">/</span> : null}
            </div>
          ))}
        </div>

        <main className="adminv2-main">{children}</main>
      </div>
    </div>
  );
}
