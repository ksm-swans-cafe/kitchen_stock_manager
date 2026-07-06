type ComboMenu = {
  menu_name?: string | null;
  lunchbox_menu_category?: string | null;
  lunchbox_cost?: number | null;
  menu_ingredients?: unknown[] | null;
};

const BASE_MEAT_COMBO_PAIRS = [{ baseCategory: "สปาเก็ตตี้", meatCategory: "เนื้อสัตว์" }] as const;

function isStandaloneMeatAddon(menu: ComboMenu, baseCategory: string): boolean {
  if (menu.lunchbox_menu_category !== "เนื้อสัตว์") return false;
  const name = (menu.menu_name ?? "").trim();
  if (!name) return false;
  if (baseCategory === "สปาเก็ตตี้" && name.includes("สปาเก็ตตี้")) return false;
  if (name.includes("ข้าว")) return false;
  return true;
}

/** รวมเมนูฐาน (เช่น สปาเก็ตตี้กะเพรา) + ท็อปปิ้งเนื้อ (เช่น เบคอน) ในกลุ่มเดียวกัน */
export function mergeComboMenusInGroup<T extends ComboMenu>(menus: T[]): T[] {
  if (menus.length < 2) return [...menus];

  for (const pair of BASE_MEAT_COMBO_PAIRS) {
    const baseIdx = menus.findIndex((m) => m.lunchbox_menu_category === pair.baseCategory);
    const meatIdx = menus.findIndex((m) => isStandaloneMeatAddon(m, pair.baseCategory));

    if (baseIdx === -1 || meatIdx === -1) continue;

    const base = menus[baseIdx];
    const meat = menus[meatIdx];
    const baseName = (base.menu_name ?? "").trim();
    const meatName = (meat.menu_name ?? "").trim();
    const combinedName = baseName.endsWith(meatName) ? baseName : `${baseName}${meatName}`;

    const merged = {
      ...base,
      menu_name: combinedName,
      lunchbox_cost: (base.lunchbox_cost ?? 0) + (meat.lunchbox_cost ?? 0),
      menu_ingredients: [...(base.menu_ingredients ?? []), ...(meat.menu_ingredients ?? [])],
      lunchbox_menu_category: pair.baseCategory,
    } as T;

    return menus.filter((_, i) => i !== baseIdx && i !== meatIdx).concat(merged);
  }

  return [...menus];
}

/** รวมเมนูตาม lunchbox_limit ก่อนแสดงหรือบันทึก */
export function mergeSetMenusForDisplay<T extends ComboMenu>(menus: T[], limit: number): T[] {
  if (menus.length === 0) return [];

  if (!limit || limit <= 0) return mergeComboMenusInGroup(menus);

  const merged: T[] = [];
  for (let i = 0; i < menus.length; i += limit) {
    merged.push(...mergeComboMenusInGroup(menus.slice(i, i + limit)));
  }
  return merged;
}
