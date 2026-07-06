import {
  bindSkillToToolAction,
  createSkillAction
} from "@/actions/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function SkillsPage() {
  const supabase = createSupabaseAdminClient();

  const [
    { data: skills },
    { data: tools }
  ] = await Promise.all([
    supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("tools")
      .select("id, title_ar")
      .order("title_ar")
  ]);

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">SKILLS ENGINE</div>
        <h1>المهارات</h1>
        <p>تعليمات قابلة لإعادة الاستخدام وربطها بعدة أدوات.</p>
      </div>

      <div className="panel">
        <h2>Skill جديدة</h2>
        <form action={createSkillAction} className="admin-form">
          <div className="form-grid">
            <label>
              الاسم
              <input name="name" required />
            </label>

            <label>
              Slug
              <input name="slug" required />
            </label>

            <label>
              Risk
              <select name="risk_level">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>

            <label className="full">
              الوصف
              <input name="description" />
            </label>

            <label className="full">
              Instructions
              <textarea name="instructions" required />
            </label>
          </div>

          <button className="button button-primary">
            إنشاء Skill v1
          </button>
        </form>
      </div>

      <div className="section">
        <div className="panel">
          <h2>ربط Skill بأداة</h2>
          <form action={bindSkillToToolAction} className="admin-form">
            <div className="form-grid">
              <label>
                الأداة
                <select name="tool_id">
                  {tools?.map((tool) => (
                    <option value={tool.id} key={tool.id}>
                      {tool.title_ar}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Skill
                <select name="skill_id">
                  {skills?.map((skill) => (
                    <option value={skill.id} key={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                الترتيب
                <input name="sort_order" type="number" defaultValue="10" />
              </label>
            </div>

            <button className="button button-dark">ربط</button>
          </form>
        </div>
      </div>

      <div className="section">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Slug</th>
                <th>Risk</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {skills?.map((skill) => (
                <tr key={skill.id}>
                  <td>{skill.name}</td>
                  <td>{skill.slug}</td>
                  <td>{skill.risk_level}</td>
                  <td>{skill.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
