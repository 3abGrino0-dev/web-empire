"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateRuntimeConnectionBaseUrl } from "@/engines/runtime/connections";

function parseJson(value: FormDataEntryValue | null, fallback: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  return JSON.parse(text);
}

export async function createToolAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const titleAr = String(formData.get("title_ar") ?? "").trim();
  const titleEn = String(formData.get("title_en") ?? "").trim();
  const description = String(formData.get("short_description") ?? "").trim();
  const promptTemplate = String(formData.get("prompt_template") ?? "");
  const seoTitle = String(formData.get("seo_title") ?? "").trim() || titleEn;
  const seoTitleAr = String(formData.get("seo_title_ar") ?? "").trim() || titleAr;
  const seoDescription =
    String(formData.get("seo_description") ?? "").trim() || description;

  const toolPayload = {
    slug: String(formData.get("slug") ?? "").trim(),
    title_ar: titleAr,
    title_en: titleEn,
    short_description: description,
    category_id: String(formData.get("category_id") ?? ""),
    engine_type: String(formData.get("engine_type") ?? "ai_text"),
    input_schema: parseJson(formData.get("input_schema"), {
      fields: [],
      submitLabel: "تشغيل",
    }),
    output_schema: parseJson(formData.get("output_schema"), {}),
    runtime_config: parseJson(formData.get("runtime_config"), {}),
    provider_strategy: String(
      formData.get("provider_strategy") ?? "primary_with_fallback",
    ),
    model_alias: String(formData.get("model_alias") ?? "standard"),
    prompt_template: promptTemplate,
    seo_title: seoTitle,
    seo_description: seoDescription,
    pricing_mode: String(formData.get("pricing_mode") ?? "dynamic"),
    fixed_points: Number(formData.get("fixed_points") ?? 0),
    minimum_points: Number(formData.get("minimum_points") ?? 5),
    cost_multiplier: Number(formData.get("cost_multiplier") ?? 1),
    requires_auth: formData.get("requires_auth") === "on",
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  };

  const { data: locales, error: localeError } = await supabase
    .from("locales")
    .select("id, code")
    .in("code", ["ar", "en"]);
  if (localeError) throw new Error(localeError.message);

  const translations = (locales ?? []).map((locale) => ({
    locale_id: locale.id,
    title: locale.code === "ar" ? titleAr : titleEn,
    short_description: description,
    seo_title: locale.code === "ar" ? seoTitleAr : seoTitle,
    seo_description: seoDescription,
    prompt_template_override: locale.code === "ar" ? promptTemplate : null,
  }));

  const skillIds = String(formData.get("skill_ids") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const planAccess = parseJson(formData.get("plan_access_json"), []) as Array<{
    plan_id: string;
    is_allowed: boolean;
    daily_run_limit?: number | null;
    max_output_tokens?: number | null;
  }>;

  const { error } = await supabase.rpc("create_tool_from_builder", {
    p_tool: toolPayload,
    p_translations: translations,
    p_skill_ids: skillIds,
    p_plan_access: Array.isArray(planAccess) ? planAccess : [],
  });

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/tools");
  redirect("/admin/tools");
}

