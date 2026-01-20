import { MenuItem } from "@/models/menu_card/MenuCard";

export type MenuItemWithAutoRice = MenuItem & {
    lunchbox_AutoRice?: boolean | null;
    lunchbox_showPrice?: boolean;
};

export interface LunchBoxFromAPI {
    lunchbox_name: string;
    lunchbox_set_name: string;
    lunchbox_limit: number;
    lunchbox_name_image?: string;
    lunchbox_set_name_image?: string;
}
