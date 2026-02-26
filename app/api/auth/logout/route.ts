import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BACKEND_URL, X_APP_ID } from "@/lib/env";
import { SECURITY_HEADERS } from "@/lib/security-headers";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Invalidate token on backend (best-effort, don't block logout)
  if (accessToken) {
    fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-app-id": X_APP_ID,
      },
      signal: AbortSignal.timeout(5_000),
    }).catch(() => {}); // fire-and-forget
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  return NextResponse.json({ success: true }, { headers: SECURITY_HEADERS });
}
