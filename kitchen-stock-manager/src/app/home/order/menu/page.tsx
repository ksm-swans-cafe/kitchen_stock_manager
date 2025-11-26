"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

import { MenuItem } from "@/models/menu_card/MenuCard";

import { create } from "zustand";

import SearchBox from "@/share/order/SearchBox_v2";
import MenuCard from "@/share/order/MenuCardForMenu";

import "./style.css";

interface MenuProps {
  visibleCount: number;
  allMenus: MenuItem[];
  error: string | null;
  searchQuery: string;
  loading: boolean;
  setVisibleCount: (count: number) => void;
  setAllMenus: (menus: MenuItem[]) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

const useMenu = create<MenuProps>((set) => ({
  visibleCount: 10,
  allMenus: [],
  error: null,
  searchQuery: "",
  loading: false,
  setVisibleCount: (count) => set({ visibleCount: count }),
  setAllMenus: (menus) => set({ allMenus: menus }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ loading }),
}));

export default function Menu() {
  const chunkSize = 10;
  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/get/menu/list");
        if (res.status !== 200) throw new Error("Failed to fetch menu list");
        let data: MenuItem[] = await res.data;

        const seen = new Set<string>();
        data = data.filter((menu) => {
          let name = menu.menu_subname ?? null;
          if (!name) return false;

          name = name.replace(/เเ/g, "แ").normalize("NFC");
          menu.menu_subname = name;

          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        });

        setAllMenus(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const filteredMenus = allMenus
    .filter((menu) =>
      menu.menu_subname?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      const nameA = a.menu_subname?.toLowerCase() || "";
      const nameB = b.menu_subname?.toLowerCase() || "";
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
        if (entry.isIntersecting) loadMore();
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      },
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
    .filter((name): name is string => typeof name === "string");

  return (
    <main className="flex min-h-screen flex-col items-center pt-4 px-5 overflow-auto">
      <SearchBox
        apiUrl=""
        dataSource={menus}
        onSelect={(val) => setSearchQuery(val)}
        onChangeQuery={(val) => {
          setSearchQuery(val);
          setVisibleCount(chunkSize);
        }}
        minLength={1}
      />

      <div className="container">
        <div className="p-3 has-text-centered">
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
          <div
            ref={loadMoreRef}
            style={{
              height: "50px",
              width: "100%",
            }}
          />
        )}
      </div>
    </main>
  );
}
