import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface AuthResult {
  success: boolean;
  token?: string;
  userName?: string;
  userRole?: string;
  userRoles?: string[];
  response?: NextResponse;
}

export async function checkServerAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userName = cookieStore.get("userName")?.value;
  const userRole = cookieStore.get("userRole")?.value;
  const userRolesRaw = cookieStore.get("userRoles")?.value;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  let userRoles: string[] = [];
  if (userRolesRaw) {
    try {
      const parsed = JSON.parse(userRolesRaw);
      if (Array.isArray(parsed)) userRoles = parsed;
    } catch {
      // fall through to userRole-only fallback below
    }
  }
  if (userRoles.length === 0 && userRole) userRoles = [userRole];

  return {
    success: true,
    token,
    userName,
    userRole,
    userRoles,
  };
}

export function isElevatedRole(userRoles: string[] | undefined): boolean {
  const normalized = (userRoles ?? []).map((r) => r.toLowerCase());
  return normalized.some((r) => r === "admin" || r === "developer" || r === "dev");
}
