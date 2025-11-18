"use client";

import { Menu as MenuIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/Button";
import { NavConfig } from "../lib/navigation";
import Link from "next/link";

export default function MobileMenu({ navConfig }: { navConfig: NavConfig }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open navigation menu">
          <MenuIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {navConfig.sideNavItems[0].children.map((item) => (
          <Link href={item.href} key={item.href}>
            <DropdownMenuItem>{item.title}</DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
