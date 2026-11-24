// src/app/layout.tsx
import type { Metadata } from "next";
import { Anton, Space_Grotesk, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-news",
});

// src/app/layout.tsx
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "DISPATCH // Make a Bait Link",
  description: "Drop a fake breaking headline or mystery box in the group chat. Catch them in 4K.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${spaceGrotesk.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#FAF7F0] text-[#0B0B0B] font-sans antialiased overflow-x-hidden selection:bg-[#FF2E2E] selection:text-white">
        {children}
      </body>
    </html>
  );
}