"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeLocale(formData: FormData): string {
  const locale = String(formData.get("locale") ?? "en").toLowerCase();
  return /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(locale) ? locale : "en";
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = safeLocale(formData);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect(`/${locale}/auth/login?error=${encodeURIComponent(error.message)}`);
  redirect(`/${locale}/dashboard`);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = safeLocale(formData);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) redirect(`/${locale}/auth/login?error=${encodeURIComponent(error.message)}`);
  redirect(`/${locale}/dashboard`);
}
