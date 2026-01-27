import prisma from "@plugins/prisma";
import { HttpError } from "elysia-logger";
import { CheckToken } from "@modules/auth/auth.service";
import convertBigIntToNumber from "@plugins/convert/BigInt-Number";

type CookieStore = {
    token: { value: string | undefined; set: (options?: any) => void; remove: () => void };
    userName: { value: string | undefined; set: (options?: any) => void; remove: () => void };
    userRole: { value: string | undefined; set: (options?: any) => void; remove: () => void };
};

interface Ingredient {
    ingredient_name: string;
    useItem: number;
    ingredient_status: boolean;
    description: string;
}

export async function CartList({ cookie, request }: { cookie: CookieStore, request: Request }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page");

        if (!page) {
            throw new HttpError(400, "Page parameter is required");
        }

        let status: string[] = [];

        if (page === "summarylist") status = ["pending", "completed"];
        else if (page === "orderhistory") status = ["success", "cancelled"];
        else throw new HttpError(400, "Invalid page type. Must be 'summarylist' or 'orderhistory'");

        const cartsBasic = await prisma.new_cart.findMany({
            orderBy: { create_date: "desc" },
            where: {
                status: { in: status },
            },
        });

        if (cartsBasic.length === 0) return [];

        const cartIds = cartsBasic.map((c) => c.id);
        let costMap = new Map<string, string>();
        let lunchboxMap = new Map<string, any[]>();
        let invoiceTexMap = new Map<string, string>();

        if (cartIds.length > 0) {
            try {
                const objectIds = cartIds.map((id) => ({ $oid: id }));
                const rawResults = await (prisma.new_cart as any).aggregateRaw({
                    pipeline: [
                        { $match: { _id: { $in: objectIds }, status: { $in: status } } },
                        {
                            $project: {
                                _id: 1,
                                lunchbox: 1,
                                total_cost_lunchbox: { $ifNull: ["$total_cost_lunchbox", ""] },
                                invoice_tex: { $ifNull: ["$invoice_tex", ""] },
                            },
                        },
                    ],
                }) as unknown as Array<{ _id: any; lunchbox: any; total_cost_lunchbox: string; invoice_tex: string }>;

                if (Array.isArray(rawResults)) {
                    rawResults.forEach((item: any) => {
                        const cartId: string =
                            typeof item?._id === "string"
                                ? item._id
                                : typeof item?._id?.$oid === "string"
                                    ? item._id.$oid
                                    : "";

                        if (!cartId) return;
                        const cost = item.total_cost_lunchbox !== null && item.total_cost_lunchbox !== undefined ? item.total_cost_lunchbox : "";
                        costMap.set(cartId, cost);

                        const invoiceTex = item.invoice_tex !== null && item.invoice_tex !== undefined ? item.invoice_tex : "";
                        invoiceTexMap.set(cartId, invoiceTex);

                        let lunchbox: any[] = [];
                        if (item.lunchbox !== null && item.lunchbox !== undefined) {
                            if (typeof item.lunchbox === "string") {
                                if (item.lunchbox === "[]" || item.lunchbox.trim() === "[]") {
                                    lunchbox = [];
                                } else {
                                    try {
                                        lunchbox = JSON.parse(item.lunchbox);
                                        if (!Array.isArray(lunchbox)) lunchbox = [];
                                    } catch (e) {
                                        console.warn(`Failed to parse lunchbox for cart ${cartId}:`, e);
                                        lunchbox = [];
                                    }
                                }
                            } else if (Array.isArray(item.lunchbox)) lunchbox = item.lunchbox;
                        }
                        lunchboxMap.set(cartId, lunchbox);
                    });
                }
            } catch (rawError) {
                console.warn("Error fetching invoice_tex, lunchbox and total_cost_lunchbox, using defaults:", rawError);
                cartIds.forEach((id) => {
                    costMap.set(id, "");
                    lunchboxMap.set(id, []);
                    invoiceTexMap.set(id, "");
                });
            }
        }

        const result = cartsBasic.map((cart) => ({
            ...cart,
            invoice_tex: invoiceTexMap.get(cart.id) || "",
            lunchbox: lunchboxMap.get(cart.id) || [],
            total_cost_lunchbox: costMap.get(cart.id) || "",
        }));

        const serializedResult = convertBigIntToNumber(result);

        return serializedResult;
    } catch (error) {
        console.error("Error fetching carts:", error);
        throw new HttpError(500, "Failed to fetch carts");
    }
}

