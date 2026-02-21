import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;
const X_APP_ID = process.env.X_APP_ID!;

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Invalidate token on backend (best-effort, don't block logout)
  if (accessToken && BACKEND_URL) {
    fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-app-id": X_APP_ID,
      },
    }).catch(() => {}); // fire-and-forget
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  return NextResponse.json({ success: true });
}
