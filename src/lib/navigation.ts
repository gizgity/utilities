import fs from "fs";
import path from "path";

export interface NavItem {
  title: string;
  href: string;
  tag?: string;
}

export interface SideNavSection {
  title: string;
  children: NavItem[];
}

export interface NavConfig {
  sideNavItems: SideNavSection[];
}

export function generateNavConfig(): NavConfig {
  const appDirectory = path.join(process.cwd(), "src/app");
  const directories = fs
    .readdirSync(appDirectory, { withFileTypes: true })
    .filter((dirent) => {
      if (!dirent.isDirectory()) return false;
      // Exclude special nextjs folders
      if (dirent.name.startsWith("(") || dirent.name.startsWith("_") || dirent.name.startsWith(".")) return false;
      // Exclude api folder
      if (dirent.name === 'api') return false;

      // Check if it has a page.tsx file
      const pagePath = path.join(appDirectory, dirent.name, 'page.tsx');
      return fs.existsSync(pagePath);
    })
    .map((dirent) => dirent.name);

  const navItems: NavItem[] = directories.map((page) => {
    if (page === "tts") {
      return {
        title: "Text-to-Speech",
        href: "/tts",
      };
    }
    if (page === "ytdt") {
      return {
        title: "utube dlr",
        href: "/ytdt",
      };
    }
    return {
      title: page.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      href: `/${page}`,
    };
  });

  return {
    sideNavItems: [
      {
        title: "PAGES",
        children: navItems,
      },
    ],
  };
}
