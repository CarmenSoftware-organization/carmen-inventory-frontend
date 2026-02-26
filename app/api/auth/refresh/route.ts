import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/cookies";
import { BACKEND_URL, X_APP_ID } from "@/lib/env";
import { SECURITY_HEADERS } from "@/lib/security-headers";

function json(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, { ...init, headers: SECURITY_HEADERS });
}

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return json({ error: "No refresh token" }, { status: 401 });
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-app-id": X_APP_ID },
    body: JSON.stringify({ refresh_token: refreshToken }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    return json({ error: "Session expired" }, { status: 401 });
  }

  const data = await res.json();

  if (!data.access_token) {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    return json(
      { error: "Invalid refresh response" },
      { status: 502 },
    );
  }

  cookieStore.set({
    ...ACCESS_TOKEN_COOKIE,
    value: data.access_token,
    maxAge:
      typeof data.expires_in === "number" && data.expires_in > 0
        ? data.expires_in
        : ACCESS_TOKEN_COOKIE.maxAge,
  });

  if (data.refresh_token) {
    cookieStore.set({
      ...REFRESH_TOKEN_COOKIE,
      value: data.refresh_token,
    });
  }

  return json({ success: true });
}
