import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userName = cookieStore.get("userName")?.value;
  const userRole = cookieStore.get("userRole")?.value;
  const userRoles = cookieStore.get("userRoles")?.value;

  if (!token || (!userRole && !userRoles)) return NextResponse.json({ authenticated: false }, { status: 401 });

  // Parse roles from cookie or use single role
  let roles: string[] = [];
  if (userRoles) {
    try {
      roles = JSON.parse(userRoles);
    } catch {
      roles = userRole ? [userRole] : [];
    }
  } else if (userRole) {
    roles = [userRole];
  }

  // Fetch permissions from roles in database
  let permissions: string[] = [];
  try {
    if (roles.length > 0) {
      const roleData = await (prisma as any).role.findMany({
        where: { role_name: { in: roles } },
        select: { permissions: true },
      });
      
      // Combine all permissions from all roles
      const allPermissions: string[] = roleData.flatMap((r: any) => r.permissions || []);
      permissions = [...new Set(allPermissions)] as string[]; // Remove duplicates
    }
  } catch (error) {
    console.error("Error fetching role permissions:", error);
  }

  return NextResponse.json({
    authenticated: true,
    token,
    userName,
    role: userRole || roles[0],
    roles,
    permissions,
  });
}
