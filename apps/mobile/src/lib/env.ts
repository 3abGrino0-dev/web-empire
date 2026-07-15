function firstDefined(...values: (string | undefined)[]): string | undefined {
  return values.find((value) => value && value.trim().length > 0);
}

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing mobile environment variable: ${name}`);
  return value;
}

export const mobileEnv = {
  apiUrl: firstDefined(process.env.EXPO_PUBLIC_API_URL, process.env.NEXT_PUBLIC_SITE_URL, "https://webempire.site")!.replace(/\/$/, ""),
  get supabaseUrl() {
    return required(
      "EXPO_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL",
      firstDefined(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL),
    );
  },
  get supabasePublishableKey() {
    return required(
      "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      firstDefined(
        process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      ),
    );
  },
};
