'use client';

import SearchBox from '@/share/order/SearchBox_v2';
import { useState, useEffect, useRef, useCallback } from "react";
import { MenuItem } from "@/models/menu_card/MenuCard-model";
import MenuCard from "@/share/order/MenuCardForMenu";
import './style.css';


export default function Menu() {
  const chunkSize = 10;

  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/get/menu-list");
        if (!res.ok) throw new Error("Failed to fetch menu list");
        let data: MenuItem[] = await res.json();

        const seen = new Set<string>();
        data = data.filter((menu) => {
          let name = menu.menu_subname ?? null;
          if (!name) return false;
          
          name = name.replace(/เเ/g, "แ").normalize("NFC")
          menu.menu_subname = name;

          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        });

        setAllMenus(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const filteredMenus = allMenus
    .filter(menu =>
      menu.menu_subname?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = a.menu_subname?.toLowerCase() || '';
      const nameB = b.menu_subname?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });

  const visibleMenus = filteredMenus.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + chunkSize, filteredMenus.length));
  }, [filteredMenus.length]);

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
    
    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [visibleCount, filteredMenus]);

  const menus = allMenus
    .map((menu) => menu.menu_subname)
    .filter((name): name is string => typeof name === 'string');

  return (
    <main className="flex min-h-screen flex-col items-center pt-4 px-5 overflow-auto">
      <SearchBox
        dataSource={menus}
        onSelect={(val) => setSearchQuery(val)}
        onChangeQuery={(val) => {
          setSearchQuery(val);
          setVisibleCount(chunkSize);
        }}
        minLength={1}
      />

      <div className='container'>
        <div className='p-3 has-text-centered'>
          {/* <h1 className='title'>Menu</h1> */}
        </div>

        {error && <p className="has-text-danger">Error: {error}</p>}
        {loading && <p>Loading...</p>}

        <div className="justify-center columns grid is-multiline">
          {visibleMenus.map((menu, idx) => (
            <MenuCard mode="menu" key={idx} item={menu} />
          ))}
        </div>

        {visibleCount < filteredMenus.length && (
          <div ref={loadMoreRef} style={{ 
            height: "50px", 
            width: "100%" 
          }} />
        )}
      </div>
    </main>
  );
}