export async function createProviderAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("ai_providers")
    .insert({
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      adapter_type: String(
        formData.get("adapter_type") ?? "openai_responses"
      ),
      base_url: String(formData.get("base_url") ?? "").trim() || null,
      config: parseJson(formData.get("config"), {}),
      priority: Number(formData.get("priority") ?? 100),
      is_active: true
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const apiKey = String(formData.get("api_key") ?? "");
  if (apiKey) {
    const { error: secretError } = await supabase.rpc(
      "set_ai_provider_secret",
      {
        p_provider_id: data.id,
        p_secret: apiKey
      }
    );
    if (secretError) throw new Error(secretError.message);
  }

  revalidatePath("/admin/providers");
}

export async function createModelAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const capabilities = String(formData.get("capabilities") ?? "text")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const { error } = await supabase.from("ai_models").insert({
    provider_id: String(formData.get("provider_id") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    model_key: String(formData.get("model_key") ?? "").trim(),
    alias: String(formData.get("alias") ?? "standard").trim(),
    capabilities,
    input_cost_per_million_usd: Number(
      formData.get("input_cost_per_million_usd") ?? 0
    ),
    output_cost_per_million_usd: Number(
      formData.get("output_cost_per_million_usd") ?? 0
    ),
    cached_input_cost_per_million_usd: Number(
      formData.get("cached_input_cost_per_million_usd") ?? 0
    ),
    max_output_tokens: Number(formData.get("max_output_tokens") ?? 4096),
    priority: Number(formData.get("priority") ?? 100),
    is_active: true
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/providers");
}

export async function createSkillAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { data: skill, error } = await supabase
    .from("skills")
    .insert({
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      description: String(formData.get("description") ?? ""),
      risk_level: String(formData.get("risk_level") ?? "low"),
      status: "active"
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const { data: version, error: versionError } = await supabase
    .from("skill_versions")
    .insert({
      skill_id: skill.id,
      version_number: 1,
      instructions: String(formData.get("instructions") ?? "")
    })
    .select("id")
    .single();

  if (versionError) throw new Error(versionError.message);

  const { error: updateError } = await supabase
    .from("skills")
    .update({ current_version_id: version.id })
    .eq("id", skill.id);

  if (updateError) throw new Error(updateError.message);
  revalidatePath("/admin/skills");
}

export async function bindSkillToToolAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("tool_skills").upsert({
    tool_id: String(formData.get("tool_id") ?? ""),
    skill_id: String(formData.get("skill_id") ?? ""),
    sort_order: Number(formData.get("sort_order") ?? 10)
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/skills");
}

export async function updatePlanCreditsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("plans")
    .update({
      monthly_credits: Number(formData.get("monthly_credits") ?? 0),
      price_sar: Number(formData.get("price_sar") ?? 0),
      daily_ai_runs: String(formData.get("daily_ai_runs") ?? "").trim()
        ? Number(formData.get("daily_ai_runs"))
        : null,
      max_output_tokens: String(formData.get("max_output_tokens") ?? "").trim()
        ? Number(formData.get("max_output_tokens"))
        : null,
    })
    .eq("id", String(formData.get("id") ?? ""));

  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
}


export async function createLocaleAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const fallbackLocaleId = String(formData.get("fallback_locale_id") ?? "") || null;
  const isDefault = formData.get("is_default") === "on";

  const { data, error } = await supabase
    .from("locales")
    .insert({
      code: String(formData.get("code") ?? "").trim().toLowerCase(),
      locale_code: String(formData.get("locale_code") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      native_name: String(formData.get("native_name") ?? "").trim(),
      direction: String(formData.get("direction") ?? "ltr"),
      fallback_locale_id: fallbackLocaleId,
      is_default: false,
      is_active: formData.get("is_active") === "on",
      sort_order: Number(formData.get("sort_order") ?? 100),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (isDefault) {
    const { error: defaultError } = await supabase.rpc("set_default_locale", {
      p_locale_id: data.id,
    });
    if (defaultError) throw new Error(defaultError.message);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/localization");
}

export async function upsertCountryLocaleRuleAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("country_locale_rules").upsert({
    country_code: String(formData.get("country_code") ?? "").trim().toUpperCase(),
    country_name: String(formData.get("country_name") ?? "").trim(),
    locale_id: String(formData.get("locale_id") ?? ""),
    fallback_locale_id: String(formData.get("fallback_locale_id") ?? "") || null,
    is_active: formData.get("is_active") === "on",
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/localization");
}

export async function upsertUiTranslationAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("ui_translations").upsert({
    locale_id: String(formData.get("locale_id") ?? ""),
    translation_key: String(formData.get("translation_key") ?? "").trim(),
    translation_value: String(formData.get("translation_value") ?? ""),
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/localization");
}

export async function updateAppearanceAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("site_appearance")
    .update({
      preset_key: String(formData.get("preset_key") ?? "ai_saas"),
      primary_color: String(formData.get("primary_color") ?? "#7C3AED"),
      accent_color: String(formData.get("accent_color") ?? "#06B6D4"),
      background_color: String(formData.get("background_color") ?? "#F5F7FB"),
      surface_color: String(formData.get("surface_color") ?? "#FFFFFF"),
      ink_color: String(formData.get("ink_color") ?? "#0B1324"),
      dark_background_color: String(formData.get("dark_background_color") ?? "#050B16"),
      dark_surface_color: String(formData.get("dark_surface_color") ?? "#0B1628"),
      dark_ink_color: String(formData.get("dark_ink_color") ?? "#F8FAFC"),
      header_style: String(formData.get("header_style") ?? "floating"),
      hero_style: String(formData.get("hero_style") ?? "ai_search"),
      card_style: String(formData.get("card_style") ?? "soft"),
      border_radius: Number(formData.get("border_radius") ?? 20),
      ui_density: String(formData.get("ui_density") ?? "comfortable"),
      desktop_columns: Number(formData.get("desktop_columns") ?? 3),
      tablet_columns: Number(formData.get("tablet_columns") ?? 2),
      mobile_columns: Number(formData.get("mobile_columns") ?? 1),
      default_color_mode: String(formData.get("default_color_mode") ?? "system"),
      font_preset: String(formData.get("font_preset") ?? "modern"),
      updated_at: new Date().toISOString(),
    })
    .eq("singleton", true);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance");
}

export async function updateSiteIdentityAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("site_identity_translations").upsert({
    locale_id: String(formData.get("locale_id") ?? ""),
    site_name: String(formData.get("site_name") ?? "").trim(),
    site_name_en: String(formData.get("site_name_en") ?? "").trim() || null,
    tagline: String(formData.get("tagline") ?? "").trim(),
    home_seo_title: String(formData.get("home_seo_title") ?? "").trim() || null,
    home_seo_description: String(formData.get("home_seo_description") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance");
}

export async function upsertToolTranslationAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("tool_translations").upsert({
    tool_id: String(formData.get("tool_id") ?? ""),
    locale_id: String(formData.get("locale_id") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    short_description: String(formData.get("short_description") ?? "").trim(),
    seo_title: String(formData.get("seo_title") ?? "").trim() || null,
    seo_description: String(formData.get("seo_description") ?? "").trim() || null,
    prompt_template_override: String(formData.get("prompt_template_override") ?? "") || null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/tools");
}

export async function upsertToolFieldTranslationAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const optionsText = String(formData.get("options") ?? "").trim();
  let options: unknown = null;
  if (optionsText) options = JSON.parse(optionsText);

  const { error } = await supabase.from("tool_field_translations").upsert({
    tool_id: String(formData.get("tool_id") ?? ""),
    locale_id: String(formData.get("locale_id") ?? ""),
    field_key: String(formData.get("field_key") ?? "").trim(),
    label: String(formData.get("label") ?? "").trim(),
    placeholder: String(formData.get("placeholder") ?? "").trim() || null,
    help_text: String(formData.get("help_text") ?? "").trim() || null,
    options,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/tools");
}

export async function upsertCategoryTranslationAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("category_translations").upsert({
    category_id: String(formData.get("category_id") ?? ""),
    locale_id: String(formData.get("locale_id") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/localization");
}

export async function upsertPlanTranslationAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("plan_translations").upsert({
    plan_id: String(formData.get("plan_id") ?? ""),
    locale_id: String(formData.get("locale_id") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/localization");
}

export async function createCountryGroupAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("country_groups").upsert({
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    locale_id: String(formData.get("locale_id") ?? "") || null,
    fallback_locale_id: String(formData.get("fallback_locale_id") ?? "") || null,
    priority: Number(formData.get("priority") ?? 100),
    is_active: formData.get("is_active") === "on",
  }, { onConflict: "slug" });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/localization");
}

export async function addCountryGroupMemberAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("country_group_members").upsert({
    group_id: String(formData.get("group_id") ?? ""),
    country_code: String(formData.get("country_code") ?? "").trim().toUpperCase(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/localization");
}


export async function createRuntimeConnectionAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const baseUrl = validateRuntimeConnectionBaseUrl(
    String(formData.get("base_url") ?? "").trim(),
  );

  const { data, error } = await supabase
    .from("runtime_connections")
    .insert({
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      base_url: baseUrl,
      auth_header: String(formData.get("auth_header") ?? "Authorization").trim(),
      auth_prefix: String(formData.get("auth_prefix") ?? "Bearer "),
      default_headers: parseJson(formData.get("default_headers"), {}),
      max_timeout_ms: Number(formData.get("max_timeout_ms") ?? 30000),
      is_active: formData.get("is_active") === "on",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const secret = String(formData.get("secret") ?? "");
  if (secret) {
    const { error: secretError } = await supabase.rpc(
      "set_runtime_connection_secret",
      { p_connection_id: data.id, p_secret: secret },
    );
    if (secretError) throw new Error(secretError.message);
  }

  revalidatePath("/admin/connections");
}

export async function createWorkflowAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const steps = parseJson(formData.get("steps_json"), []) as Array<{
    step_key: string;
    name: string;
    step_type: string;
    sort_order: number;
    config: Record<string, unknown>;
    continue_on_error: boolean;
  }>;

  if (!Array.isArray(steps) || !steps.length || steps.length > 30) {
    throw new Error("WORKFLOW_STEPS_INVALID");
  }

  const { data: workflow, error } = await supabase
    .from("workflows")
    .insert({
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      description: String(formData.get("description") ?? ""),
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const { error: stepsError } = await supabase.from("workflow_steps").insert(
    steps.map((step, index) => ({
      workflow_id: workflow.id,
      step_key: step.step_key,
      name: step.name,
      step_type: step.step_type,
      sort_order: step.sort_order ?? (index + 1) * 10,
      config: step.config ?? {},
      continue_on_error: Boolean(step.continue_on_error),
    })),
  );

  if (stepsError) throw new Error(stepsError.message);
  revalidatePath("/admin/workflows");
}

export async function createBillingProviderAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("billing_providers")
    .insert({
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "stripe").trim(),
      adapter_type: "stripe_checkout",
      config: parseJson(formData.get("config"), {}),
      priority: Number(formData.get("priority") ?? 100),
      is_active: formData.get("is_active") === "on",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const { error: secretError } = await supabase.rpc(
    "set_billing_provider_secrets",
    {
      p_provider_id: data.id,
      p_api_secret: String(formData.get("api_secret") ?? ""),
      p_webhook_secret: String(formData.get("webhook_secret") ?? ""),
    },
  );

  if (secretError) throw new Error(secretError.message);
  revalidatePath("/admin/billing");
}

export async function upsertBillingPlanPriceAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("billing_plan_prices").upsert(
    {
      billing_provider_id: String(formData.get("billing_provider_id") ?? ""),
      plan_id: String(formData.get("plan_id") ?? ""),
      external_price_id: String(formData.get("external_price_id") ?? "").trim(),
      currency: String(formData.get("currency") ?? "sar").trim().toLowerCase(),
      is_active: true,
    },
    { onConflict: "billing_provider_id,plan_id" },
  );

  if (error) throw new Error(error.message);
  revalidatePath("/admin/billing");
  revalidatePath("/", "layout");
}
