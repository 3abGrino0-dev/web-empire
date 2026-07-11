"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  buildAuthErrorPath,
  isAuthProvider,
  normalizeLocale,
  resolveRequestOrigin,
  resolveSafeNext,
} from "@/lib/auth/redirects";
import { publicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = normalizeLocale(formData.get("locale"));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect(buildAuthErrorPath(locale, "invalid_credentials"));
  redirect(`/${locale}/dashboard`);
}

export async function signUp(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const locale = normalizeLocale(formData.get("locale"));

  if (fullName.length < 2 || !email || password.length < 8) {
    redirect(buildAuthErrorPath(locale, "invalid_signup_input"));
  }

  if (password !== confirmPassword) {
    redirect(buildAuthErrorPath(locale, "password_mismatch"));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) redirect(buildAuthErrorPath(locale, "signup_failed"));
  redirect(`/${locale}/dashboard`);
}

export async function signInWithProvider(formData: FormData) {
  const locale = normalizeLocale(formData.get("locale"));
  const providerInput = formData.get("provider");

  if (!isAuthProvider(providerInput)) {
    redirect(buildAuthErrorPath(locale, "invalid_provider"));
  }

  const provider = providerInput;
  const safeNext = resolveSafeNext(locale, formData.get("next"));
  const requestHeaders = await headers();
  const origin = resolveRequestOrigin(requestHeaders, publicEnv.siteUrl);

  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("locale", locale);
  callbackUrl.searchParams.set("next", safeNext);

  const supabase = await createSupabaseServerClient();
  const oauthResult = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
      scopes: provider === "azure" ? "openid profile email" : undefined,
    },
  });

  if (oauthResult.error || !oauthResult.data?.url) {
    redirect(buildAuthErrorPath(locale, "oauth_unavailable"));
  }

  redirect(oauthResult.data.url);
}
