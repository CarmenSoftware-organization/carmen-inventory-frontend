import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/cookies";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
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

  return NextResponse.json({ success: true });
}