export async function CartUpdateList({ cookie, params, body }: { cookie: CookieStore, params: { id: string }, body: { username: string, lunchboxes: any[], menu_items: any[], customer_name: string, customer_tel: string, delivery_date: string, location_send: string, export_time: string, receive_time: string, shipping_cost: any } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { id } = params;
        const { username, lunchboxes, menu_items, customer_name, customer_tel, delivery_date, location_send, export_time, receive_time, shipping_cost } = body;

        if (!id || id === "undefined" || id === "null") {
            throw new HttpError(400, "Cart ID is required");
        }

        const existingCart = await prisma.new_cart.findFirst({
            where: { id: id },
        });

        if (!existingCart) throw new HttpError(404, "Cart not found");

        type UpdateData = {
            last_update: string;
            username?: string;
            lunchbox?: any;
            menu_items?: any;
            customer_name?: string;
            customer_tel?: string;
            delivery_date?: string;
            location_send?: string;
            export_time?: string;
            receive_time?: string;
            shipping_cost?: any;
        };

        const updateData: UpdateData = {
            last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
        };

        if (username !== undefined) updateData.username = username;
        if (lunchboxes !== undefined) {
            const formattedLunchboxes = lunchboxes.map((lunchbox: any) => ({
                lunchbox_name: lunchbox.lunchbox_name,
                lunchbox_set_name: lunchbox.lunchbox_set,
                lunchbox_limit: lunchbox.lunchbox_limit || 0,
                lunchbox_total: lunchbox.lunchbox_quantity || 1,
                lunchbox_total_cost: lunchbox.lunchbox_total_cost || 0,
                lunchbox_menu: (lunchbox.lunchbox_menus || []).map((menu: any) => ({
                    menu_name: menu.menu_name,
                    menu_subname: menu.menu_subname,
                    menu_category: menu.menu_category,
                    menu_total: menu.menu_total,
                    menu_order_id: menu.menu_order_id || 0,
                    menu_description: Array.isArray(menu.menu_description) ? menu.menu_description : [],
                    menu_cost: menu.menu_cost || 0,
                    menu_ingredients: (menu.menu_ingredients || []).map((ing: any) => ({
                        ingredient_name: ing.ingredient_name,
                        useItem: ing.useItem,
                    })),
                })),
            }));
            updateData.lunchbox = formattedLunchboxes;
        }
        if (menu_items !== undefined) {
            const cleanedMenuItems = menu_items.map((item: any) => ({
                menu_name: item.menu_name,
                menu_subname: item.menu_subname,
                menu_category: item.menu_category,
                menu_total: item.menu_total,
                menu_description: item.menu_description,
                menu_order_id: item.menu_order_id,
                menu_notes: item.menu_notes || [],
                menu_ingredients: item.menu_ingredients?.map((ing: any) => ({
                    useItem: ing.useItem,
                    ingredient_name: ing.ingredient_name,
                    ingredient_status: ing.ingredient_status,
                })) || [],
            }));
            updateData.menu_items = cleanedMenuItems;
        }
        if (customer_name !== undefined) updateData.customer_name = customer_name;
        if (customer_tel !== undefined) updateData.customer_tel = customer_tel;
        if (delivery_date !== undefined) updateData.delivery_date = delivery_date;
        if (location_send !== undefined) updateData.location_send = location_send;
        if (export_time !== undefined) updateData.export_time = export_time;
        if (receive_time !== undefined) updateData.receive_time = receive_time;
        if (shipping_cost !== undefined) updateData.shipping_cost = shipping_cost;

        const result = await prisma.new_cart.updateMany({
            where: { id: id },
            data: updateData,
        });

        if (result.count === 0) throw new HttpError(404, "Cart not found or cannot be updated");

        const updatedCart = await prisma.new_cart.findFirst({
            where: { id: id },
        });

        if (!updatedCart) throw new HttpError(404, "Cart not found after update");

        const serializedResult = JSON.parse(JSON.stringify(updatedCart, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return { message: "Cart updated successfully", cart: serializedResult };
    } catch (error: string | unknown) {
        console.error("Error updating cart:", error instanceof Error ? error.message : "Unknown error");
        throw new HttpError(500, "Failed to update cart");
    }

}

export async function CartCreate({ cookie, body }: { cookie: CookieStore, body: { order_name: string, channel_access: string, username: string, lunchboxes: any[], customer_name: string, customer_tel: string, delivery_date: string, location_send: string, export_time: string, receive_time: string, receive_name: string, total_cost_lunchbox: string, invoice_tex: string, shipping_cost: string, shipping_by: string, pay_type: string, pay_deposit: string, pay_isdeposit: string, pay_cost: string, pay_charge: string, total_remain: string, total_cost: string, message: string, ispay: string, description: string } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const {
            order_name,
            channel_access,
            username,
            lunchboxes,
            customer_name,
            customer_tel,
            delivery_date,
            location_send,
            export_time,
            receive_time,
            receive_name,
            total_cost_lunchbox,
            invoice_tex,
            shipping_cost,
            shipping_by,
            pay_type,
            pay_deposit,
            pay_isdeposit,
            pay_cost,
            pay_charge,
            total_remain,
            total_cost,
            message,
            ispay,
            description,
        } = body;

        if (!channel_access || !username || !lunchboxes) throw new HttpError(400, "Channel access, username and lunchboxes are required");

        const cartCreateDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
        const cartCreateDateString = cartCreateDate.toISOString();

        const todayStart = new Date(cartCreateDate);
        todayStart.setHours(0, 0, 0, 0);
        const todayStartString = todayStart.toISOString();

        const todayEnd = new Date(cartCreateDate);
        todayEnd.setHours(23, 59, 59, 999);
        const todayEndString = todayEnd.toISOString();

        const orderCount = await prisma.new_cart.count({
            where: {
                create_date: {
                    gte: todayStartString,
                    lte: todayEndString,
                },
            },
        });

        const orderNumber = String(orderCount + 1).padStart(3, "0");
        const cartId = `CART-${orderNumber}-${Date.now()}`;

        const rawLunchboxes = lunchboxes.map((lunchbox: any) => ({
            lunchbox_name: lunchbox.lunchbox_name || "",
            lunchbox_set_name: lunchbox.lunchbox_set || "",
            lunchbox_limit: parseInt(lunchbox.lunchbox_limit?.toString() || "0"),
            lunchbox_total: parseInt(lunchbox.lunchbox_quantity || "1"),
            lunchbox_total_cost: parseInt((lunchbox.lunchbox_total_cost || "0").toString().replace(/[^\d]/g, "")),
            lunchbox_menu: (lunchbox.lunchbox_menus || []).map((menu: any) => ({
                menu_name: menu.menu_name || "",
                menu_subname: menu.menu_subname || "",
                menu_category: menu.menu_category || "",
                menu_total: parseInt(menu.menu_total || "1"),
                menu_ingredients: (menu.menu_ingredients || []).map((ingredient: any) => ({
                    ingredient_name: ingredient.ingredient_name || "",
                    useItem: parseInt(ingredient.useItem || "0"),
                })),
                menu_description: menu.menu_description || [],
                menu_cost: parseInt(menu.menu_cost || "0"),
                menu_order_id: parseInt(menu.menu_order_id || "0"),
            })),
        }));

        const formattedLunchboxes = convertBigIntToNumber(rawLunchboxes);

        const status = ispay === "-" ? "completed" : ispay === "paid" ? "completed" : ispay === "unpaid" ? "pending" : "pending";
        const cartData = {
            cart_id: cartId,
            order_name: order_name || "",
            channel_access: channel_access || "",
            username: username,
            lunchbox: formattedLunchboxes,
            create_date: cartCreateDateString,
            last_update: cartCreateDateString,
            order_number: orderNumber,
            customer_name: customer_name || "",
            customer_tel: customer_tel || "",
            delivery_date: delivery_date || "",
            location_send: location_send || "",
            export_time: export_time || "",
            receive_time: receive_time || "",
            shipping_cost: shipping_cost || "",
            shipping_by: shipping_by || "",
            status: status,
            receive_name: receive_name || "",
            total_cost_lunchbox: total_cost_lunchbox || "",
            invoice_tex: invoice_tex || "",
            pay_type: pay_type || "",
            pay_deposit: pay_deposit || "",
            pay_isdeposit: pay_isdeposit || false,
            pay_cost: pay_cost || "",
            pay_charge: pay_charge || "",
            total_remain: total_remain || "",
            total_cost: total_cost || "",
            ispay: ispay || "",
            description: description || [],
        };

        const cartLogData = {
            message: message || `สร้างออเดอร์ ${cartId} โดย ${username}`,
            create_date: cartCreateDateString,
            create_by: username,
            status: "created",
        };
        const finalCartData = convertBigIntToNumber(cartData);

        const result = await prisma.new_cart.create({
            data: finalCartData,
        });
        const cartLogResult = await prisma.cart_log.create({
            data: cartLogData,
        });

        const finalResult = convertBigIntToNumber(result);

        return { message: "Cart created successfully", cart: finalResult, log: cartLogResult };
    } catch (error: string | unknown) {
        console.error("Error creating cart:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            if (error.message.includes("Unknown argument")) {
                throw new HttpError(400, `Invalid data format: ${error.message}`);
            }
            throw new HttpError(500, `Failed to create cart: ${error.message}`);
        }
        throw new HttpError(500, "Failed to create cart");
    }
}

export async function CartStatusUpdate({ cookie, params, body }: { cookie: CookieStore, params: { id: string }, body: { status: string, last_update?: string } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { status, last_update } = body;

        if (!params.id || params.id === "undefined" || params.id === "null") {
            throw new HttpError(400, "Cart ID is required");
        }

        if (!status || !status.trim()) {
            throw new HttpError(400, "Status is required");
        }

        const cart = await prisma.new_cart.findFirst({
            where: { id: params.id },
            select: { id: true },
        });

        if (!cart) {
            throw new HttpError(404, "Cart item not found");
        }

        const updated = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString();

        const result = await prisma.new_cart.update({
            where: { id: cart.id },
            data: {
                status: status.trim(),
                last_update: last_update?.trim() || updated,
            },
        });

        const convertedResult = convertBigIntToNumber(result);

        return {
            success: true,
            message: "Cart status updated successfully",
            cart: convertedResult,
        };
    } catch (error) {
        console.error("Error updating cart item:", error);
        if (error instanceof HttpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to update cart status");
    }
}

export async function CartTimeUpdate({ cookie, params, body }: { cookie: CookieStore, params: { id: string }, body: { delivery_date: string, export_time: string, receive_time: string } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { id } = params;
        const { export_time, receive_time } = body;

        if (!id || id === "undefined" || id === "null") {
            throw new HttpError(400, "Cart ID is required");
        }

        const parseTime = (time: string | null | undefined): string | null => {
            if (!time || typeof time !== "string") return null;

            const thaiTimeRegex = /^([0-1]?[0-9]|2[0-3])\.[0-5][0-9]\s*น\.?$/;
            const standardTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

            if (thaiTimeRegex.test(time)) return time.replace(/\s*น\.?$/, "").replace(".", ":");
            else if (standardTimeRegex.test(time)) return time;
            else return null;
        };

        const parsedExportTime = parseTime(export_time);
        const parsedReceiveTime = parseTime(receive_time);

        if ((export_time && parsedExportTime === null) || (receive_time && parsedReceiveTime === null)) {
            throw new HttpError(400, "Invalid time format. Must be HH:mm or HH.mm. (e.g. 14.00)");
        }

        try {
            const result = await prisma.new_cart.updateMany({
                where: { id: id },
                data: {
                    export_time: parsedExportTime || "",
                    receive_time: parsedReceiveTime || "",
                },
            });

            if (result.count === 0) throw new HttpError(404, "Cart not found");

            const convertedResult = convertBigIntToNumber(result);

            return {
                success: true,
                cart: convertedResult,
            };
        } catch (error) {
            console.error("Error updating cart times:", error);
            throw new HttpError(500, "Failed to update cart times");
        }
    } catch (error) {
        console.error("Error updating cart times:", error);
        throw new HttpError(500, "Failed to update cart times");
    }
}

export async function CartMenuUpdate({ cookie, params, body }: { cookie: CookieStore, params: { id: string }, body: { menu_name: string, menu_total: number } }) {
    interface MenuItem {
        menu_name: string;
        menu_total: number;
        ingredients: {
            useItem: number;
            ingredient_id: number;
            ingredient_name: string;
            ingredient_status: boolean;
        }[];
        menu_description: string;
        menu_order_id: number;
    }

    try {
        const { id } = params;
        const { menu_name, menu_total } = body;

        if (!id || !menu_name || menu_total == null) {
            throw new HttpError(400, "Cart ID, menu_name and menu_total are required");
        }

        const total = Number(menu_total);
        if (!Number.isInteger(total) || total < 0) {
            throw new HttpError(400, "menu_total must be a positive integer");
        }

        try {
            const [cart] = await prisma.new_cart.findMany({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                    lunchbox: true,
                },
            });

            if (!cart) {
                console.error("Cart not found for id:", id);
                throw new HttpError(404, "Cart not found");
            }

            let menuItems: MenuItem[] = [];
            if (cart.lunchbox) {
                if (Array.isArray(cart.lunchbox)) {
                    menuItems = (cart.lunchbox as unknown as MenuItem[]).filter((item): item is MenuItem => item !== null);
                } else {
                    throw new HttpError(400, "Invalid lunchbox format");
                }
            }

            if (menuItems.length === 0) {
                console.warn("Empty menuItems for cart:", id);
                throw new HttpError(400, "No menu found in cart");
            }

            const cleanedMenuName = menu_name.trim();
            const menuExists = menuItems.find((item: MenuItem) => item.menu_name?.trim() === cleanedMenuName);

            if (!menuExists) {
                console.warn("Menu not found:", cleanedMenuName);
                throw new HttpError(404, `Menu "${cleanedMenuName}" not found in cart`);
            }

            const updatedMenuItems = menuItems.map((item: MenuItem) => (item.menu_name?.trim() === cleanedMenuName ? { ...item, menu_total: total } : item));

            const result = await prisma.new_cart.update({
                where: { id: id },
                data: {
                    lunchbox: updatedMenuItems as any,
                },
            });

            if (!result) {
                console.error("Failed to update cart for id:", id);
                throw new HttpError(500, "Failed to update cart menu");
            }

            return {
                success: true,
                cart: result,
                updatedMenu: updatedMenuItems.find((m) => m.menu_name === cleanedMenuName),
            };
        } catch (error: unknown) {
            console.error("Server error:", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
                cartId: id,
            });
            throw new HttpError(500, "Failed to update cart menu");
        }
    } catch (error) {
        console.error("Error updating cart menu:", error);
        throw new HttpError(500, "Failed to update cart menu");
    }
}

