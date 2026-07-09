import {
  createModelAction,
  createProviderAction
} from "@/actions/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function ProvidersPage() {
  const supabase = createSupabaseAdminClient();
  const recentSince = new Date();
  recentSince.setDate(recentSince.getDate() - 7);
  const recentSinceIso = recentSince.toISOString();

  const [{ data: providers }, { data: models }, { data: usageRows }] = await Promise.all([
    supabase.from("ai_providers").select("*").order("priority"),
    supabase
      .from("ai_models")
      .select("*, ai_providers(name)")
      .order("priority"),
    supabase
      .from("provider_usage")
      .select("provider_id, model_id, estimated_cost_usd, created_at")
      .gte("created_at", recentSinceIso)
      .limit(5000),
  ]);

  const providerNameMap = new Map((providers ?? []).map((provider) => [provider.id, provider.name]));
  const modelNameMap = new Map((models ?? []).map((model) => [model.id, model.name]));

  const usageMap = new Map<string, { runs: number; cost: number }>();
  for (const row of usageRows ?? []) {
    const key = `${row.provider_id ?? "unknown"}:${row.model_id ?? "unknown"}`;
    const current = usageMap.get(key) ?? { runs: 0, cost: 0 };
    current.runs += 1;
    current.cost += Number(row.estimated_cost_usd ?? 0);
    usageMap.set(key, current);
  }

  const usageSummary = Array.from(usageMap.entries())
    .map(([key, value]) => {
      const [providerId, modelId] = key.split(":");
      return {
        key,
        provider: providerNameMap.get(providerId) ?? "Unknown Provider",
        model: modelNameMap.get(modelId) ?? "Unknown Model",
        runs: value.runs,
        cost: value.cost,
      };
    })
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 12);

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">AI CONTROL SURFACE</div>
        <h1>المزودون والنماذج</h1>
        <p>
          إدارة المزود والنموذج والأولوية والتوجيه في الخلفية بدون كشف أي أسرار.
        </p>
      </div>

      <div className="panel">
        <h2>Providers</h2>
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
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {providers?.map((provider) => (
                <tr key={provider.id}>
                  <td>{provider.name}</td>
                  <td>{provider.adapter_type}</td>
                  <td>{provider.priority}</td>
                  <td>{provider.secret_id ? "Configured" : "Missing"}</td>
                  <td>
                    <span className={`status-pill ${provider.is_active ? "ok" : "warn"}`}>
                      {provider.is_active ? "نشط" : "متوقف"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" id="models">
        <h2>Models</h2>
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
                <th>الحالة</th>
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
                  <td>
                    <span className={`status-pill ${model.is_active ? "ok" : "warn"}`}>
                      {model.is_active ? "نشط" : "متوقف"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" id="routing">
        <h2>AI Routing</h2>
        <p className="inline-note">
          إدارة الخلفية: Provider + Model + Priority + Strategy. المستخدم النهائي لا يرى أسماء المزودات أو النماذج.
        </p>
        <div className="chip-row">
          <span className="chip">Provider</span>
          <span className="chip">Model</span>
          <span className="chip">Priority</span>
          <span className="chip">Strategy</span>
          <span className="chip">Routing</span>
        </div>
      </div>

      <div className="panel" id="ai-chat">
        <h2>AI Chat</h2>
        <p className="inline-note">متوقف حاليًا حسب توجيه المنتج. محفوظ في فرع WIP منفصل وغير مدموج في الإنتاج.</p>
      </div>

      <div className="section">
        <h2>Provider Usage Summary</h2>
        <p className="inline-note">آخر 7 أيام</p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Model</th>
              <th>Runs</th>
              <th>Estimated Cost</th>
            </tr>
          </thead>
          <tbody>
            {usageSummary.length ? (
              usageSummary.map((item) => (
                <tr key={item.key}>
                  <td>{item.provider}</td>
                  <td>{item.model}</td>
                  <td dir="ltr">{item.runs}</td>
                  <td dir="ltr">{formatUsd(item.cost)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>لا توجد بيانات استخدام حتى الآن.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
