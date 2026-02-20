import { type NextRequest, NextResponse } from "next/server";

const EXACT_PUBLIC = new Set(["/login", "/register"]);
const PREFIX_PUBLIC = ["/api/auth/"];

function isPublic(pathname: string) {
  if (EXACT_PUBLIC.has(pathname)) return true;
  return PREFIX_PUBLIC.some((p) => pathname.startsWith(p));
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  // Generate per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  // Pass nonce to server components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Redirect / to dashboard
  if (pathname === "/" && accessToken) {
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url),
    );
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  // Allow public paths without auth
  if (isPublic(pathname) || pathname === "/") {
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  // Unauthenticated users → redirect to login
  if (!accessToken) {
    const response = NextResponse.redirect(
      new URL("/login", request.url),
    );
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
