import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/lib/auth/AuthProvider";

import Menubar from "@/components/ui/Menubar";
import Navigatebar from "@/components/ui/Navigatebar";
import Footer from "@/components/ui/Footer";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const sarabun = Sarabun({
  weight: ["400", "700"],
  subsets: ["latin", "thai"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kitchen Stock Manager",
  description: "Use for manage stock in kitchen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${sarabun.className} antialiased`}>
        <AuthProvider>
          <Menubar />
          <Navigatebar />
          {children}
          {/* <Footer /> */}
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
