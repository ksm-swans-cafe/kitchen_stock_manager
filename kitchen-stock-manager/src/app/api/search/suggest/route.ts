import { NextResponse } from "next/server";
import Fuse from "fuse.js";

const TITLES = ["ผัดกระเพราเนื้อ", "ผัดกระเพราไก่", "ผัดกระเพราไข่", "ผัดกระเพราหมู", "ข้าวผัดเนื้อ", "ข้าวผัดไก่", "ข้าวผัดไข่", "ข้าวผัดหมู", "ข้าวมันไก่"];

const normalizeVowels = (text: string): string => {
  return text
    .replace(/แ/g, "เเ") 
    .replace(/เเ/g, "แ"); 
};

const normalizedTitles = TITLES.map((title) => ({
  original: title,
  normalized: normalizeVowels(title),
}));

const fuse = new Fuse(normalizedTitles, {
  threshold: 0.3,
  minMatchCharLength: 0,
  includeScore: true,
  shouldSort: true,
  keys: ["normalized"],
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  if (!query) return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });

  try {
    const normalizedQuery = normalizeVowels(query);

    const results = fuse
      .search(normalizedQuery)
      .slice(0, 5)
      .map((result) => result.item.original);

    await new Promise((resolve) => setTimeout(resolve, 150));

    return NextResponse.json({ suggestions: results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
