import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/cookies";
import { checkServerRateLimit } from "@/lib/rate-limit";

const BACKEND_URL = process.env.BACKEND_URL;
const X_APP_ID = process.env.X_APP_ID!;

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
} as const;

const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB
const FETCH_TIMEOUT_MS = 15_000; // 15s

async function refreshAccessToken(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): Promise<string | null> {
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return null;

  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    return null;
  }

  const data = await res.json();

  cookieStore.set({
    ...ACCESS_TOKEN_COOKIE,
    value: data.access_token,
    maxAge: data.expires_in ?? ACCESS_TOKEN_COOKIE.maxAge,
  });

  if (data.refresh_token) {
    cookieStore.set({
      ...REFRESH_TOKEN_COOKIE,
      value: data.refresh_token,
    });
  }

  return data.access_token;
}

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] },
) {
  // --- SERVER-SIDE RATE LIMIT ---
  const rateLimited = checkServerRateLimit(
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    { windowMs: 60_000, maxRequests: 100 },
  );
  if (rateLimited) return rateLimited;

  // --- PATH VALIDATION ---
  const backendPath = params.path.join("/");
  if (backendPath.includes("..") || backendPath.includes("//")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const cookieStore = await cookies();
  let accessToken: string | null | undefined =
    cookieStore.get("access_token")?.value;

  if (!accessToken) {
    accessToken = await refreshAccessToken(cookieStore);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(`${BACKEND_URL}/${backendPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
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
    let res = await fetch(url.toString(), {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // Auto-refresh on 401 and retry once
    if (res.status === 401) {
      const newToken = await refreshAccessToken(cookieStore);
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(url.toString(), {
          ...init,
          headers,
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
      } else {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401 },
        );
      }
    }

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

export async function PUT(
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, await params);
}
