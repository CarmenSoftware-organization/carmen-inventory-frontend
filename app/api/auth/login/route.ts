import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/cookies";
import { BACKEND_URL, X_APP_ID } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-app-id": X_APP_ID },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: data.message || "Login failed" },
      { status: res.status },
    );
  }

  const data = await res.json();
  const { access_token, refresh_token, expires_in, platform_role } = data;

  if (!access_token || !refresh_token) {
    return NextResponse.json(
      { error: "Invalid login response from backend" },
      { status: 502 },
    );
  }

  const cookieStore = await cookies();

  cookieStore.set({
    ...ACCESS_TOKEN_COOKIE,
    value: access_token,
    maxAge: expires_in ?? ACCESS_TOKEN_COOKIE.maxAge,
  });

  cookieStore.set({
    ...REFRESH_TOKEN_COOKIE,
    value: refresh_token,
  });

  // Fetch user profile after login (with timeout)
  try {
    const profileRes = await fetch(`${BACKEND_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "x-app-id": X_APP_ID,
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!profileRes.ok) {
      return NextResponse.json({ platform_role });
    }

    const profileJson = await profileRes.json();
    return NextResponse.json({ platform_role, profile: profileJson.data });
  } catch {
    // Profile fetch failed/timed out — login still succeeds
    return NextResponse.json({ platform_role });
  }
}
