import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/v1/health"];

export function middleware(request: NextRequest) {
  const token = process.env.DASHBOARD_AUTH_TOKEN;

  // If no token configured, skip auth (development mode)
  if (!token) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Public paths don't require auth
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check Bearer token (for external API clients)
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${token}`) {
    return NextResponse.next();
  }

  // Check cookie (for browser UI)
  const cookieToken = request.cookies.get("dashboard_token")?.value;
  if (cookieToken === token) {
    return NextResponse.next();
  }

  // API routes return 401
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Page routes redirect to login
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