export async function CartMenuIngredientsStatusUpdate({ cookie, params, body }: { cookie: CookieStore, params: { id: string }, body: { menuName: string, ingredientName: string, isChecked: boolean } }) {
    try {
        const authResult = await CheckToken({ cookie: cookie as any });
        if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");
        
        const { id } = params;
        const { menuName, ingredientName, isChecked } = body;

        if (!id || !menuName || !ingredientName || isChecked == null) {
            console.warn("Missing fields:", {
                id,
                menuName,
                ingredientName,
                isChecked,
            });
            throw new HttpError(400, "Cart ID, menuName, ingredientName and isChecked are required");
        }

        try {
            const cart = await prisma.new_cart.findFirst({
                where: { id: id },
                select: {
                    id: true,
                    lunchbox: true,
                },
            });

            if (!cart) {
                console.error("Cart not found for id:", id);
                throw new HttpError(404, "Cart not found");
            }

            // Parse lunchbox
            let lunchboxes: any[] = [];
            if (typeof cart.lunchbox === "string") {
                try {
                    lunchboxes = JSON.parse(cart.lunchbox);
                } catch (e) {
                    console.error("JSON parse error:", (e as Error).message);
                    throw new HttpError(400, "Invalid lunchbox format");
                }
            } else if (Array.isArray(cart.lunchbox)) {
                lunchboxes = cart.lunchbox;
            } else {
                console.error("Invalid lunchbox format:", cart.lunchbox);
                throw new HttpError(400, "Invalid lunchbox format");
            }

            // Find menu in lunchbox_menu
            let menuFound = false;
            let ingredientFound = false;

            const updatedLunchboxes = lunchboxes.map((lunchbox: any) => ({
                ...lunchbox,
                lunchbox_menu: lunchbox.lunchbox_menu.map((menu: any) => {
                    if (menu.menu_name === menuName) {
                        menuFound = true;
                        return {
                            ...menu,
                            menu_ingredients: menu.menu_ingredients.map((ing: any) => {
                                if (ing.ingredient_name === ingredientName) {
                                    ingredientFound = true;
                                    return { ...ing, ingredient_status: isChecked };
                                }
                                return ing;
                            }),
                        };
                    }
                    return menu;
                }),
            }));

            if (!menuFound) {
                console.warn("Menu not found:", menuName);
                throw new HttpError(404, `Menu "${menuName}" not found in cart`);
            }

            if (!ingredientFound) {
                console.warn("Ingredient not found:", ingredientName, "in menu:", menuName);
                throw new HttpError(404, `Ingredient "${ingredientName}" not found in menu "${menuName}"`);
            }

            const result = await prisma.new_cart.update({
                where: { id: id },
                data: {
                    lunchbox: updatedLunchboxes as any,
                },
            });

            if (!result) {
                console.error("Failed to update cart for id:", id);
                throw new HttpError(500, "Failed to update cart menu ingredient status");
            }

            return {
                success: true,
                cart: result,
            };
        } catch (error: unknown) {
            console.error("Server error:", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
                cartId: id,
            });
            throw new HttpError(500, "Failed to update cart menu ingredient status");
        }
    } catch (error) {
        console.error("Error updating cart menu ingredient status:", error);
        throw new HttpError(500, "Failed to update cart menu ingredient status");
    }
}

