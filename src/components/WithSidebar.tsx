"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { ReactNode } from "react";
import { NavConfig } from "../lib/navigation";
import MobileMenu from "./MobileMenu";

export default function WithSidebar({
  children,
  navConfig,
}: {
  children: ReactNode;
  navConfig: NavConfig;
}) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/";

  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <>
          <div className="w-64 hidden sm:block">
            <Sidebar navConfig={navConfig} />
          </div>
          <div className="sm:hidden fixed top-2.5 left-2.5 z-50">
            <MobileMenu navConfig={navConfig} />
          </div>
        </>
      )}
      <main className="flex-1 p-8 pt-16 sm:pt-8">
        <div className="w-full max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
