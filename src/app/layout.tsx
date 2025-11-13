import type { Metadata } from "next";
import "./globals.css";
import WithSidebar from "../components/WithSidebar";
import { generateNavConfig } from "../lib/navigation";
import { Archivo_Black, Space_Grotesk } from "next/font/google";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-head",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
  display: "swap",
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
        className={`${archivoBlack.variable} ${space.variable} font-mono antialiased`}
      >
        <WithSidebar navConfig={navConfig}>{children}</WithSidebar>
      </body>
    </html>
  );
}
