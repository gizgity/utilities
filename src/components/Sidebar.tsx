"use client";

import type { NavConfig } from "../lib/navigation";
import { Badge, Text } from "./ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideNavProps {
  setIsOpen?: (isOpen: boolean) => void;
  navConfig: NavConfig;
}

export default function Sidebar({ setIsOpen, navConfig }: SideNavProps) {
  const pathname = usePathname();

  return (
    <div className="sidebar-scroll sticky top-0 ps-3 border-r-3 border-black max-h-screen h-full overflow-y-auto transition-transform transform md:translate-x-0 w-full bg-background flex flex-col justify-start py-8">
      <nav
        className="flex flex-col items-start px-6 space-y-4"
        aria-label="Main navigation"
      >
        {navConfig.sideNavItems.map((item) => (
          <div key={item.title} className="w-full">
            <Text as="h5" className="mb-2 px-2">{item.title}</Text>
            <div className="flex flex-col w-full space-y-4">
              {item.children.map((child) => (
                <Link
                  key={child.title}
                  href={child.href}
                  onClick={() => setIsOpen && setIsOpen(false)}
                  target={child.href.startsWith("http") ? "_blank" : "_self"}
                  className={`px-3 py-2 w-full border-2 text-muted-foreground flex items-center justify-between hover:text-foreground hover:bg-muted hover:border-black hover:shadow-sm transition-all ${pathname === child.href &&
                    "bg-primary text-primary-foreground border-black shadow-md font-bold"
                    }`}
                >
                  <Text className="pe-2 uppercase text-base">
                    {child.title}
                  </Text>
                  {child.tag && (
                    <Badge
                      size="sm"
                      className="py-0.5 px-1.5 border-2 text-sm border-black bg-accent text-accent-foreground"
                    >
                      {child.tag}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
