export const getCategoryLimit = (foodSet: string, setMenu: string, category: string) => {
    if (category === "ข้าว") return 1;

    // --- กลุ่มที่เลือกได้มากกว่า 1 อย่าง ---
    if (category === "เครื่องเคียง") {
        // เฉพาะ Set F ของ Lunch Box
        if (foodSet === "Lunch Box" && setMenu === "F") return 2;
        // เฉพาะ Set E ของ Lunch Box
        if (foodSet === "Lunch Box" && setMenu === "E") return 2;
        // เฉพาะ Set D ของ Lunch Box
        if (foodSet === "อาหารเจ" && setMenu === "D") return 2;
    }

    // หมวด "เพิ่มเติมสำหรับเครื่องดื่ม" สามารถเลือก 2 อย่าง
    if (category === "เพิ่มเติมสำหรับเครื่องดื่ม") return 2;

    // มาตรฐานปกติคือเลือกได้ 1 อย่าง (ระบบจะสลับให้อัตโนมัติ)
    return 1;
};
