import prisma from "@plugins/prisma";
import { HttpError } from "elysia-logger";
import { CheckToken } from "@modules/auth/auth.service";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

type CookieStore = {
    token: { value: string | undefined; set: (options?: any) => void; remove: () => void };
    userName: { value: string | undefined; set: (options?: any) => void; remove: () => void };
    userRole: { value: string | undefined; set: (options?: any) => void; remove: () => void };
};

export async function IngredientList({ cookie }: { cookie: CookieStore }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const result = await prisma.ingredients.findMany({
            orderBy: { ingredient_id: "asc" },
        });
        if (result.length === 0) throw new HttpError(404, "No ingredients found");
        return result;
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        throw new HttpError(500, "Internal Server Error");
    }
}

export async function IngredientCreate({ cookie, body }: { cookie: CookieStore, body: { ingredient_name: string, ingredient_unit: string, ingredient_category: string, ingredient_sub_category: string, ingredient_total: number, ingredient_total_alert: number, ingredient_price: number, ingredient_image: string } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { ingredient_name, ingredient_unit, ingredient_category, ingredient_sub_category, ingredient_total, ingredient_total_alert, ingredient_price, ingredient_image } = body;

            if (!ingredient_name || !ingredient_unit || !ingredient_category || !ingredient_sub_category || !ingredient_total || !ingredient_total_alert || !ingredient_price || !ingredient_image) {
                throw new HttpError(400, "Missing or invalid required fields");
            }

            let ingredient_image_url = "";
            if (ingredient_image) {
                const blob = await put(`Ingredients-image/${randomUUID()}-${new Date().toISOString()}`, ingredient_image, {
                    access: "public",
                });
                ingredient_image_url = blob.url;
            }

            const ingredientPricePerUnit = (ingredient_price / ingredient_total).toFixed(2);

            const maxIdResult = await prisma.ingredients.findFirst({
                orderBy: { ingredient_id: "desc" },
                select: { ingredient_id: true }
            });
            const newIngredientId = (maxIdResult?.ingredient_id || 0) + 1;

            const result = await prisma.ingredients.create({
                data: {
                    ingredient_id: newIngredientId,
                    ingredient_name: ingredient_name,
                    ingredient_total: ingredient_total.toString(),
                    ingredient_unit: ingredient_unit,
                    ingredient_category: ingredient_category,
                    ingredient_sub_category: ingredient_sub_category,
                    ingredient_image: ingredient_image,
                    ingredient_total_alert: ingredient_total_alert.toString(),
                    ingredient_price: ingredient_price.toString(),
                    ingredient_price_per_unit: ingredientPricePerUnit,
                    ingredient_lastupdate: new Date().toISOString(),
                }
            });

            return {
                message: "Ingredient created successfully",
                ingredient: result,
            };
        } catch (error) {
            console.error("Error creating ingredient:", error);
            throw new HttpError(500, "Internal Server Error");
        }
}
export async function IngredientUnits({ cookie, request }: { cookie: CookieStore, request: Request }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    const { searchParams } = new URL(request.url);
    const names = searchParams.get("names");

    if (!names) throw new HttpError(400, "Ingredient names are required");

    try {
        const nameArray = names.split(",").map((name) => decodeURIComponent(name).trim().toLowerCase());

        if (nameArray.length === 0) return [];

        const result = await prisma.ingredients.findMany({
            where: {
                ingredient_name: {
                    in: nameArray,
                },
            },
            select: {
                ingredient_name: true,
                ingredient_unit: true,
            },
        });

        const units = nameArray.map((name) => {
            const found = result.find((r) => r.ingredient_name.trim().toLowerCase() === name);
            return {
                ingredient_name: name,
                ingredient_unit: found ? found.ingredient_unit : "หน่วย",
            };
        });

        return units;
    } catch (error) {
        console.error("Error fetching ingredient units:", error);
        throw new HttpError(500, "Internal Server Error");
    }
}

