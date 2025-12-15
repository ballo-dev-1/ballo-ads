import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./styles/index.css";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ballo Ads",
  description: "Ballo Ads - Your Digital Marketing Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ubuntu.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
