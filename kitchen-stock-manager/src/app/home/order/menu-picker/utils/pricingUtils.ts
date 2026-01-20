import { MenuItem } from "@/models/menu_card/MenuCard";
import { getDishType, getMeatType } from "./menuParsing";
import { MEAT_SURCHARGE } from "../constants/pricing";

export const getNormalizedPrice = (
    menu: Partial<MenuItem> | undefined,
    availableMenus: MenuItem[],
    includeMeatSurcharge = false
) => {
    if (!menu) return 0;

    let basePrice = menu.lunchbox_cost ?? 0;

    // ถ้าเป็นหมวดจานหลัก ให้ใช้ราคาสม่ำเสมอของเนื้อสัตว์ที่เลือก
    if (menu.lunchbox_menu_category === "กับข้าวที่ 1" || menu.lunchbox_menu_category === "ข้าว+กับข้าว") {
        const dishType = getDishType(menu.menu_name || "");
        if (dishType) {
            const variants = availableMenus.filter(
                (m) =>
                    (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
                    getDishType(m.menu_name || "") === dishType
            );
            if (variants.length > 0) {
                // ใช้ราคาที่ถูกที่สุด (มักจะเป็น หมู/ไก่) เป็นราคากลางของจานนี้
                basePrice = Math.min(...variants.map((v) => v.lunchbox_cost || 0));
            }
        }

        // เพิ่มราคาเนื้อสัตว์ถ้ารายการนี้เป็นเนื้อสัตว์ที่แพง
        if (includeMeatSurcharge) {
            const meatType = getMeatType(menu.menu_name || "");
            const surcharge = MEAT_SURCHARGE[meatType || ""] || 0;
            basePrice += surcharge;
        }
    }

    return basePrice;
};
