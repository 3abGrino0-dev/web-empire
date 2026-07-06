import "server-only";

import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
