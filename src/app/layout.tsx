import type { Metadata } from "next";
import "./globals.css";
import WithSidebar from "../components/WithSidebar";
import { generateNavConfig } from "../lib/navigation";
import { Press_Start_2P, VT323 } from "next/font/google";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-head",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Teacher Assistant",
  description: "Automated teacher paper work assistant",
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
        className={`${pressStart.variable} ${vt323.variable} font-sans antialiased`}
      >
        <WithSidebar navConfig={navConfig}>{children}</WithSidebar>
      </body>
    </html>
  );
}
