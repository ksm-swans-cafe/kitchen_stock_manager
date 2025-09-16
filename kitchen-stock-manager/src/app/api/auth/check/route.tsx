// app/api/auth/check/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userName = cookieStore.get("userName")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  if (!token || !userRole) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    token,
    userName,
    role: userRole,
  });
}
