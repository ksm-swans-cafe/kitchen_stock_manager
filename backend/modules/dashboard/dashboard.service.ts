import prisma from "@plugins/prisma";
import { HttpError } from "elysia-logger";
import { CheckToken } from "@modules/auth/auth.service";
import convertBigIntToNumber from "@plugins/convert/BigInt-Number";

type CookieStore = {
    token: { value: string | undefined; set: (options?: any) => void; remove: () => void };
    userName: { value: string | undefined; set: (options?: any) => void; remove: () => void };
    userRole: { value: string | undefined; set: (options?: any) => void; remove: () => void };
};

interface PackagingNote {
    id: string;
    value: string;
}

interface CartDescription {
    description_id: string | null;
    description_title: string;
    description_value: string;
}

export async function DashboardList({ cookie }: { cookie: CookieStore }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear() + 543;
        const todayString = `${day}/${month}/${year}`;

        const convertToComparableDate = (dateStr: string): string => {
            const [d, m, y] = dateStr.split("/");
            return `${y}/${m}/${d}`;
        };

        const todayComparable = convertToComparableDate(todayString);

        const getDayOfWeekThai = (day: number): string => {
            const daysThai = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
            return daysThai[day] || "";
        };

        const getDayFromDateString = (dateStr: string): string => {
            const [d, m, y] = dateStr.split("/").map(Number);
            if (!y) return "";
            if (!m) return "";
            if (!d) return "";
            const gregorianYear = y - 543;
            const date = new Date(gregorianYear, m - 1, d);
            return getDayOfWeekThai(date.getDay());
        };

        const result = await (prisma.new_cart as any).aggregateRaw({
            pipeline: [
                {
                    $addFields: {
                        comparable_date: {
                            $concat: [
                                { $substr: ["$delivery_date", 6, 4] }, // year
                                "/",
                                { $substr: ["$delivery_date", 3, 2] }, // month
                                "/",
                                { $substr: ["$delivery_date", 0, 2] }, // day
                            ],
                        },
                    },
                },
                {
                    $match: {
                        comparable_date: {
                            $gte: todayComparable,
                        },
                    },
                },
                {
                    $sort: {
                        comparable_date: 1,
                        export_time: 1,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        location_send: 1,
                        delivery_date: 1,
                        export_time: 1,
                        receive_time: 1,
                        lunchbox: 1,
                        description: 1,
                        pinned: 1,
                        packaging_note: 1,
                    },
                },
            ],
        });

        if (result.length === 0) {
            return {
                status: "success",
                total: 0,
                result: []
            };
        }

        // Extract _id before conversion (since convertBigIntToNumber skips keys starting with _)
        const itemsWithId = result.map((item: any) => {
            let cartId: string = '';
            
            // Extract _id from MongoDB result
            if (item._id) {
                if (typeof item._id === 'string') {
                    cartId = item._id;
                } else if (typeof item._id === 'object' && item._id !== null) {
                    if (item._id.$oid) {
                        cartId = item._id.$oid;
                    } else if (typeof item._id.toString === 'function') {
                        cartId = item._id.toString();
                    } else {
                        cartId = String(item._id);
                    }
                } else {
                    cartId = String(item._id);
                }
            }

            // Validate cartId
            if (!cartId || cartId === 'undefined' || cartId === 'null' || cartId.trim() === '') {
                console.error("Invalid cartId found in item:", item);
                throw new HttpError(500, "Invalid cart ID in response");
            }

            return {
                ...item,
                extractedId: cartId, // Store extracted ID (not starting with _ to avoid being skipped)
            };
        });

        const convertedResult = convertBigIntToNumber(itemsWithId);

        const resultWithDayOfWeek = convertedResult.map((item: any) => {
            const cartId = item.extractedId || '';
            
            if (!cartId || cartId === 'undefined' || cartId === 'null' || cartId.trim() === '') {
                console.error("Invalid cartId after conversion in item:", item);
                throw new HttpError(500, "Invalid cart ID in response");
            }

            return {
                id: cartId,
                date: item.delivery_date,
                dayOfWeek: getDayFromDateString(item.delivery_date),
                location: item.location_send,
                sendTime: item.export_time,
                receiveTime: item.receive_time,
                items: item.lunchbox.map((lunchbox: any) => ({
                    lunchbox_name: lunchbox.lunchbox_name,
                    set: lunchbox.lunchbox_set_name,
                    quantity: lunchbox.lunchbox_total,
                    packaging: lunchbox.lunchbox_packaging || null,
                    lunchbox_menu: lunchbox.lunchbox_menu.map((menu: any) => ({
                        menu_name: menu.menu_name,
                        menu_quantity: menu.menu_total,
                        menu_ingredients: menu.menu_ingredients || [],
                        menu_description: menu.menu_description || [],
                    })),
                })),
                description: item.description || [],
                pinned: item.pinned || false,
                packaging_note: item.packaging_note || "",
            };
        });

        return {
            status: "success",
            total: resultWithDayOfWeek.length,
            result: resultWithDayOfWeek
        };
    } catch (error) {
        console.error("Error fetching carts:", error);
        throw new HttpError(500, "Internal Server Error");
    }
}

