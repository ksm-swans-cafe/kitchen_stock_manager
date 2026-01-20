import { MenuItem } from "@/models/menu_card/MenuCard";
import { DEFAULT_CATEGORY_ORDER, PREMIUM_SNACK_BOX_ORDER } from "../constants/menuOrder";

export const sortMenusByCategory = (menus: MenuItem[], selectedSetMenu: string) => {
    const categoryOrder = selectedSetMenu === "Premium Snack Box" ? PREMIUM_SNACK_BOX_ORDER : DEFAULT_CATEGORY_ORDER;

    return [...menus].sort((a, b) => {
        const catA = a.lunchbox_menu_category || "อื่นๆ";
        const catB = b.lunchbox_menu_category || "อื่นๆ";
        const indexA = categoryOrder.indexOf(catA);
        const indexB = categoryOrder.indexOf(catB);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return catA.localeCompare(catB, "th");
    });
};
