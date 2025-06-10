import { NextResponse } from "next/server";

export function middleware(request: Request) {
    const isAuthenticated = request.cookies!.get("isAuthenticated")?.value === "true";

  return NextResponse.next();
}