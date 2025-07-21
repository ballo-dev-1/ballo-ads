import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/footer/Footer";

export const metadata: Metadata = {
  title: "Ballo Ads",
  description: "Ballo Ads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className=""
      >
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
