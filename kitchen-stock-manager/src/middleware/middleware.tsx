import { NextResponse } from "next/server";

// เอาไว้สำหรับยืนยันการเข้าถึงหน้าเว็บ
// ใช้เพื่อเช็คว่า user ได้ login หรือยัง
export function middleware(request: Request) {
  // const isAuthenticated = request.get("isAuthenticated")?.value === "true";

  // if (request.nextUrl.pathname.startsWith('/order') && !isAuthenticated) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}