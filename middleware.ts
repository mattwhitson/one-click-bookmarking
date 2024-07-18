import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

const unprotectedRoutes = ["/login"];

const protectedRoutes = ["/api", "/bookmarks"];

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const isUnprotectedRoute = unprotectedRoutes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );
  if (isUnprotectedRoute || request.nextUrl.pathname === "/") {
    if (
      session &&
      (request.nextUrl.pathname === "/" ||
        request.nextUrl.pathname === "/login")
    ) {
      const absoluteURL = new URL("/bookmarks", request.nextUrl.origin);
      return NextResponse.redirect(absoluteURL.toString());
    }
    return NextResponse.next();
  }
  const isProtectedRoute = protectedRoutes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );
  if (!session && isProtectedRoute) {
    const absoluteURL = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }
  return NextResponse.next();
}
