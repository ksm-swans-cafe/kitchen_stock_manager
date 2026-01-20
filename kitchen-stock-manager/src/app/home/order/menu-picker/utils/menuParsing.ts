export const getMeatType = (menuName: string): "หมู" | "ไก่" | "หมึก" | "กุ้ง" | "ทะเล" | null => {
    if (menuName.includes("หมู")) return "หมู";
    if (menuName.includes("ไก่")) return "ไก่";
    if (menuName.includes("หมึก")) return "หมึก";
    if (menuName.includes("กุ้ง")) return "กุ้ง";
    if (menuName.includes("ทะเล")) return "ทะเล";
    return null;
};

export const getDishType = (menuName: string): string | null => {
    if (menuName.includes("กะเพรา") || menuName.includes("กระเพรา")) return "กะเพรา";
    if (menuName.includes("กระเทียม")) return "กระเทียม";
    if (menuName.includes("พริกแกง") || menuName.includes("พริกเเกง")) return "พริกแกง";
    if (menuName.includes("พะแนง")) return "พะแนง";
    if (menuName.includes("คั่วกลิ้ง")) return "คั่วกลิ้ง";
    if (menuName.includes("ผัดผงกะหรี่")) return "ผัดผงกะหรี่";
    return null;
};
