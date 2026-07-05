import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { username, pin } = await request.json();

  if (!username || pin === undefined || pin === null || String(pin).length === 0) {
    return NextResponse.json({ success: false, error: "Username and pin are required" }, { status: 400 });
  }

  const pinInt = parseInt(String(pin), 10);
  if (Number.isNaN(pinInt)) {
    return NextResponse.json({ success: false, error: "Invalid pin" }, { status: 400 });
  }

  // PIN comparison is done server-side against the DB so employee PINs are never sent to the client.
  const employees = await prisma.employee.findMany();
  const matched = employees.find(
    (emp) => emp.employee_username?.toLowerCase() === String(username).toLowerCase() && Number(emp.employee_pin) === pinInt
  );

  if (!matched) {
    return NextResponse.json({ success: false, error: "Invalid username or pin" }, { status: 401 });
  }

  const roles = matched.employee_roles && matched.employee_roles.length > 0 ? matched.employee_roles : [];
  const role = roles[0] || "";
  const name = `${matched.employee_firstname} ${matched.employee_lastname}`;
  const token = randomUUID();

  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 วัน
  });

  cookieStore.set("userName", name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  cookieStore.set("userRole", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  cookieStore.set("userRoles", JSON.stringify(roles), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ success: true });
}
