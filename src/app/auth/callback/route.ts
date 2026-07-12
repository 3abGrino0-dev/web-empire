import { NextResponse } from "next/server";

import {
  buildAuthErrorPath,
  normalizeLocale,
  resolveSafeNext,
} from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = normalizeLocale(url.searchParams.get("locale"));
  const callbackType = url.searchParams.get("type");
  const requestedNext =
    callbackType === "recovery"
      ? `/${locale}/auth/reset-password`
      : url.searchParams.get("next");
  const safeNext = resolveSafeNext(locale, requestedNext);
  const code = url.searchParams.get("code");

  if (!code) {
    const destination = new URL(buildAuthErrorPath(locale, "oauth_callback_failed"), url.origin);
    return NextResponse.redirect(destination);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const destination = new URL(buildAuthErrorPath(locale, "oauth_callback_failed"), url.origin);
    return NextResponse.redirect(destination);
  }

  const successDestination = new URL(safeNext, url.origin);
  return NextResponse.redirect(successDestination);
}