export async function IngredientDetail({ cookie, params }: { cookie: CookieStore, params: { id: string } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

        const id = params.id;
        try {
            const result = await prisma.ingredients.findMany({
                where: { ingredient_id: Number(id) },
            });

            if (result.length === 0) throw new HttpError(404, "Ingredient not found");

            return result[0];
        } catch (error) {
            console.error("Database error:", error);
            throw new HttpError(500, "Internal Server Error");
        }
}

export async function IngredientUpdate({ cookie, params, body }: { cookie: CookieStore, params: { id: string }, body: { ingredient_name: string, ingredient_unit: string, ingredient_category: string, ingredient_sub_category: string, ingredient_total: number, ingredient_total_alert: number, ingredient_price: number, ingredient_image: string } }) {
    const authResult = await CheckToken({ cookie: cookie as any });
    if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

    try {
        const { ingredient_name, ingredient_unit, ingredient_category, ingredient_sub_category, ingredient_total, ingredient_total_alert, ingredient_price, ingredient_image } = body;

        if (ingredient_name && !ingredient_name.trim()) 
            throw new HttpError(400, "Ingredient name cannot be empty");

        if (ingredient_total !== null && (!Number.isFinite(Number(ingredient_total)) || Number(ingredient_total) <= 0)) 
            throw new HttpError(400, "Ingredient total must be a positive number");

        if (ingredient_unit && !ingredient_unit.trim())
            throw new HttpError(400, "Ingredient unit cannot be empty");

        if (ingredient_total_alert !== null && (!Number.isFinite(Number(ingredient_total_alert)) || Number(ingredient_total_alert) <= 0)) 
            throw new HttpError(400, "Ingredient total alert must be a positive number");

        const existingIngredient = await prisma.ingredients.findFirst({
            where: { ingredient_id: Number(params.id) },
            select: { id: true, ingredient_id: true, ingredient_image: true },
        });

        if (!existingIngredient) throw new HttpError(404, "Ingredient not found");

        if (ingredient_name) {
            const duplicateName = await prisma.ingredients.findFirst({
                where: {
                    ingredient_name: ingredient_name,
                    ingredient_id: { not: Number(params.id) },
                },
            });

            if (duplicateName) throw new HttpError(409, "Ingredient name already exists");
        }

        let ingredient_image_url: string | undefined = undefined;
        if (ingredient_image) {
            // ดึง URL รูปภาพเก่าถ้ามี
            const oldImageUrl = existingIngredient.ingredient_image;

            // อัปโหลดรูปภาพใหม่
            const uniqueName = `Ingredients-image/${randomUUID()}-${new Date().toISOString()}`;
            const blob = await put(uniqueName, ingredient_image, {
                access: "public",
            });
            ingredient_image_url = blob.url;

            // ลบรูปภาพเก่าถ้ามี
            if (oldImageUrl) {
                try {
                    await del(oldImageUrl);
                    console.log("Deleted old image:", oldImageUrl);
                } catch (deleteError) {
                    console.error("Failed to delete old image:", deleteError);
                }
            }
        }

        let ingredientPriceperUnit: string | undefined = undefined;
        const priceNum = ingredient_price !== null ? Number(ingredient_price) : null;
        const totalNum = ingredient_total !== null ? Number(ingredient_total) : null;
        if (priceNum !== null && totalNum !== null && Number.isFinite(priceNum) && Number.isFinite(totalNum) && totalNum !== 0) {
            ingredientPriceperUnit = (priceNum / totalNum).toFixed(2);
        }

        const updateData: any = {
            ingredient_name: ingredient_name,
            ingredient_total: ingredient_total.toString(),
            ingredient_unit: ingredient_unit,
            ingredient_category: ingredient_category,
            ingredient_sub_category: ingredient_sub_category,
            ingredient_total_alert: ingredient_total_alert.toString(),
            ingredient_price: ingredient_price.toString(),
            ingredient_image: ingredient_image_url,
            ingredient_lastupdate: new Date().toISOString(),
        };

        if (ingredientPriceperUnit !== undefined) {
            updateData.ingredient_price_per_unit = ingredientPriceperUnit;
        }

        const result = await prisma.ingredients.update({
            where: { id: existingIngredient.id },
            data: updateData,
        });

        return {
            message: "Ingredient updated successfully",
            ingredient: result,
        };
    } catch (error) {
        console.error("Error updating ingredient:", error);
        if (error instanceof HttpError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error details:", { errorMessage, errorStack });
        throw new HttpError(500, process.env.NODE_ENV === "development" ? errorMessage : "Failed to update ingredient");
    }
}

export async function IngredientTransaction({ cookie, params, body }: { cookie: CookieStore, params: { type: string, ingredient_name: string }, body: { transaction_from_username: string, transaction_total_price: number, transaction_quantity: number, transaction_units: string } }) {
        const authResult = await CheckToken({ cookie: cookie as any });
        if (!authResult.authenticated) throw new HttpError(401, "Unauthorized - Authentication required");

        const { ingredient_name: ingredientName, type: type } = await params;

        try {
            const { transaction_from_username, transaction_total_price, transaction_quantity, transaction_units } = body;

            const result = await prisma.ingredient_transaction.create({
                data: {
                    transaction_date: new Date().toISOString(),
                    transaction_id: Number(randomUUID()),
                    transaction_from_username: transaction_from_username,
                    transaction_type: type,
                    ingredient_name: ingredientName,
                    transaction_total_price: transaction_total_price.toString(),
                    transaction_quantity: transaction_quantity.toString(),
                    transaction_units: transaction_units,
                },
            });

            return {
                message: "Stock added successfully",
                transaction: result,
            };
        } catch (error) {
            console.error("Error adding stock:", error);
            throw new HttpError(500, "Failed to add stock.");
        }

}