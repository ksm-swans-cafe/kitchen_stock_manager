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

// Function to normalize Thai vowels (แ -> เเ and vice versa, but keep single เ distinct)
const normalizeVowels = (text: string): string => {
  // Only normalize แ and เเ to a common form, leave single เ untouched
  return text
    .replace(/แ/g, 'เเ') // Convert แ to เเ
    .replace(/เเ/g, 'แ'); // Convert เเ to แ (handles both directions)
};

// Create a normalized version of TITLES for searching
const normalizedTitles = TITLES.map(title => ({
  original: title,
  normalized: normalizeVowels(title)
}));

const fuse = new Fuse(
  normalizedTitles,
  {
    threshold: 0.3,
    minMatchCharLength: 0,
    includeScore: true,
    shouldSort: true,
    keys: ['normalized'], // Search on the normalized field
  }
);

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
    // Normalize the query, but only for แ and เเ, leaving single เ intact
    const normalizedQuery = normalizeVowels(query);

    // Perform the search on normalized titles
    const results = fuse.search(normalizedQuery)
      .slice(0, 5)
      .map(result => result.item.original); // Return the original title

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