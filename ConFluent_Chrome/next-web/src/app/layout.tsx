import type { Metadata } from 'next';
import { Geist, Geist_Mono, Outfit, Work_Sans } from 'next/font/google';
import './globals.css';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Navbar } from '@/components/layout/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Confluents — Translate Anything, Everywhere',
  description:
    'Real-time translation on any website. Write in your language, send in theirs. Free Chrome extension.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${workSans.variable} antialiased bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden pt-20`}
      >
        <Navbar />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