export async function PackagingNoteUpdate({ cookie, params, body }: { cookie: CookieStore, params: { id: string }, body: { packaging_notes?: PackagingNote[], packaging_note?: string } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { packaging_notes, packaging_note } = body;

        if (!params.id || params.id === "undefined" || params.id === "null") {
            throw new HttpError(400, "Cart ID is required");
        }

        const existingCart = await prisma.new_cart.findFirst({
            where: { id: params.id },
        });

        if (!existingCart) {
            throw new HttpError(404, "Cart not found");
        }

        let noteValue = "";
        if (packaging_notes !== undefined) {
            noteValue = JSON.stringify(packaging_notes);
        } else if (packaging_note !== undefined) {
            noteValue = packaging_note;
        }

        const result = await prisma.new_cart.update({
            where: { id: (existingCart as { id: string }).id },
            data: {
                packaging_note: noteValue,
                last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
            } as any,
        });

        const convertedResult = convertBigIntToNumber(result);

        return {
            message: "Packaging note updated successfully",
            cart: convertedResult,
        };
    } catch (error) {
        console.error("Error updating packaging note:", error);
        if (error instanceof HttpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to update packaging note");
    }
}

export async function PinnedUpdate({ cookie, params, body }: { cookie: CookieStore, params: { id: string }, body: { pinned: any } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { pinned } = body;

        if (!params.id || params.id === "undefined" || params.id === "null") {
            throw new HttpError(400, "Cart ID is required");
        }

        if (pinned === undefined || pinned === null) {
            throw new HttpError(400, "pinned is required");
        }

        // Convert to boolean if needed
        let pinnedValue: boolean;
        if (typeof pinned === "boolean") {
            pinnedValue = pinned;
        } else if (typeof pinned === "string") {
            pinnedValue = pinned.toLowerCase() === "true" || pinned === "1";
        } else if (typeof pinned === "number") {
            pinnedValue = pinned !== 0;
        } else {
            throw new HttpError(400, `pinned must be a boolean value, received: ${typeof pinned}`);
        }


        const existingCart = await prisma.new_cart.findFirst({
            where: { id: params.id },
        });

        if (!existingCart) throw new HttpError(404, "Cart not found");

        const updatedCart = await prisma.new_cart.update({
            where: { id: existingCart.id },
            data: {
                pinned: pinnedValue,
                last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
            },
        } as any);

        const convertedResult = convertBigIntToNumber(updatedCart);

        return {
            success: true,
            message: "Cart pinned status updated successfully",
            cart: convertedResult,
        };
    } catch (error) {
        console.error("Error updating cart pinned status:", error);
        if (error instanceof HttpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to update cart pinned status");
    }
}

export async function CartDescriptionUpdate({ cookie, params, body }: { cookie: CookieStore, params: { id: string }, body: { description: CartDescription[] } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { description } = body;

        if (!params.id || params.id === "undefined" || params.id === "null") throw new HttpError(400, "Cart ID is required");

        if (!Array.isArray(description)) throw new HttpError(400, "description must be an array");

        const existingCart = await prisma.new_cart.findFirst({
            where: { id: params.id },
        });

        if (!existingCart) throw new HttpError(404, "Cart not found");

        if (!Array.isArray(description)) throw new HttpError(400, "description must be an array");

        const formattedDescription = description.map((desc) => ({
            description_id: desc.description_id || null,
            description_title: desc.description_title || "",
            description_value: desc.description_value || "",
        }));

        const result = await prisma.new_cart.update({
            where: { id: (existingCart as { id: string }).id },
            data: {
                description: formattedDescription,
                last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
            },
        });

        const serializedResult = JSON.parse(
            JSON.stringify(result, (key, value) => (typeof value === "bigint" ? value.toString() : value))
        );

        return {
            message: "Cart description updated successfully",
            cart: serializedResult,
        };
    } catch (error) {
        console.error("Error updating cart description:", error);
        if (error instanceof HttpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to update cart description");
    }
}

export async function EditMenuDescription({ params, body, cookie }: {
    params: { id: string };
    body: { lunchbox_name: string, menu_name: string, menu_description: MenuDescription[] };
    cookie: CookieStore;
}) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { id } = params;
        const { lunchbox_name, menu_name, menu_description } = body;

        if (!id) throw new HttpError(400, "Cart ID is required");

        if (!lunchbox_name || !menu_name) throw new HttpError(400, "lunchbox_name and menu_name are required");

        const existingCart = await prisma.new_cart.findFirst({
            where: { id: id },
        });

        if (!existingCart) throw new HttpError(404, "Cart not found");

        if (!Array.isArray(menu_description)) throw new HttpError(400, "menu_description must be an array");

        const formattedDescription = menu_description.map((desc) => ({
            menu_description_id: desc.menu_description_id || null,
            menu_description_title: desc.menu_description_title || "",
            menu_description_value: desc.menu_description_value || "",
        }));

        const cartLunchbox = (existingCart as any).lunchbox || [];

        const updatedLunchbox = cartLunchbox.map((lunchbox: any) => {
            if (lunchbox.lunchbox_name === lunchbox_name) {
                const updatedMenu = (lunchbox.lunchbox_menu || []).map((menu: any) => {
                    if (menu.menu_name === menu_name) {
                        return {
                            ...menu,
                            menu_description: formattedDescription,
                        };
                    }
                    return menu;
                });
                return {
                    ...lunchbox,
                    lunchbox_menu: updatedMenu,
                };
            }
            return lunchbox;
        });

        const result = await prisma.new_cart.update({
            where: { id: (existingCart as { id: string }).id },
            data: {
                lunchbox: updatedLunchbox,
                last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
            },
        });

        const convertedResult = convertBigIntToNumber(result);

        return {
            success: true,
            message: "Menu description updated successfully",
            cart: convertedResult,
        };
    } catch (error) {
        console.error("Error updating menu description:", error);
        if (error instanceof HttpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to update menu description");
    }
}