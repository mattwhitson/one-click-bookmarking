import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const unprotectedRoutes = ["/login", "/api/auth", "/api/auth/callback"];

const protectedRoutes = ["/api", "/bookmarks"];

export default async function middleware(request: NextRequest) {
  const session = await auth();
  console.log("Hi");
  const isUnprotectedRoute = unprotectedRoutes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (isUnprotectedRoute) return null;

  const isProtectedRoute = protectedRoutes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (!session && isProtectedRoute) {
    const absoluteURL = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  return null;
}
