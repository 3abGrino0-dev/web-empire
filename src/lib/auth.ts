import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const subject = data?.claims?.sub;
  if (error || !subject) return null;
  return String(subject);
}

export async function getUserIdFromAccessToken(
  accessToken: string,
): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.getClaims(accessToken);
  const subject = data?.claims?.sub;
  if (error || !subject) return null;
  return String(subject);
}

export async function requireUser(loginPath = "/en/auth/login"): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) redirect(loginPath);
  return userId;
}

export async function requireAdmin(): Promise<string> {
  const userId = await requireUser("/en/auth/login");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) redirect("/");
  return userId;
}
