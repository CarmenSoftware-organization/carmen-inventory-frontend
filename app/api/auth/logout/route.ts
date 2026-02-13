import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  const hadAccessToken = cookieStore.has("access_token");
  const hadRefreshToken = cookieStore.has("refresh_token");

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  console.log("[logout]", {
    hadAccessToken,
    hadRefreshToken,
    afterAccessToken: cookieStore.has("access_token"),
    afterRefreshToken: cookieStore.has("refresh_token"),
  });

  return NextResponse.json({ success: true });
}
