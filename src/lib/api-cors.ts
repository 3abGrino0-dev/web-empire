import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Headers": "accept, accept-language, authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Max-Age": "86400",
};

function withCorsHeaders(init: ResponseInit = {}): ResponseInit {
  const headers = new Headers(init.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    if (!headers.has(key)) headers.set(key, value);
  }

  return { ...init, headers };
}

export function corsJson(body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, withCorsHeaders(init));
}

export function corsOptions() {
  return new NextResponse(null, withCorsHeaders({ status: 204 }));
}
