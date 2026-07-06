import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOCALE_COOKIE } from "@/localization/resolve";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { locale?: string };
    const localeCode = String(body.locale ?? "").trim().toLowerCase();
    const supabase = await createSupabaseServerClient();

    const { data: locale, error } = await supabase
      .from("locales")
      .select("id, code")
      .eq("code", localeCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !locale) {
      return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
    }

    const userId = await getCurrentUserId();
    if (userId) {
      const { error: preferenceError } = await supabase
        .from("user_locale_preferences")
        .upsert({ user_id: userId, locale_id: locale.id }, { onConflict: "user_id" });

      if (preferenceError) throw new Error(preferenceError.message);
    }

    const response = NextResponse.json({ locale: locale.code });
    response.cookies.set(LOCALE_COOKIE, locale.code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Localization error" },
      { status: 500 },
    );
  }
}
