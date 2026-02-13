import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/cookies";

const BACKEND_URL = process.env.BACKEND_URL;
const X_APP_ID = process.env.X_APP_ID!;

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

  // Fetch user profile after login
  const profileRes = await fetch(`${BACKEND_URL}/api/user/profile`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "x-app-id": X_APP_ID,
    },
  });

  if (!profileRes.ok) {
    return NextResponse.json({ platform_role });
  }

  const profileJson = await profileRes.json();

  return NextResponse.json({ platform_role, profile: profileJson.data });
}
