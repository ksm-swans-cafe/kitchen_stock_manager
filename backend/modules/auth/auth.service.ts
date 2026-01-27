import prisma from "@plugins/prisma";
import { HttpError } from "elysia-logger";
import convertBigIntToNumber from "@plugins/convert/BigInt-Number";

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

export async function GetUserById({ cookie, params }: { cookie: CookieStore, params: { id: string } }) {
    try {
        const authResult = await CheckToken({ cookie: cookie as any });
        if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

        const { id: employee_id } = params;

        if (!employee_id) {
            throw new HttpError(400, "Employee ID is required");
        }

        const employeeData = await prisma.employee.findFirst({
            where: { employee_id: employee_id },
        });

        if (!employeeData) {
            throw new HttpError(404, "Employee not found");
        }

        const employee = {
            employee_id: employeeData.employee_id,
            employee_username: employeeData.employee_username ?? "",
            employee_firstname: employeeData.employee_firstname ?? "",
            employee_lastname: employeeData.employee_lastname ?? "",
            employee_pin: employeeData.employee_pin !== null && employeeData.employee_pin !== undefined ? Number(employeeData.employee_pin) : 0,
            employee_role: employeeData.employee_role ?? "",
        };

        const convertedResult = convertBigIntToNumber(employee);

        return convertedResult;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        if (error instanceof HttpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to fetch user");
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