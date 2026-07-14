import {
  createModelAction,
  createProviderAction,
} from "@/actions/admin";
import {
  testAiProviderAction,
  toggleAiModelAction,
  toggleAiProviderAction,
  updateAiProviderSecretAction,
} from "@/actions/admin-ai";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SearchParams = {
  test?: string;
  provider?: string;
  model?: string;
  latency_ms?: string;
  input_tokens?: string;
  output_tokens?: string;
  response?: string;
  message?: string;
  secret?: string;
  update?: string;
};

type ProviderRow = {
  id: string;
  name: string;
  slug: string;
  adapter_type: string;
  base_url: string | null;
  secret_id: string | null;
  priority: number;
  is_active: boolean;
};

type ModelRow = {
  id: string;
  provider_id: string;
  name: string;
  model_key: string;
  alias: string;
  capabilities: string[];
  input_cost_per_million_usd: number;
  output_cost_per_million_usd: number;
  max_output_tokens: number;
  priority: number;
  is_active: boolean;
};

type UsageRow = {
  provider_id: string | null;
  model_id: string | null;
  estimated_cost_usd: number | null;
  created_at: string;
};

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

function adapterLabel(value: string) {
  const labels: Record<string, string> = {
    openai_responses: "OpenAI Responses",
    anthropic_messages: "Anthropic Messages",
    gemini_generate_content: "Google Gemini",
    openai_compatible: "OpenAI Compatible",
    custom_http: "Custom HTTP",
  };

  return labels[value] ?? value;
}

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const supabase = createSupabaseAdminClient();
  const recentSince = new Date();
  recentSince.setDate(recentSince.getDate() - 7);

  const [providersResult, modelsResult, usageResult] = await Promise.all([
    supabase.from("ai_providers").select("*").order("priority"),
    supabase.from("ai_models").select("*").order("priority"),
    supabase
      .from("provider_usage")
      .select("provider_id, model_id, estimated_cost_usd, created_at")
      .gte("created_at", recentSince.toISOString())
      .limit(5000),
  ]);

  if (providersResult.error) throw new Error(providersResult.error.message);
  if (modelsResult.error) throw new Error(modelsResult.error.message);

  const providers = (providersResult.data ?? []) as ProviderRow[];
  const models = (modelsResult.data ?? []) as ModelRow[];
  const usageRows = usageResult.error
    ? []
    : ((usageResult.data ?? []) as UsageRow[]);

  const modelsByProvider = new Map<string, ModelRow[]>();
  for (const model of models) {
    const rows = modelsByProvider.get(model.provider_id) ?? [];
    rows.push(model);
    modelsByProvider.set(model.provider_id, rows);
  }

  const usageByProvider = new Map<
    string,
    { runs: number; cost: number; lastAt: string | null }
  >();

  for (const usage of usageRows) {
    if (!usage.provider_id) continue;
    const current = usageByProvider.get(usage.provider_id) ?? {
      runs: 0,
      cost: 0,
      lastAt: null,
    };

    current.runs += 1;
    current.cost += Number(usage.estimated_cost_usd ?? 0);
    if (!current.lastAt || usage.created_at > current.lastAt) {
      current.lastAt = usage.created_at;
    }

    usageByProvider.set(usage.provider_id, current);
  }

  const activeProviders = providers.filter((provider) => provider.is_active).length;
  const configuredSecrets = providers.filter((provider) => provider.secret_id).length;
  const activeModels = models.filter((model) => model.is_active).length;
  const readyProviders = providers.filter((provider) => {
    const providerModels = modelsByProvider.get(provider.id) ?? [];
    return (
      provider.is_active &&
      Boolean(provider.secret_id) &&
      providerModels.some((model) => model.is_active)
    );
  }).length;

  const noticeType =
    query.test === "success" || query.secret === "success" || query.update === "success"
      ? "success"
      : query.test === "error" ||
          query.secret === "error" ||
          query.update === "error"
        ? "error"
        : null;

  return (
    <div className="ai-studio">
      <section className="adminv3-page-heading">
        <div>
          <h2>AI Provider Studio</h2>
          <p>
            ربط المزودات، حفظ المفاتيح، اختبار النماذج، وتشخيص سبب توقف أدوات
            الذكاء الاصطناعي من مكان واحد.
          </p>
        </div>
        <div className="adminv3-heading-actions">
          <span className={`adminv3-status ${readyProviders ? "" : "is-warn"}`}>
            {readyProviders
              ? `${readyProviders} مزود جاهز للتشغيل`
              : "لا يوجد مزود جاهز بالكامل"}
          </span>
        </div>
      </section>

      <section className="ai-studio-summary">
        <article>
          <span>إجمالي المزودات</span>
          <strong>{providers.length}</strong>
          <small>{activeProviders} نشط</small>
        </article>
        <article>
          <span>المفاتيح المحفوظة</span>
          <strong>{configuredSecrets}</strong>
          <small>من {providers.length}</small>
        </article>
        <article>
          <span>النماذج النشطة</span>
          <strong>{activeModels}</strong>
          <small>من {models.length}</small>
        </article>
        <article>
          <span>الجاهزية الفعلية</span>
          <strong>{readyProviders}</strong>
          <small>مزود + مفتاح + نموذج</small>
        </article>
      </section>

      {noticeType ? (
        <section className={`ai-studio-notice is-${noticeType}`}>
          <div>
            <strong>
              {noticeType === "success"
                ? "تم تنفيذ العملية بنجاح"
                : "فشلت العملية"}
            </strong>
            <p>
              {query.test === "success"
                ? `${query.provider ?? "Provider"} / ${query.model ?? "Model"}`
                : query.message ?? "راجع الإعدادات وحاول مرة أخرى."}
            </p>
          </div>

          {query.test === "success" ? (
            <div className="ai-studio-test-metrics">
              <span>Latency <b>{query.latency_ms ?? "—"} ms</b></span>
              <span>Input <b>{query.input_tokens ?? "0"}</b></span>
              <span>Output <b>{query.output_tokens ?? "0"}</b></span>
            </div>
          ) : query.latency_ms ? (
            <div className="ai-studio-test-metrics">
              <span>Latency <b>{query.latency_ms} ms</b></span>
            </div>
          ) : null}

          {query.response ? (
            <pre className="ai-studio-response">{query.response}</pre>
          ) : null}
        </section>
      ) : null}

      <section className="ai-studio-provider-grid">
        {providers.length ? (
          providers.map((provider) => {
            const providerModels = modelsByProvider.get(provider.id) ?? [];
            const activeProviderModels = providerModels.filter(
              (model) => model.is_active
            );
            const usage = usageByProvider.get(provider.id);
            const isReady =
              provider.is_active &&
              Boolean(provider.secret_id) &&
              activeProviderModels.length > 0;

            return (
              <article className="ai-provider-card" key={provider.id}>
                <header>
                  <div>
                    <span className="ai-provider-logo">
                      {provider.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <h3>{provider.name}</h3>
                      <p>{adapterLabel(provider.adapter_type)}</p>
                    </div>
                  </div>
                  <span
                    className={`ai-provider-health ${
                      isReady ? "is-ready" : "is-warning"
                    }`}
                  >
                    {isReady ? "جاهز" : "غير مكتمل"}
                  </span>
                </header>

                <div className="ai-provider-checks">
                  <div>
                    <span>حالة المزود</span>
                    <b>{provider.is_active ? "نشط" : "متوقف"}</b>
                  </div>
                  <div>
                    <span>المفتاح السري</span>
                    <b>{provider.secret_id ? "محفوظ" : "مفقود"}</b>
                  </div>
                  <div>
                    <span>النماذج النشطة</span>
                    <b>{activeProviderModels.length}</b>
                  </div>
                  <div>
                    <span>تشغيلات 7 أيام</span>
                    <b>{usage?.runs ?? 0}</b>
                  </div>
                </div>

                <div className="ai-provider-meta">
                  <span>Priority: {provider.priority}</span>
                  <span>Cost: {formatUsd(usage?.cost ?? 0)}</span>
                  <span dir="ltr">{provider.base_url || "Default API URL"}</span>
                </div>

                <form
                  action={testAiProviderAction}
                  className="ai-provider-test-form"
                >
                  <input type="hidden" name="provider_id" value={provider.id} />

                  <label>
                    <span>النموذج المراد اختباره</span>
                    <select name="model_id" required>
                      <option value="">اختر نموذجًا</option>
                      {providerModels.map((model) => (
                        <option value={model.id} key={model.id}>
                          {model.name} — {model.model_key}
                          {model.is_active ? "" : " (متوقف)"}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>رسالة الاختبار</span>
                    <input
                      name="prompt"
                      defaultValue="أجب بكلمة واحدة فقط: جاهز"
                    />
                  </label>

                  <button
                    className="admin-primary-button"
                    type="submit"
                    disabled={!provider.secret_id || providerModels.length === 0}
                  >
                    اختبر الاتصال الآن
                  </button>
                </form>

                <details className="ai-provider-details">
                  <summary>إدارة المزود</summary>

                  <form
                    action={updateAiProviderSecretAction}
                    className="ai-provider-secret-form"
                  >
                    <input
                      type="hidden"
                      name="provider_id"
                      value={provider.id}
                    />
                    <label>
                      <span>تحديث API Key</span>
                      <input
                        type="password"
                        name="api_key"
                        autoComplete="new-password"
                        required
                      />
                    </label>
                    <button className="admin-secondary-button" type="submit">
                      حفظ المفتاح
                    </button>
                  </form>

                  <form action={toggleAiProviderAction}>
                    <input
                      type="hidden"
                      name="provider_id"
                      value={provider.id}
                    />
                    <input
                      type="hidden"
                      name="next_state"
                      value={String(!provider.is_active)}
                    />
                    <button className="admin-secondary-button" type="submit">
                      {provider.is_active ? "إيقاف المزود" : "تفعيل المزود"}
                    </button>
                  </form>
                </details>
              </article>
            );
          })
        ) : (
          <div className="admin-empty-state">
            <strong>لا توجد مزودات</strong>
            <p>أضف أول مزود من قسم الإعداد بالأسفل.</p>
          </div>
        )}
      </section>

      <section className="ai-studio-models">
        <header className="adminv3-card-header">
          <div>
            <h3>النماذج والتوجيه</h3>
            <p>
              تأكد أن Alias النموذج يطابق Model Alias داخل الأداة، وإلا لن
              يدخل النموذج ضمن مرشحي التشغيل.
            </p>
          </div>
        </header>

        <div className="admin-table-scroll">
          <table>
            <thead>
              <tr>
                <th>النموذج</th>
                <th>Model Key</th>
                <th>المزود</th>
                <th>Alias</th>
                <th>الحد</th>
                <th>التكلفة</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {models.length ? (
                models.map((model) => {
                  const provider = providers.find(
                    (item) => item.id === model.provider_id
                  );

                  return (
                    <tr key={model.id}>
                      <td><strong>{model.name}</strong></td>
                      <td dir="ltr">{model.model_key}</td>
                      <td>{provider?.name ?? "—"}</td>
                      <td dir="ltr">{model.alias}</td>
                      <td dir="ltr">{model.max_output_tokens}</td>
                      <td dir="ltr">
                        {formatUsd(
                          Number(model.input_cost_per_million_usd) +
                            Number(model.output_cost_per_million_usd)
                        )}
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill ${
                            model.is_active ? "is-active" : "is-suspended"
                          }`}
                        >
                          {model.is_active ? "نشط" : "متوقف"}
                        </span>
                      </td>
                      <td>
                        <form action={toggleAiModelAction}>
                          <input
                            type="hidden"
                            name="model_id"
                            value={model.id}
                          />
                          <input
                            type="hidden"
                            name="next_state"
                            value={String(!model.is_active)}
                          />
                          <button
                            className="ai-studio-table-action"
                            type="submit"
                          >
                            {model.is_active ? "إيقاف" : "تفعيل"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8}>لا توجد نماذج مسجلة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ai-studio-setup-grid">
        <details className="ai-studio-setup" open={providers.length === 0}>
          <summary>
            <span>إضافة مزود جديد</span>
            <small>Provider + API Key</small>
          </summary>

          <form action={createProviderAction} className="ai-studio-setup-form">
            <label>
              <span>اسم المزود</span>
              <input name="name" required placeholder="Google Gemini" />
            </label>
            <label>
              <span>Slug</span>
              <input name="slug" required placeholder="google-gemini" />
            </label>
            <label>
              <span>Adapter</span>
              <select name="adapter_type">
                <option value="gemini_generate_content">Google Gemini</option>
                <option value="openai_responses">OpenAI Responses</option>
                <option value="anthropic_messages">Anthropic Messages</option>
                <option value="openai_compatible">OpenAI Compatible</option>
                <option value="custom_http">Custom HTTP</option>
              </select>
            </label>
            <label>
              <span>Base URL اختياري</span>
              <input name="base_url" dir="ltr" />
            </label>
            <label>
              <span>Priority</span>
              <input name="priority" type="number" defaultValue="100" />
            </label>
            <label>
              <span>API Key</span>
              <input
                name="api_key"
                type="password"
                autoComplete="new-password"
              />
            </label>
            <input type="hidden" name="config" value="{}" />
            <button className="admin-primary-button" type="submit">
              إضافة المزود
            </button>
          </form>
        </details>

        <details className="ai-studio-setup" open={models.length === 0}>
          <summary>
            <span>إضافة نموذج جديد</span>
            <small>Model Key + Alias</small>
          </summary>

          <form action={createModelAction} className="ai-studio-setup-form">
            <label>
              <span>المزود</span>
              <select name="provider_id" required>
                <option value="">اختر مزودًا</option>
                {providers.map((provider) => (
                  <option value={provider.id} key={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>اسم العرض</span>
              <input name="name" required placeholder="Gemini 2.5 Flash" />
            </label>
            <label>
              <span>Model Key</span>
              <input name="model_key" required dir="ltr" />
            </label>
            <label>
              <span>Alias</span>
              <input name="alias" defaultValue="standard" dir="ltr" />
            </label>
            <label>
              <span>Capabilities</span>
              <input name="capabilities" defaultValue="text" dir="ltr" />
            </label>
            <label>
              <span>Max Output Tokens</span>
              <input
                name="max_output_tokens"
                type="number"
                defaultValue="4096"
              />
            </label>
            <label>
              <span>Input $ / 1M</span>
              <input
                name="input_cost_per_million_usd"
                type="number"
                step="0.000001"
                defaultValue="0"
              />
            </label>
            <label>
              <span>Output $ / 1M</span>
              <input
                name="output_cost_per_million_usd"
                type="number"
                step="0.000001"
                defaultValue="0"
              />
            </label>
            <input
              type="hidden"
              name="cached_input_cost_per_million_usd"
              value="0"
            />
            <input type="hidden" name="priority" value="100" />
            <button className="admin-primary-button" type="submit">
              إضافة النموذج
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}
