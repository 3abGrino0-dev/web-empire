import "@/app/globals.css";
import "@/app/admin-v3.css";

import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { formatProductVersion } from "@/lib/product-version";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin | Web Empire",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const activeToolsResult = await supabase
    .from("tools")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  const productVersion = activeToolsResult.error
    ? "VERSION UNAVAILABLE"
    : formatProductVersion(activeToolsResult.count ?? 0);

  return (
    <html lang="ar" dir="rtl">
      <body className="admin-root">
        <AdminShell productVersion={productVersion}>{children}</AdminShell>
      </body>
    </html>
  );
}
