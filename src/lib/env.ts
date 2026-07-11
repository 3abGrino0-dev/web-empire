import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const serverEnv = {
  get supabaseUrl() { return required("NEXT_PUBLIC_SUPABASE_URL"); },
  get supabasePublishableKey() { return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"); },
  get supabaseSecretKey() { return required("SUPABASE_SECRET_KEY"); }
};

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://webempire.site"
};
