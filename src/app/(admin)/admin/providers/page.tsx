import {
  createModelAction,
  createProviderAction
} from "@/actions/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function ProvidersPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: providers }, { data: models }] = await Promise.all([
    supabase.from("ai_providers").select("*").order("priority"),
    supabase
      .from("ai_models")
      .select("*, ai_providers(name)")
      .order("priority")
  ]);

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">UNIVERSAL AI</div>
        <h1>مزودو الذكاء الاصطناعي</h1>
        <p>
          المفتاح يخزن في Vault. أضف OpenAI أو Claude أو Gemini أو منصة
          متوافقة أو HTTP مخصص.
        </p>
      </div>

      <div className="panel">
        <h2>إضافة مزود</h2>
        <form action={createProviderAction} className="admin-form">
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
              Adapter
              <select name="adapter_type">
                <option value="openai_responses">OpenAI Responses</option>
                <option value="anthropic_messages">
                  Anthropic Messages
                </option>
                <option value="gemini_generate_content">Gemini</option>
                <option value="openai_compatible">
                  OpenAI Compatible
                </option>
                <option value="custom_http">Custom HTTP</option>
              </select>
            </label>

            <label>
              Base URL
              <input name="base_url" />
            </label>

            <label>
              Priority
              <input name="priority" type="number" defaultValue="100" />
            </label>

            <label>
              API Key
              <input
                name="api_key"
                type="password"
                autoComplete="new-password"
              />
            </label>

            <label className="full">
              Config JSON
              <textarea name="config" defaultValue="{}" />
            </label>
          </div>

          <button className="button button-primary">إضافة المزود</button>
        </form>
      </div>

      <div className="section">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>المزود</th>
                <th>Adapter</th>
                <th>Priority</th>
                <th>Secret</th>
              </tr>
            </thead>
            <tbody>
              {providers?.map((provider) => (
                <tr key={provider.id}>
                  <td>{provider.name}</td>
                  <td>{provider.adapter_type}</td>
                  <td>{provider.priority}</td>
                  <td>{provider.secret_id ? "Configured" : "Missing"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h2>إضافة نموذج</h2>
        <form action={createModelAction} className="admin-form">
          <div className="form-grid">
            <label>
              المزود
              <select name="provider_id" required>
                {providers?.map((provider) => (
                  <option value={provider.id} key={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              اسم العرض
              <input name="name" required />
            </label>

            <label>
              Model Key
              <input name="model_key" required />
            </label>

            <label>
              Alias
              <input name="alias" defaultValue="standard" />
            </label>

            <label>
              Capabilities
              <input name="capabilities" defaultValue="text" />
            </label>

            <label>
              Input $ / 1M
              <input
                name="input_cost_per_million_usd"
                type="number"
                step="0.000001"
                defaultValue="0"
              />
            </label>

            <label>
              Output $ / 1M
              <input
                name="output_cost_per_million_usd"
                type="number"
                step="0.000001"
                defaultValue="0"
              />
            </label>

            <label>
              Cached Input $ / 1M
              <input
                name="cached_input_cost_per_million_usd"
                type="number"
                step="0.000001"
                defaultValue="0"
              />
            </label>

            <label>
              Max Output Tokens
              <input
                name="max_output_tokens"
                type="number"
                defaultValue="4096"
              />
            </label>

            <label>
              Priority
              <input name="priority" type="number" defaultValue="100" />
            </label>
          </div>

          <button className="button button-dark">إضافة النموذج</button>
        </form>
      </div>

      <div className="section">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>النموذج</th>
                <th>المزود</th>
                <th>Alias</th>
                <th>Input</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              {models?.map((model) => (
                <tr key={model.id}>
                  <td>{model.name}</td>
                  <td>{model.ai_providers?.name}</td>
                  <td>{model.alias}</td>
                  <td>{model.input_cost_per_million_usd}</td>
                  <td>{model.output_cost_per_million_usd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
