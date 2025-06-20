'use client';

import { useState, useEffect, useRef } from "react";
import { MenuItem } from "@/models/menu_card/MenuCard-model";
import MenuCard from "@/share/order/MenuCard";

const allMenus: MenuItem[] = [
  { menu_name: "ผัดกระเพราเนื้อ", description: "รสจัดจ้าน" },
  { menu_name: "ผัดกระเพราไก่", description: "เผ็ดพอดี" },
  { menu_name: "ข้าวมันไก่", description: "ไก่นุ่ม น้ำจิ้มเด็ด" },
  { menu_name: "ต้มยำกุ้ง", description: "รสชาติจัดจ้าน" },
  { menu_name: "แกงเขียวหวาน", description: "หอมกลิ่นเครื่องแกง" },
  { menu_name: "ส้มตำไทย", description: "เผ็ดเปรี้ยวหวาน" },
  { menu_name: "ข้าวผัดปู", description: "ปูเน้นๆ" },
  { menu_name: "ผัดซีอิ๊ว", description: "เส้นนุ่ม รสกลมกล่อม" },
  { menu_name: "ข้าวเหนียวมะม่วง", description: "ของหวานคลายร้อน" },
  { menu_name: "ก๋วยเตี๋ยวเรือ", description: "น้ำซุปเข้มข้น" },
  { menu_name: "ยำวุ้นเส้น", description: "รสจัดจ้าน" },
  { menu_name: "ข้าวต้มปลา", description: "ปลาเนื้อแน่น" },
  { menu_name: "ผัดผักบุ้งไฟแดง", description: "ผักสดกรอบ" },
  { menu_name: "ขนมจีนน้ำยา", description: "น้ำยาหอมกลิ่นเครื่องแกง" },
  { menu_name: "ลาบหมู", description: "รสชาติจัดจ้าน" },
  { menu_name: "ข้าวหน้าเป็ด", description: "เป็ดนุ่ม น้ำราดเข้มข้น" },
  { menu_name: "ข้าวผัดกุ้ง", description: "กุ้งสดใหม่" },
  { menu_name: "แกงส้มชะอมไข่", description: "รสเปรี้ยวหวาน" },
  { menu_name: "ข้าวมันไก่ทอด", description: "ไก่ทอดกรอบ" },
  { menu_name: "ต้มจืดเต้าหู้หมูสับ", description: "น้ำซุปใส" },
  { menu_name: "ยำทะเล", description: "ซีฟู้ดสดใหม่" },
  { menu_name: "ข้าวผัดหมู", description: "หมูนุ่ม รสกลมกล่อม" },
  { menu_name: "ผัดไทยกุ้งสด", description: "เส้นนุ่ม รสชาติกลมกล่อม" },
  { menu_name: "ข้าวหน้าเนื้อ", description: "เนื้อนุ่ม น้ำราดเข้มข้น" },
  { menu_name: "แกงมัสมั่นไก่", description: "หอมกลิ่นเครื่องแกง" },
  { menu_name: "ข้าวเหนียวไก่ทอด", description: "ไก่ทอดกรอบ ข้าวเหนียวหอม" },
  { menu_name: "ยำมะม่วง", description: "เปรี้ยวหวาน" },
  { menu_name: "ข้าวผัดกะเพรา", description: "รสชาติจัดจ้าน" },
  { menu_name: "ต้มยำปลากะพง", description: "รสชาติจัดจ้าน" },
  { menu_name: "ข้าวผัดหนำเลี๊ยบ", description: "รสชาติกลมกล่อม" },
  { menu_name: "แกงเผ็ดเป็ดย่าง", description: "หอมกลิ่นเครื่องแกง" },
  { menu_name: "ข้าวหน้าไก่ย่าง", description: "ไก่ย่างหอม" },
  { menu_name: "ผัดหมี่ฮ่องกง", description: "เส้นนุ่ม รสชาติกลมกล่อม" },
  { menu_name: "ข้าวต้มทรงเครื่อง", description: "น้ำซุปใส" },
  { menu_name: "ยำวุ้นเส้นทะเล", description: "ซีฟู้ดสดใหม่" },
  { menu_name: "ข้าวผัดต้มยำ", description: "รสชาติจัดจ้าน" },
  { menu_name: "แกงเขียวหวานไก่", description: "หอมกลิ่นเครื่องแกง" },
  { menu_name: "ข้าวเหนียวหมูปิ้ง", description: "หมูปิ้งหอม" },
  { menu_name: "ยำถั่วพู", description: "รสชาติกลมกล่อม" },
  { menu_name: "ข้าวผัดปลาทู", description: "ปลาทูสดใหม่" },
  { menu_name: "ผัดซีอิ๊วทะเล", description: "ซีฟู้ดสดใหม่" },
  { menu_name: "ข้าวหน้าไก่กระเทียม", description: "ไก่กระเทียมหอม" },
  { menu_name: "ต้มยำไก่", description: "รสชาติจัดจ้าน" },
  { menu_name: "ข้าวผัดพริกแกง", description: "รสชาติจัดจ้าน" },
  { menu_name: "แกงส้มปลากะพง", description: "รสเปรี้ยวหวาน" },
];

export default function Home() {
  const chunkSize = 20;
  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const visibleMenus = allMenus.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + chunkSize, allMenus.length));
  };

  useEffect(() => {
    const currentRef = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef); 
      }
    };
  }, [visibleCount]);

  return (
    <section className="section">
      <div className="container">
        <div className="mb-3 has-text-centered">
          <h1 className="title">Menu</h1>
        </div>
        {/* lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 */}
        <div className="justify-center columns grid is-multiline">
          {visibleMenus.map((menu, idx) => (
            <MenuCard key={idx} mode="menu" item={menu} />
          ))}
        </div>

        {visibleCount < allMenus.length && (
          <div ref={loadMoreRef} style={{ height: "1px" }} />
        )}
      </div>
    </section>
  );
}
