import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const unprotectedRoutes = ["/login", "/api/auth", "/api/auth/callback"];

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
    return null;
  }

  const isProtectedRoute = protectedRoutes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (!session && isProtectedRoute) {
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const absoluteURL = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  return null;
}
