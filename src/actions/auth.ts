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
  const safeNext = resolveSafeNext(locale, formData.get("next"));

  const errorPath = (code: string) =>
    `/${locale}/auth/login?error=${encodeURIComponent(code)}&next=${encodeURIComponent(safeNext)}`;

  if (!email || password.length < 6) {
    redirect(errorPath("invalid_credentials"));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    const code =
      error?.code === "email_not_confirmed"
        ? "email_not_confirmed"
        : "invalid_credentials";
    redirect(errorPath(code));
  }

  redirect(safeNext);
}

export async function signUp(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const locale = normalizeLocale(formData.get("locale"));
  const safeNext = resolveSafeNext(locale, formData.get("next"));

  if (fullName.length < 2 || !email || password.length < 8) {
    redirect(`/${locale}/auth/register?error=invalid_signup_input&next=${encodeURIComponent(safeNext)}`);
  }

  if (password !== confirmPassword) {
    redirect(`/${locale}/auth/register?error=password_mismatch&next=${encodeURIComponent(safeNext)}`);
  }

  const requestHeaders = await headers();
  const origin = resolveRequestOrigin(requestHeaders, publicEnv.siteUrl);
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("locale", locale);
  callbackUrl.searchParams.set("next", safeNext);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/${locale}/auth/register?error=signup_failed&next=${encodeURIComponent(safeNext)}`);
  }

  if (!data.session) {
    redirect(`/${locale}/auth/register?status=check_email`);
  }

  redirect(safeNext);
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const locale = normalizeLocale(formData.get("locale"));

  if (!email) {
    redirect(`/${locale}/auth/forgot-password?error=reset_failed`);
  }

  const requestHeaders = await headers();
  const origin = resolveRequestOrigin(requestHeaders, publicEnv.siteUrl);
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("locale", locale);
  callbackUrl.searchParams.set("next", `/${locale}/auth/reset-password`);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl.toString(),
  });

  if (error) {
    redirect(`/${locale}/auth/forgot-password?error=reset_failed`);
  }

  redirect(`/${locale}/auth/forgot-password?status=sent`);
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const locale = normalizeLocale(formData.get("locale"));

  if (password.length < 8 || password !== confirmPassword) {
    redirect(`/${locale}/auth/reset-password?error=password_mismatch`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/${locale}/auth/reset-password?error=reset_failed`);
  }

  await supabase.auth.signOut();
  redirect(`/${locale}/auth/login?status=password_updated`);
}

export async function signOut(formData: FormData) {
  const locale = normalizeLocale(formData.get("locale"));
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect(`/${locale}/auth/login`);
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
