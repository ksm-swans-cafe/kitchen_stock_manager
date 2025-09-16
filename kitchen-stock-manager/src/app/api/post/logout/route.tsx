// app/api/post/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // ลบ cookies ทั้งหมด
  cookieStore.delete("token");
  cookieStore.delete("userName");
  cookieStore.delete("userRole");

  return NextResponse.json({ success: true });
}
