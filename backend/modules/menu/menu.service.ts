import prisma from "@plugins/prisma";
import { HttpError } from "elysia-logger";
import { CheckToken } from "@modules/auth/auth.service";
import convertBigIntToNumber from "@plugins/convert/BigInt-Number";

type CookieStore = {
    token: { value: string | undefined; set: (options?: any) => void; remove: () => void };
    userName: { value: string | undefined; set: (options?: any) => void; remove: () => void };
    userRole: { value: string | undefined; set: (options?: any) => void; remove: () => void };
};

export async function MenuList({ cookie }: { cookie: CookieStore }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const menusWithoutCost = await prisma.menu.findMany({
            orderBy: { menu_id: "asc" },
            select: {
                id: true,
                menu_id: true,
                menu_name: true,
                menu_subname: true,
                menu_category: true,
                menu_image: true,
                menu_ingredients: true,
                menu_lunchbox: true,
            },
        });

        if (menusWithoutCost.length === 0) throw new HttpError(404, "Menu not found");

        const menuIds = menusWithoutCost.map(m => m.menu_id);
        let costMap = new Map<number, any>();

        if (menuIds.length > 0) {
            try {
                const costResults = await prisma.menu.aggregateRaw({
                    pipeline: [
                        { $match: { menu_id: { $in: menuIds } } },
                        { $project: { menu_id: 1, menu_cost: { $ifNull: ["$menu_cost", 0] } } }
                    ]
                }) as unknown as Array<{ menu_id: number; menu_cost: any }>;

                if (Array.isArray(costResults)) {
                    costResults.forEach((item: any) => {
                        const menuId = item.menu_id;
                        const cost = item.menu_cost !== null && item.menu_cost !== undefined ? item.menu_cost : 0;
                        costMap.set(menuId, cost);
                    });
                }
            } catch (costError) {
                console.warn("Error fetching menu costs, using default value 0:", costError);
                menuIds.forEach(id => costMap.set(Number(id), 0));
            }
        }

        // Merge menu_cost back into results
        const result = menusWithoutCost.map(menu => ({
            ...menu,
            menu_cost: costMap.get(Number(menu.menu_id)) ?? 0,
        }));

        const convertedResult = convertBigIntToNumber(result);

        return convertedResult;
    } catch (error) {
        console.error("Error fetching menu list:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to fetch menu list");
    }
}

export async function AddMenuList({ body, cookie }: { body: { menu_name: string; menu_ingredients: string; menu_subname: string; menu_category: string; menu_cost: number; menu_lunchbox?: string }; cookie: CookieStore }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const menu_name = body.menu_name?.trim();
        const menu_ingredients = body.menu_ingredients?.trim();
        const menu_subname = body.menu_subname?.trim();
        const menu_category = body.menu_category?.trim();
        const menu_cost = body.menu_cost;
        const menu_lunchbox = body.menu_lunchbox?.trim();

        if (!menu_name || !menu_ingredients || !menu_subname || !menu_category || menu_cost === undefined) {
            throw new HttpError(400, "Missing or invalid required fields");
        }

        let parsedIngredients;
        let parsedLunchbox = [];

        try {
            parsedIngredients = JSON.parse(menu_ingredients);
        } catch (error) {
            throw new HttpError(400, "Invalid ingredient format");
        }

        try {
            if (menu_lunchbox) parsedLunchbox = JSON.parse(menu_lunchbox);
        } catch (error) {
            throw new HttpError(400, "Invalid lunchbox format");
        }

        const lastMenu = await prisma.menu.findFirst({
            orderBy: { menu_id: "desc" },
            select: {
                menu_id: true,
            },
        });

        const lastMenuIdRaw: unknown = lastMenu?.menu_id ?? null;
        let lastMenuId = 0;
        if (typeof lastMenuIdRaw === "number") lastMenuId = lastMenuIdRaw;
        else if (typeof lastMenuIdRaw === "bigint") lastMenuId = Number(lastMenuIdRaw);
        else if (typeof lastMenuIdRaw === "string") {
            const n = Number(lastMenuIdRaw);
            if (!Number.isNaN(n)) lastMenuId = n;
        }

        const newMenuId = lastMenuId + 1;

        const result = await prisma.menu.create({
            data: {
                menu_id: newMenuId,
                menu_name,
                menu_subname,
                menu_category,
                menu_cost: Number(menu_cost) || 0,
                menu_ingredients: parsedIngredients,
                menu_lunchbox: parsedLunchbox,
                menu_image: "",
            },
        });

        const convertedResult = convertBigIntToNumber(result);
        return convertedResult;
    } catch (error) {
        console.error("Error creating menu:", error);
        if (error instanceof HttpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to create menu");
    }
}

export async function ThatMenuItem({ params, cookie }: { params: { id: string }; cookie: CookieStore }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");
    const menuId = Number(params.id);
    if (Number.isNaN(menuId)) throw new HttpError(400, "Invalid menu id");
    try {
        const menuWithoutCost = await prisma.menu.findFirst({
            where: { menu_id: { equals: menuId } },
            select: {
                id: true,
                menu_id: true,
                menu_name: true,
                menu_subname: true,
                menu_category: true,
                menu_image: true,
                menu_ingredients: true,
                menu_lunchbox: true,
            },
        });

        if (!menuWithoutCost) throw new HttpError(404, "Menu not found");

        let menuCost: any = 0;
        try {
            const costResults = (await prisma.menu.aggregateRaw({
                pipeline: [
                    { $match: { menu_id: menuId } },
                    { $project: { menu_id: 1, menu_cost: { $ifNull: ["$menu_cost", 0] } } },
                ],
            })) as unknown as Array<{ menu_id: number; menu_cost: any }>;

            if (Array.isArray(costResults) && costResults.length > 0) {
                const item = costResults[0];
                menuCost = item?.menu_cost !== null && item?.menu_cost !== undefined ? item?.menu_cost : 0;
            }
        } catch (costError) {
            console.warn("Error fetching menu cost, using default value 0:", costError);
            menuCost = 0;
        }

        const result = {
            ...menuWithoutCost,
            menu_cost: menuCost,
        };

        const convertedResult = convertBigIntToNumber(result);

        try {
            JSON.stringify(convertedResult);
        } catch (jsonError) {
            console.error("JSON serialization error:", jsonError);
            throw new HttpError(
                500,
                `JSON serialization failed: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`
            );
        }

        return convertedResult;
    } catch (error) {
        console.error("Error fetching menu item:", error);
        if (error instanceof HttpError) throw error;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(
            500,
            process.env.NODE_ENV === "development" ? errorMessage : "Failed to fetch menu item"
        );
    }
}

