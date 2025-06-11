// app/page.tsx
'use client';

import SearchBox from '@/components/SearchBox_v2';

// วิธีที่ 1 Array in Memory
const menus = [
  "ผัดกระเพราเนื้อ",
  "ผัดกระเพราไก่",
  "ผัดกระเพราไข่",
  "ผัดกระเพราหมู",
  "ข้าวผัดเนื้อ",
  "ข้าวผัดไก่",
  "ข้าวผัดไข่",
  "ข้าวผัดหมู",
  "ข้าวมันไก่",
];

// วิธีที่ 2 GET API
const handleSelect = (value: string) => {
    console.log('Selected from API:', value);
};

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
        <div className="w-full max-w-2xl">

            {/* วิธีที่ 1 Array in Memory */}
            <h1 className="text-xl mb-4">ค้นหาด้วยข้อมูลใน Memory</h1>
            <SearchBox dataSource={menus} onSelect={(val) => console.log("Selected:", val)} />

            <br />

            {/* วิธีที่ 2 GET API */}
            <h1 className="text-xl mb-4">ค้นหาด้วย API</h1>
            <SearchBox apiUrl="/api/search/suggest" onSelect={handleSelect} />
        </div>
    </main>
  );
}
