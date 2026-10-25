import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Validates that a return URL is a safe internal CRM route
 * and prevents open-redirect attacks.
 */
function isSafeReturnUrl(url: string | null): boolean {
  if (!url) return false;
  // Must be a relative path starting with /admin
  if (!url.startsWith("/admin")) return false;
  // Must not begin with double slashes or backslashes (protocol-relative URL bypass)
  if (url.startsWith("//") || url.startsWith("/\\")) return false;
  // Must not contain URI scheme indicators
  if (url.includes(":") || url.includes("\\")) return false;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("fgr_admin_token")?.value;

  const isPublicAdminRoute =
    pathname === "/admin/login" ||
    pathname === "/admin/reset-password";

  // 1. Unauthenticated access to protected /admin routes
  if (pathname.startsWith("/admin") && !isPublicAdminRoute) {
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      // Store returnUrl if it's safe
      const originalPath = pathname + (request.nextUrl.search || "");
      if (isSafeReturnUrl(originalPath) && originalPath !== "/admin") {
        loginUrl.searchParams.set("returnUrl", originalPath);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Already authenticated user visiting login page -> redirect to CRM dashboard
  if (pathname === "/admin/login" && token) {
    const rawReturnUrl = searchParams.get("returnUrl");
    const target = isSafeReturnUrl(rawReturnUrl) ? (rawReturnUrl as string) : "/admin";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