export async function EditThatMenuItem({ params, body, cookie }: {
    params: { id: string };
    body: {
        menu_name: string;
        menu_ingredients: string;
        menu_subname: string;
        menu_category: string;
        menu_cost: number;
        menu_lunchbox?: string
    };
    cookie: CookieStore
}) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    const menuId = Number(params.id);
    if (Number.isNaN(menuId)) throw new HttpError(400, "Invalid menu id");

    try {
        const menu_name = body.menu_name?.trim();
        const menu_ingredients = body.menu_ingredients?.trim();
        const menu_subname = body.menu_subname?.trim();
        const menu_category = body.menu_category?.trim();
        const menu_cost = body.menu_cost;
        const menu_lunchbox = body.menu_lunchbox?.trim();

        if (!menu_name || !menu_ingredients || !menu_subname || !menu_category || menu_cost === undefined) {
            throw new HttpError(400, "Missing or invalid required fields");
        }

        let parsedIngredients;
        let parsedLunchbox = [];

        try {
            parsedIngredients = JSON.parse(menu_ingredients);
        } catch (error) {
            throw new HttpError(400, "Invalid ingredient format");
        }

        try {
            if (menu_lunchbox) parsedLunchbox = JSON.parse(menu_lunchbox);
        } catch (error) {
            throw new HttpError(400, "Invalid lunchbox format");
        }

        const existing = await prisma.menu.findFirst({
            where: { menu_id: { equals: menuId } },
            select: {
                id: true,
                menu_id: true,
            },
        });

        if (!existing) throw new HttpError(404, "Menu not found");

        const result = await prisma.menu.update({
            where: { id: existing.id },
            data: {
                menu_name,
                menu_subname,
                menu_category,
                menu_cost: Number(menu_cost) || 0,
                menu_ingredients: parsedIngredients,
                menu_lunchbox: parsedLunchbox,
            },
        });

        const convertedResult = convertBigIntToNumber(result);

        return {
            success: true,
            updatedMenu: convertedResult,
        };
    } catch (error) {
        console.error("Error updating menu:", error);
        if (error instanceof HttpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to update menu");
    }
}

export async function DeleteThatMenuItem({ params, cookie }: { params: { id: string }; cookie: CookieStore }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");
    const menuId = Number(params.id);
    if (Number.isNaN(menuId)) throw new HttpError(400, "Invalid menu id");
    try {
        const existing = await prisma.menu.findFirst({
            where: { menu_id: { equals: menuId } },
        });

        if (!existing) throw new HttpError(404, "Menu not found");

        await prisma.menu.delete({
            where: { id: existing.id },
        });

        return { success: true, message: "Menu deleted successfully" };
    } catch (error) {
        console.error("Error deleting menu:", error);
        throw new HttpError(500, "Failed to delete menu");
    }
}


export async function MenuPage({ request, cookie }: { request: Request; cookie: CookieStore }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const safePage = isNaN(page) || page < 1 ? 1 : page;
        const safeLimit = isNaN(limit) || limit < 1 ? 10 : limit;
        const offset = (safePage - 1) * safeLimit;
        const total = await prisma.menu.count();
        const menusWithoutCost = await prisma.menu.findMany({
            orderBy: { menu_id: "asc" },
            skip: offset,
            take: safeLimit,
            select: {
                id: true,
                menu_id: true,
                menu_name: true,
                menu_subname: true,
                menu_category: true,
                menu_image: true,
                menu_ingredients: true,
                menu_lunchbox: true,
            },
        });

        const menuIds = menusWithoutCost.map(m => m.menu_id);
        let costMap = new Map<number, any>();

        if (menuIds.length > 0) {
            try {
                const costResults = await prisma.menu.aggregateRaw({
                    pipeline: [
                        { $match: { menu_id: { $in: menuIds } } },
                        { $project: { menu_id: 1, menu_cost: { $ifNull: ["$menu_cost", 0] } } }
                    ]
                }) as unknown as Array<{ menu_id: number; menu_cost: any }>;

                if (Array.isArray(costResults)) {
                    costResults.forEach((item: any) => {
                        const menuId = item.menu_id;
                        const cost = item.menu_cost !== null && item.menu_cost !== undefined ? item.menu_cost : 0;
                        costMap.set(menuId, cost);
                    });
                }
            } catch (costError) {
                console.warn("Error fetching menu costs, using default value 0:", costError);
                menuIds.forEach(id => costMap.set(Number(id), 0));
            }
        }

        const result = menusWithoutCost.map(menu => ({
            ...menu,
            menu_cost: costMap.get(Number(menu.menu_id)) ?? 0,
        }));

        const convertedResult = convertBigIntToNumber(result);
        return {
            data: convertedResult,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
    } catch (error) {
        console.error("Error fetching menu list:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to fetch menu list");
    }
}

