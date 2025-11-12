import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import WithSidebar from "../components/WithSidebar";
import { generateNavConfig } from "../lib/navigation";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Retro Data Extractor",
  description: "Extract data from images and fill templates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navConfig = generateNavConfig();

  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} font-mono bg-retro-black text-retro-green antialiased`}
      >
        <WithSidebar navConfig={navConfig}>{children}</WithSidebar>
      </body>
    </html>
  );
}
