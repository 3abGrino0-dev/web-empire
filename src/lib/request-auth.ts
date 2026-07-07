import "server-only";

import { getCurrentUserId, getUserIdFromAccessToken } from "@/lib/auth";

function readBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function getRequestUserId(request: Request): Promise<string | null> {
  const token = readBearerToken(request);
  if (token) return getUserIdFromAccessToken(token);
  return getCurrentUserId();
}
