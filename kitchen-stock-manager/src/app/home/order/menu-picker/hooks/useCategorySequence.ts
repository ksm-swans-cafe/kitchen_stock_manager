import { useMemo } from "react";
import { DEFAULT_CATEGORY_ORDER, PREMIUM_SNACK_BOX_ORDER } from "../constants/categoryOrder";
import { MenuItem } from "@/models/menu_card/MenuCard";

interface UseCategorySequenceProps {
    availableMenus: MenuItem[];
    selectedSetMenu: string;
    selectedMenuItems: string[];
    focusedDish: string | null;
    selectedMeatType: string | null;
    buildMenuKey: (menu: MenuItem) => string;
}

export const useCategorySequence = ({
    availableMenus,
    selectedSetMenu,
    selectedMenuItems,
    focusedDish,
    selectedMeatType,
    buildMenuKey,
}: UseCategorySequenceProps) => {
    // Get ordered list of categories that exist in current menu
    const getOrderedCategories = useMemo(() => {
        const categoryOrder = selectedSetMenu === "Premium Snack Box" ? PREMIUM_SNACK_BOX_ORDER : DEFAULT_CATEGORY_ORDER;

        const existingCategories = [
            ...new Set(
                availableMenus
                    .map((m) => m.lunchbox_menu_category)
                    .filter((cat): cat is string => cat !== null && cat !== undefined && cat !== "ข้าว")
            ),
        ];

        // Add virtual meat filter if we have a dish category that requires meat
        if (existingCategories.some((cat) => cat === "กับข้าวที่ 1" || cat === "ข้าว+กับข้าว")) {
            existingCategories.push("meat-filter");
        }

        return categoryOrder.filter((cat): cat is string => existingCategories.includes(cat));
    }, [availableMenus, selectedSetMenu]);

    // Get list of categories that have been selected (excluding rice)
    const getSelectedCategories = useMemo(() => {
        const selected = availableMenus
            .filter((menu) => selectedMenuItems.includes(buildMenuKey(menu)))
            .map((menu) => menu.lunchbox_menu_category)
            .filter((cat): cat is string => cat !== null && cat !== undefined && cat !== "ข้าว");

        // Add virtual flags for sequence logic
        if (focusedDish !== null) {
            if (!selected.includes("กับข้าวที่ 1")) selected.push("กับข้าวที่ 1");
            if (!selected.includes("ข้าว+กับข้าว")) selected.push("ข้าว+กับข้าว");
        }

        if (focusedDish !== null && selectedMeatType !== null) {
            selected.push("meat-filter");
        }

        return selected;
    }, [availableMenus, selectedMenuItems, focusedDish, selectedMeatType, buildMenuKey]);

    // Check if a category is locked (requires previous category to be selected first)
    const isCategoryLocked = useMemo(() => {
        return (category: string) => {
            const categoryIndex = getOrderedCategories.indexOf(category);

            if (categoryIndex === -1) return false;
            if (categoryIndex === 0) return false;

            const prevCategory = getOrderedCategories[categoryIndex - 1];
            return !getSelectedCategories.includes(prevCategory);
        };
    }, [getOrderedCategories, getSelectedCategories]);

    // Get the previous category that needs to be selected
    const getPreviousRequiredCategory = useMemo(() => {
        return (category: string) => {
            const categoryIndex = getOrderedCategories.indexOf(category);
            if (categoryIndex <= 0) return null;
            return getOrderedCategories[categoryIndex - 1];
        };
    }, [getOrderedCategories]);

    return {
        getOrderedCategories,
        getSelectedCategories,
        isCategoryLocked,
        getPreviousRequiredCategory,
    };
};
