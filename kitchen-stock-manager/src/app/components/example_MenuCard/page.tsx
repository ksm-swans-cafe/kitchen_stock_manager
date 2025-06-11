'use client';

import { useState, useEffect, useRef } from "react";
import MenuCard from "@/components/MenuCard";

type MenuItem = {
  title: string;
  imageUrl?: string;
  description: string;
};

const allMenus: MenuItem[] = [
  { title: "ผัดกระเพราเนื้อ", description: "รสจัดจ้าน" },
  { title: "ผัดกระเพราไก่", description: "เผ็ดพอดี" },
  { title: "ข้าวมันไก่", description: "ไก่นุ่ม น้ำจิ้มเด็ด" },
  { title: "ต้มยำกุ้ง", description: "รสชาติจัดจ้าน" },
  { title: "แกงเขียวหวาน", description: "หอมกลิ่นเครื่องแกง" },
  { title: "ส้มตำไทย", description: "เผ็ดเปรี้ยวหวาน" },
  { title: "ข้าวผัดปู", description: "ปูเน้นๆ" },
  { title: "ผัดซีอิ๊ว", description: "เส้นนุ่ม รสกลมกล่อม" },
  { title: "ข้าวเหนียวมะม่วง", description: "ของหวานคลายร้อน" },
  { title: "ก๋วยเตี๋ยวเรือ", description: "น้ำซุปเข้มข้น" },
  { title: "ยำวุ้นเส้น", description: "รสจัดจ้าน" },
  { title: "ข้าวต้มปลา", description: "ปลาเนื้อแน่น" },
  { title: "ผัดผักบุ้งไฟแดง", description: "ผักสดกรอบ" },
  { title: "ขนมจีนน้ำยา", description: "น้ำยาหอมกลิ่นเครื่องแกง" },
  { title: "ลาบหมู", description: "รสชาติจัดจ้าน" },
  { title: "ข้าวหน้าเป็ด", description: "เป็ดนุ่ม น้ำราดเข้มข้น" },
  { title: "ข้าวผัดกุ้ง", description: "กุ้งสดใหม่" },
  { title: "แกงส้มชะอมไข่", description: "รสเปรี้ยวหวาน" },
  { title: "ข้าวมันไก่ทอด", description: "ไก่ทอดกรอบ" },
  { title: "ต้มจืดเต้าหู้หมูสับ", description: "น้ำซุปใส" },
  { title: "ยำทะเล", description: "ซีฟู้ดสดใหม่" },
  { title: "ข้าวผัดหมู", description: "หมูนุ่ม รสกลมกล่อม" },
  { title: "ผัดไทยกุ้งสด", description: "เส้นนุ่ม รสชาติกลมกล่อม" },
  { title: "ข้าวหน้าเนื้อ", description: "เนื้อนุ่ม น้ำราดเข้มข้น" },
  { title: "แกงมัสมั่นไก่", description: "หอมกลิ่นเครื่องแกง" },
  { title: "ข้าวเหนียวไก่ทอด", description: "ไก่ทอดกรอบ ข้าวเหนียวหอม" },
  { title: "ยำมะม่วง", description: "เปรี้ยวหวาน" },
  { title: "ข้าวผัดกะเพรา", description: "รสชาติจัดจ้าน" },
  { title: "ต้มยำปลากะพง", description: "รสชาติจัดจ้าน" },
  { title: "ข้าวผัดหนำเลี๊ยบ", description: "รสชาติกลมกล่อม" },
  { title: "แกงเผ็ดเป็ดย่าง", description: "หอมกลิ่นเครื่องแกง" },
  { title: "ข้าวหน้าไก่ย่าง", description: "ไก่ย่างหอม" },
  { title: "ผัดหมี่ฮ่องกง", description: "เส้นนุ่ม รสชาติกลมกล่อม" },
  { title: "ข้าวต้มทรงเครื่อง", description: "น้ำซุปใส" },
  { title: "ยำวุ้นเส้นทะเล", description: "ซีฟู้ดสดใหม่" },
  { title: "ข้าวผัดต้มยำ", description: "รสชาติจัดจ้าน" },
  { title: "แกงเขียวหวานไก่", description: "หอมกลิ่นเครื่องแกง" },
  { title: "ข้าวเหนียวหมูปิ้ง", description: "หมูปิ้งหอม" },
  { title: "ยำถั่วพู", description: "รสชาติกลมกล่อม" },
  { title: "ข้าวผัดปลาทู", description: "ปลาทูสดใหม่" },
  { title: "ผัดซีอิ๊วทะเล", description: "ซีฟู้ดสดใหม่" },
  { title: "ข้าวหน้าไก่กระเทียม", description: "ไก่กระเทียมหอม" },
  { title: "ต้มยำไก่", description: "รสชาติจัดจ้าน" },
  { title: "ข้าวผัดพริกแกง", description: "รสชาติจัดจ้าน" },
  { title: "แกงส้มปลากะพง", description: "รสเปรี้ยวหวาน" },
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

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [visibleCount]);

  return (
    <section className="section">
      <div className="container">
        <div className="mb-3 has-text-centered">
          <h1 className="title">Menu</h1>
        </div>

        <div className="columns is-multiline">
          {visibleMenus.map((menu, idx) => (
            <MenuCard key={idx} {...menu} />
          ))}
        </div>

        {visibleCount < allMenus.length && (
          <div ref={loadMoreRef} style={{ height: "1px" }} />
        )}
      </div>
    </section>
  );
}
