"use client";

import { useState, useEffect, useRef } from "react";
import { MenuItem } from "@/models/menu_card/MenuCard";
import MenuCard from "@/share/order/MenuCard";

const allMenus: MenuItem[] = [
  { menu_name: "ผัดกระเพราเนื้อ", menu_description: "รสจัดจ้าน" },
  { menu_name: "ผัดกระเพราไก่", menu_description: "เผ็ดพอดี" },
  { menu_name: "ข้าวมันไก่", menu_description: "ไก่นุ่ม น้ำจิ้มเด็ด" },
  { menu_name: "ต้มยำกุ้ง", menu_description: "รสชาติจัดจ้าน" },
  { menu_name: "แกงเขียวหวาน", menu_description: "หอมกลิ่นเครื่องแกง" },
  { menu_name: "ส้มตำไทย", menu_description: "เผ็ดเปรี้ยวหวาน" },
  { menu_name: "ข้าวผัดปู", menu_description: "ปูเน้นๆ" },
  { menu_name: "ผัดซีอิ๊ว", menu_description: "เส้นนุ่ม รสกลมกล่อม" },
  { menu_name: "ข้าวเหนียวมะม่วง", menu_description: "ของหวานคลายร้อน" },
  { menu_name: "ก๋วยเตี๋ยวเรือ", menu_description: "น้ำซุปเข้มข้น" },
  { menu_name: "ยำวุ้นเส้น", menu_description: "รสจัดจ้าน" },
  { menu_name: "ข้าวต้มปลา", menu_description: "ปลาเนื้อแน่น" },
  { menu_name: "ผัดผักบุ้งไฟแดง", menu_description: "ผักสดกรอบ" },
  { menu_name: "ขนมจีนน้ำยา", menu_description: "น้ำยาหอมกลิ่นเครื่องแกง" },
  { menu_name: "ลาบหมู", menu_description: "รสชาติจัดจ้าน" },
  { menu_name: "ข้าวหน้าเป็ด", menu_description: "เป็ดนุ่ม น้ำราดเข้มข้น" },
  { menu_name: "ข้าวผัดกุ้ง", menu_description: "กุ้งสดใหม่" },
  { menu_name: "แกงส้มชะอมไข่", menu_description: "รสเปรี้ยวหวาน" },
  { menu_name: "ข้าวมันไก่ทอด", menu_description: "ไก่ทอดกรอบ" },
  { menu_name: "ต้มจืดเต้าหู้หมูสับ", menu_description: "น้ำซุปใส" },
  { menu_name: "ยำทะเล", menu_description: "ซีฟู้ดสดใหม่" },
  { menu_name: "ข้าวผัดหมู", menu_description: "หมูนุ่ม รสกลมกล่อม" },
  { menu_name: "ผัดไทยกุ้งสด", menu_description: "เส้นนุ่ม รสชาติกลมกล่อม" },
  { menu_name: "ข้าวหน้าเนื้อ", menu_description: "เนื้อนุ่ม น้ำราดเข้มข้น" },
  { menu_name: "แกงมัสมั่นไก่", menu_description: "หอมกลิ่นเครื่องแกง" },
  { menu_name: "ข้าวเหนียวไก่ทอด", menu_description: "ไก่ทอดกรอบ ข้าวเหนียวหอม" },
  { menu_name: "ยำมะม่วง", menu_description: "เปรี้ยวหวาน" },
  { menu_name: "ข้าวผัดกะเพรา", menu_description: "รสชาติจัดจ้าน" },
  { menu_name: "ต้มยำปลากะพง", menu_description: "รสชาติจัดจ้าน" },
  { menu_name: "ข้าวผัดหนำเลี๊ยบ", menu_description: "รสชาติกลมกล่อม" },
  { menu_name: "แกงเผ็ดเป็ดย่าง", menu_description: "หอมกลิ่นเครื่องแกง" },
  { menu_name: "ข้าวหน้าไก่ย่าง", menu_description: "ไก่ย่างหอม" },
  { menu_name: "ผัดหมี่ฮ่องกง", menu_description: "เส้นนุ่ม รสชาติกลมกล่อม" },
  { menu_name: "ข้าวต้มทรงเครื่อง", menu_description: "น้ำซุปใส" },
  { menu_name: "ยำวุ้นเส้นทะเล", menu_description: "ซีฟู้ดสดใหม่" },
  { menu_name: "ข้าวผัดต้มยำ", menu_description: "รสชาติจัดจ้าน" },
  { menu_name: "แกงเขียวหวานไก่", menu_description: "หอมกลิ่นเครื่องแกง" },
  { menu_name: "ข้าวเหนียวหมูปิ้ง", menu_description: "หมูปิ้งหอม" },
  { menu_name: "ยำถั่วพู", menu_description: "รสชาติกลมกล่อม" },
  { menu_name: "ข้าวผัดปลาทู", menu_description: "ปลาทูสดใหม่" },
  { menu_name: "ผัดซีอิ๊วทะเล", menu_description: "ซีฟู้ดสดใหม่" },
  { menu_name: "ข้าวหน้าไก่กระเทียม", menu_description: "ไก่กระเทียมหอม" },
  { menu_name: "ต้มยำไก่", menu_description: "รสชาติจัดจ้าน" },
  { menu_name: "ข้าวผัดพริกแกง", menu_description: "รสชาติจัดจ้าน" },
  { menu_name: "แกงส้มปลากะพง", menu_description: "รสเปรี้ยวหวาน" },
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
    <section className='section'>
      <div className='container'>
        <div className='mb-3 has-text-centered'>
          <h1 className='title'>Menu</h1>
        </div>
        {/* lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 */}
        <div className='justify-center columns grid is-multiline'>
          {visibleMenus.map((menu, idx) => (
            <MenuCard key={idx} mode='menu' item={menu} />
          ))}
        </div>

        {visibleCount < allMenus.length && <div ref={loadMoreRef} style={{ height: "1px" }} />}
      </div>
    </section>
  );
}
