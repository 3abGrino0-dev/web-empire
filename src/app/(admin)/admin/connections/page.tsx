import { createRuntimeConnectionAction } from "@/actions/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function ConnectionsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: connections } = await supabase
    .from("runtime_connections")
    .select("id, name, slug, base_url, auth_header, max_timeout_ms, secret_id, is_active")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">RUNTIME CONNECTIONS</div>
        <h1>الاتصالات الخارجية</h1>
        <p>أنشئ اتصالًا موثوقًا تستخدمه أدوات HTTP وWebhook. الـBase URL يثبت هنا والمفتاح في Vault.</p>
      </div>

      <form action={createRuntimeConnectionAction} className="panel admin-form">
        <div className="form-grid">
          <label>الاسم<input name="name" required /></label>
          <label>Slug<input name="slug" required /></label>
          <label className="full">Base URL HTTPS<input name="base_url" type="url" required placeholder="https://api.example.com" /></label>
          <label>Auth Header<input name="auth_header" defaultValue="Authorization" /></label>
          <label>Auth Prefix<input name="auth_prefix" defaultValue="Bearer " /></label>
          <label>Secret / API Key<input name="secret" type="password" autoComplete="new-password" /></label>
          <label>Max Timeout ms<input name="max_timeout_ms" type="number" min="1000" max="60000" defaultValue="30000" /></label>
          <label className="full">Default Headers JSON<textarea name="default_headers" defaultValue="{}" /></label>
          <label><input type="checkbox" name="is_active" defaultChecked /> اتصال نشط</label>
        </div>
        <button className="button button-primary">حفظ Connection</button>
      </form>

      <div className="section">
        <div className="table-wrap"><table><thead><tr><th>الاتصال</th><th>Base URL</th><th>Auth</th><th>Secret</th><th>Timeout</th><th>الحالة</th></tr></thead><tbody>{(connections ?? []).map((connection) => <tr key={connection.id}><td>{connection.name}<br /><small>{connection.slug}</small></td><td>{connection.base_url}</td><td>{connection.auth_header}</td><td>{connection.secret_id ? "Vault ✓" : "بدون"}</td><td>{connection.max_timeout_ms}ms</td><td>{connection.is_active ? "نشط" : "متوقف"}</td></tr>)}</tbody></table></div>
      </div>
    </>
  );
}
