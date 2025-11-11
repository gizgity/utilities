import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

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
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} font-mono bg-retro-black text-retro-green antialiased`}
      >
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
          <div className="w-full max-w-4xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
