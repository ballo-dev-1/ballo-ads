import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./crm.css";
import CrmProviders from "@/components/crm/providers/CrmProviders";
import { CrmThemeProvider } from "./contexts/CrmThemeContext";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-dm-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "BalloAds CRM",
  description: "BalloAds CRM — Internal Tool",
  robots: { index: false, follow: false },
};

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const fontVars = `${syne.variable} ${dmSans.variable} ${dmMono.variable}`;
  return (
    <CrmThemeProvider className={fontVars}>
      <CrmProviders>{children}</CrmProviders>
    </CrmThemeProvider>
  );
}
