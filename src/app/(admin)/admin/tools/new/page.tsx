import { VisualToolBuilder } from "@/components/admin/visual-tool-builder";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function NewToolPage() {
  const supabase = createSupabaseAdminClient();
  const [categoriesResult, skillsResult, plansResult, connectionsResult, workflowsResult] = await Promise.all([
    supabase.from("categories").select("id, name_ar").eq("is_active", true).order("sort_order"),
    supabase.from("skills").select("id, name").eq("status", "active").order("name"),
    supabase.from("plans").select("id, name_ar").eq("is_active", true).order("sort_order"),
    supabase.from("runtime_connections").select("id, name").eq("is_active", true).order("name"),
    supabase.from("workflows").select("id, name").eq("is_active", true).order("name"),
  ]);

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">VISUAL TOOL BUILDER</div>
        <h1>إنشاء أداة جديدة</h1>
        <p>أنشئ الواجهة والمحرك والمهارات والنقاط والخطط بدون تحرير JSON يدويًا.</p>
      </div>
      <VisualToolBuilder
        categories={(categoriesResult.data ?? []).map((item) => ({ id: String(item.id), name: String(item.name_ar) }))}
        skills={(skillsResult.data ?? []).map((item) => ({ id: String(item.id), name: String(item.name) }))}
        plans={(plansResult.data ?? []).map((item) => ({ id: String(item.id), name: String(item.name_ar) }))}
        connections={(connectionsResult.data ?? []).map((item) => ({ id: String(item.id), name: String(item.name) }))}
        workflows={(workflowsResult.data ?? []).map((item) => ({ id: String(item.id), name: String(item.name) }))}
      />
    </>
  );
}