export async function CartMenuAllIngredientsStatusUpdate({ cookie, params, body }: { cookie: CookieStore, params: { id: string }, body: { isChecked: boolean } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    const { id } = params;
    const { isChecked } = body;

    if (!id || isChecked == null) {
        console.warn("Missing fields:", { id, isChecked });
        throw new HttpError(400, "Cart ID and isChecked are required");
    }

    try {
        const cart = await prisma.new_cart.findFirst({
            where: { id: id },
            select: {
                id: true,
                lunchbox: true,
                total_cost_lunchbox: true,
            },
        });

        if (!cart) {
            console.error("Cart not found for id:", id);
            throw new HttpError(404, "Cart not found");
        }

        let lunchboxes: any[] = [];
        if (typeof cart.lunchbox === "string") {
            try {
                lunchboxes = JSON.parse(cart.lunchbox);
            } catch (e) {
                console.error("JSON parse error:", (e as Error).message);
                throw new HttpError(400, "Invalid lunchbox format");
            }
        } else if (Array.isArray(cart.lunchbox)) {
            lunchboxes = cart.lunchbox;
        } else {
            console.error("Invalid lunchbox format:", cart.lunchbox);
            throw new HttpError(400, "Invalid lunchbox format");
        }

        const updatedLunchboxes = lunchboxes.map((lunchbox: any) => ({
            ...lunchbox,
            lunchbox_menu: lunchbox.lunchbox_menu.map((menu: any) => ({
                ...menu,
                menu_ingredients: menu.menu_ingredients.map((ing: any) => ({
                    ...ing,
                    ingredient_status: isChecked,
                })),
            })),
        }));

        const result = await prisma.new_cart.update({
            where: { id: cart.id },
            data: {
                lunchbox: updatedLunchboxes as any,
                total_cost_lunchbox: cart.total_cost_lunchbox || "0", // Ensure non-null value
            },
        });

        return {
            success: true,
            updated: 1,
            result: result,
        };
    } catch (error) {
        console.error("Server error:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        throw new HttpError(500, "Failed to update cart all ingredients status");
    }
}
