import { NextResponse } from "next/server";
import Fuse from 'fuse.js';

const TITLES = [
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

const fuse = new Fuse(TITLES, {
  threshold: 0.3,
  minMatchCharLength: 2,
  includeScore: true,
  shouldSort: true,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  if (!query) {
    return NextResponse.json(
      { error: 'Missing query parameter' },
      { status: 400 }
    );
  }

  try {
    const results = fuse.search(query)
      .slice(0, 5)
      .map(result => result.item);

    await new Promise(resolve => setTimeout(resolve, 150));

    return NextResponse.json({ suggestions: results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}