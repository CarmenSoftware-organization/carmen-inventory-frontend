import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/cookies";

const BACKEND_URL = process.env.BACKEND_URL;
const X_APP_ID = process.env.X_APP_ID!;

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
  const cookieStore = await cookies();
  let accessToken: string | null | undefined =
    cookieStore.get("access_token")?.value;

  if (!accessToken) {
    accessToken = await refreshAccessToken(cookieStore);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const backendPath = params.path.join("/");
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

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.text();
  }

  let res = await fetch(url.toString(), init);

  // Auto-refresh on 401 and retry once
  if (res.status === 401) {
    const newToken = await refreshAccessToken(cookieStore);
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url.toString(), { ...init, headers });
    } else {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
  }

  const body = await res.text();

  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
    },
  });
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
