import prisma from "@plugins/prisma";
import { HttpError } from "elysia-logger";
import { CheckToken } from "@modules/auth/auth.service";

type CookieStore = {
    token: { value: string | undefined; set: (options?: any) => void; remove: () => void };
    userName: { value: string | undefined; set: (options?: any) => void; remove: () => void };
    userRole: { value: string | undefined; set: (options?: any) => void; remove: () => void };
};

export async function LunchboxList({ cookie }: { cookie: CookieStore }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const lunchboxes = await prisma.lunchbox.findRaw({});

        const menus = await prisma.menu.findMany({
            select: {
                menu_lunchbox: true,
            },
        });

        const lunchboxCostMap = new Map<string, number>();
        menus.forEach((menu) => {
            menu.menu_lunchbox.forEach((lb: any) => {
                const key = `${lb.lunchbox_name}_${lb.lunchbox_set_name}`;
                if (lb.lunchbox_cost && !lunchboxCostMap.has(key)) {
                    lunchboxCostMap.set(key, Number(lb.lunchbox_cost));
                }
            });
        });

        const result = (lunchboxes as unknown as any[]).map((lb: any) => {
            const key = `${lb.lunchbox_name}_${lb.lunchbox_set_name}`;
            return {
                lunchbox_name: lb.lunchbox_name,
                lunchbox_set_name: lb.lunchbox_set_name,
                lunchbox_limit: lb.lunchbox_limit,
                lunchbox_name_image: lb.lunchbox_name_image || null,
                lunchbox_set_name_image: lb.lunchbox_set_name_image || null,
                lunchbox_cost: lunchboxCostMap.get(key) || 0,
                lunchbox_order_select: lb.lunchbox_order_select || [],
                lunchbox_check_all: lb.lunchbox_check_all || false,
            };
        });

        return result;
    } catch (error) {
        console.error("Database error:", error);
        throw new HttpError(500, "Internal Server Error");
    }
}

export async function LunchboxCategories({ cookie, request }: { cookie: CookieStore, request: Request }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { searchParams } = new URL(request.url);
        const lunchbox_name = searchParams.get("lunchbox_name");
        const lunchbox_set_name = searchParams.get("lunchbox_set_name");

        if (!lunchbox_name || !lunchbox_set_name) {
            throw new HttpError(400, "Missing required parameters");
        }

        // ใช้ $runCommandRaw เพื่อหลีกเลี่ยงปัญหา null ใน menu_cost กับ Prisma
        const menus = await prisma.menu.findRaw({
            filter: {
                menu_lunchbox: {
                    $elemMatch: {
                        lunchbox_name: lunchbox_name,
                        lunchbox_set_name: lunchbox_set_name,
                    },
                },
            },
        });

        const result = (menus as unknown as any[]).map((menu: any) => {
            const matchingLunchbox = menu.menu_lunchbox?.find(
                (lb: any) => lb.lunchbox_name === lunchbox_name && lb.lunchbox_set_name === lunchbox_set_name
            );

            return {
                menu_id: menu.menu_id,
                menu_name: menu.menu_name,
                menu_subname: menu.menu_subname,
                menu_category: menu.menu_category,
                menu_cost: menu.menu_cost ?? 0,
                lunchbox_cost: matchingLunchbox?.lunchbox_cost ?? menu.menu_cost ?? 0,
                menu_ingredients: menu.menu_ingredients || [],
                menu_description: "",
                lunchbox_menu_category: matchingLunchbox?.lunchbox_menu_category || null,
                lunchbox_showPrice: matchingLunchbox?.lunchbox_showPrice ?? true,
                lunchbox_AutoRice: matchingLunchbox?.lunchbox_AutoRice ?? false,
                lunchbox_menuid: matchingLunchbox?.lunchbox_menuid || "",
            };
        });

        return {
            success: true,
            data: result,
            count: result.length,
            filters: {
                lunchbox_name: lunchbox_name,
                lunchbox_set_name: lunchbox_set_name,
            },
        };
    } catch (error) {
        console.error("Database error:", error);
        throw new HttpError(500, "Internal Server Error");
    }
}