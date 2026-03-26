import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CoefRessources | Prestige, Expertise & Capital Humain à Madagascar",
  description: "Cabinet multidisciplinaire expert en Capital Humain, Organisation et Conseil Stratégique à Madagascar depuis plus de 24 ans.",
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased selection:bg-brand-green/30 selection:text-brand-forest`}
      >
        <div className="noise-overlay" />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

