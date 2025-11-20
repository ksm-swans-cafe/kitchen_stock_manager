import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface AuthResult {
  success: boolean;
  token?: string;
  userName?: string;
  userRole?: string;
  response?: NextResponse;
}

export async function checkServerAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userName = cookieStore.get("userName")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    success: true,
    token,
    userName,
    userRole,
  };
}
