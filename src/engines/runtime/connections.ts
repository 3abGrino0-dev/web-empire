import "server-only";

import { isIP } from "node:net";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface RuntimeConnection {
  id: string;
  name: string;
  slug: string;
  base_url: string;
  auth_header: string;
  auth_prefix: string;
  default_headers: Record<string, string>;
  max_timeout_ms: number;
  is_active: boolean;
}

function assertSafeBaseUrl(rawUrl: string): URL {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:") throw new Error("RUNTIME_CONNECTION_HTTPS_REQUIRED");

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname === "metadata.google.internal" ||
    hostname === "169.254.169.254"
  ) {
    throw new Error("RUNTIME_CONNECTION_HOST_BLOCKED");
  }

  if (isIP(hostname)) {
    const blockedIpv4 = /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
    const blockedIpv6 = /^(::1$|fc|fd|fe80:)/i;
    if (blockedIpv4.test(hostname) || blockedIpv6.test(hostname)) {
      throw new Error("RUNTIME_CONNECTION_PRIVATE_IP_BLOCKED");
    }
  }

  return url;
}

export function validateRuntimeConnectionBaseUrl(rawUrl: string): string {
  const url = assertSafeBaseUrl(rawUrl);
  url.pathname = url.pathname.replace(/\/$/, "");
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export async function getRuntimeConnection(connectionId: string): Promise<{
  connection: RuntimeConnection;
  secret: string | null;
}> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("runtime_connections")
    .select("*")
    .eq("id", connectionId)
    .eq("is_active", true)
    .single();

  if (error || !data) throw new Error("RUNTIME_CONNECTION_NOT_FOUND");

  const connection = data as RuntimeConnection;
  validateRuntimeConnectionBaseUrl(connection.base_url);

  const { data: secretData, error: secretError } = await supabase.rpc(
    "get_runtime_connection_secret",
    { p_connection_id: connection.id },
  );

  if (secretError) throw new Error(secretError.message);

  return {
    connection,
    secret: secretData ? String(secretData) : null,
  };
}
