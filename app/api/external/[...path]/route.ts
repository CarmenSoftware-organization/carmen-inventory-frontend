import { type NextRequest, NextResponse } from "next/server";
import { checkServerRateLimit } from "@/lib/rate-limit";
import { BACKEND_URL, X_APP_ID } from "@/lib/env";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
} as const;

const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB
const FETCH_TIMEOUT_MS = 15_000; // 15s

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] },
) {
  // --- SERVER-SIDE RATE LIMIT ---
  const rateLimited = checkServerRateLimit(
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    { windowMs: 60_000, maxRequests: 60 },
  );
  if (rateLimited) return rateLimited;

  // --- PATH VALIDATION ---
  const backendPath = params.path.join("/");
  if (backendPath.includes("..") || backendPath.includes("//")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const url = new URL(`${BACKEND_URL}/${backendPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    "x-app-id": X_APP_ID,
  };

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  // --- BODY SIZE LIMIT ---
  if (!["GET", "HEAD"].includes(request.method)) {
    const contentLength = parseInt(
      request.headers.get("content-length") || "0",
    );
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    init.body = await request.text();
  }

  // --- FETCH WITH TIMEOUT ---
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
        ...SECURITY_HEADERS,
      },
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json({ error: "Backend timeout" }, { status: 504 });
    }
    return NextResponse.json(
      { error: "Internal proxy error" },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, await params);
}
