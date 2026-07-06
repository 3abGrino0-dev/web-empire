import { VisualWorkflowBuilder } from "@/components/admin/visual-workflow-builder";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function WorkflowsPage() {
  const supabase = createSupabaseAdminClient();
  const [{ data: connections }, { data: workflows }] = await Promise.all([
    supabase.from("runtime_connections").select("id, name").eq("is_active", true).order("name"),
    supabase.from("workflows").select("id, name, slug, description, is_active, workflow_steps(count)").order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">WORKFLOW ENGINE</div>
        <h1>مسارات الإنتاج</h1>
        <p>ابنِ خطوات متسلسلة. كل خطوة تستطيع قراءة input ومخرجات الخطوات السابقة.</p>
      </div>

      <VisualWorkflowBuilder connections={(connections ?? []).map((item) => ({ id: String(item.id), name: String(item.name) }))} />

      <div className="section">
        <div className="table-wrap"><table><thead><tr><th>Workflow</th><th>Slug</th><th>الوصف</th><th>الخطوات</th><th>الحالة</th></tr></thead><tbody>{(workflows ?? []).map((workflow) => { const relation = workflow.workflow_steps as unknown; const count = Array.isArray(relation) ? Number((relation[0] as { count?: number } | undefined)?.count ?? 0) : 0; return <tr key={workflow.id}><td>{workflow.name}</td><td>{workflow.slug}</td><td>{workflow.description}</td><td>{count}</td><td>{workflow.is_active ? "نشط" : "متوقف"}</td></tr>; })}</tbody></table></div>
      </div>
    </>
  );
}
