import "@/app/globals.css";
import "@/app/admin-v2.css";

import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Admin | Web Empire",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <html lang="ar" dir="rtl">
      <body className="admin-root">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
