import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { api } from "./api";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetcher = async (url: string) => {
  const res = await api.get<any>(url);
  if (res.status !== 200) throw new Error("Failed to fetch data");
  return res.data;
};