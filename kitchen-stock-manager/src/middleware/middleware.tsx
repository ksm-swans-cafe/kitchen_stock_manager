// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("userRole")?.value as "admin" | "employee" | "customer" | undefined;
  const isLoginPage = request.nextUrl.pathname === "/login";
  const { pathname } = request.nextUrl;

  // Allow static files and API routes
  if (pathname.startsWith("/_next") || pathname.includes(".") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Admin-only routes
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Employee-only routes
  if (pathname.startsWith("/employee") && userRole !== "employee") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Customer-only routes
  if (pathname.startsWith("/customer") && userRole !== "customer") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect to login if not authenticated
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to home if already logged in
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
