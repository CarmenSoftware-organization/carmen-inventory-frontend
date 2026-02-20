import { type NextRequest, NextResponse } from "next/server";

const EXACT_PUBLIC = new Set(["/login", "/register"]);
const PREFIX_PUBLIC = ["/api/auth/"];

function isPublic(pathname: string) {
  if (EXACT_PUBLIC.has(pathname)) return true;
  return PREFIX_PUBLIC.some((p) => pathname.startsWith(p));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  // Redirect / to dashboard
  if (pathname === "/" && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow public paths without auth
  if (isPublic(pathname) || pathname === "/") {
    return NextResponse.next();
  }

  // Unauthenticated users → redirect to login
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
