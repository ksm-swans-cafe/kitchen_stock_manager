import prisma from "@plugins/prisma";
import { HttpError } from "elysia-logger";

const CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 วัน
};
type CookieStore = {
    token: { value: string | undefined; set: (options?: typeof CookieOptions) => void; remove: () => void };
    userName: { value: string | undefined; set: (options?: typeof CookieOptions) => void; remove: () => void };
    userRole: { value: string | undefined; set: (options?: typeof CookieOptions) => void; remove: () => void };
};

export async function GetUser() {
    try {
        const employees = await prisma.employee.findMany();
        return employees;
    } catch (error) {
        console.error(error);
        throw new HttpError(500, "Internal Server Error");
    }
}

export async function CheckToken({ cookie }: { cookie: CookieStore }) {
    const token = cookie.token?.value;
    const userRole = cookie.userRole?.value;
    const userName = cookie.userName?.value;

    if (!token || !userRole) {
        return { authenticated: false };
    }

    return {
        authenticated: true,
        token,
        userName,
        role: userRole,
    };
}

export async function Login(
    { token, username, name, role }: { token: string; username: string; name: string; role: string },
    { cookie }: { cookie: CookieStore }
) {
    const cookieOptions: typeof CookieOptions = CookieOptions;
    const cookieParams = {
        token: token,
        userName: name,
        userRole: role,
    }
    try {
        Object.entries(cookieParams).forEach(([key, value]) => {
            cookie[key as keyof CookieStore].value = value;
            cookie[key as keyof CookieStore].set(cookieOptions);
        });

        return { success: true, token, name, role };
    } catch (error: any) {
        throw new HttpError(500, error.message);
    }
}

export async function Logout({ cookie }: { cookie: CookieStore }) {
    const cookieParams = {
        token: undefined,
        userName: undefined,
        userRole: undefined,
    }
    try {
        Object.entries(cookieParams).forEach(([key, value]) => {
            cookie[key as keyof CookieStore].value = value;
            cookie[key as keyof CookieStore].remove();
        });

        return { success: true };
    } catch (error: any) {
        throw new HttpError(500, error.message);
    }
}