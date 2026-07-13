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

export type AdminContext = {
  userId: string;
  role: "owner" | "super_admin" | "admin" | "support" | "content_manager" | "finance_manager";
  permissions: Record<string, unknown>;
};

export async function requireAdminContext(): Promise<AdminContext> {
  const userId = await requireUser("/en/auth/login?next=%2Fadmin");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id, role, permissions, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data || data.is_active !== true) redirect("/");

  return {
    userId,
    role: data.role as AdminContext["role"],
    permissions:
      data.permissions && typeof data.permissions === "object"
        ? data.permissions as Record<string, unknown>
        : {},
  };
}

export async function requireAdmin(): Promise<string> {
  return (await requireAdminContext()).userId;
}
