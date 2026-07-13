"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FileText,
  LayoutGrid,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import AccountCard from "./AccountCard";
import type { NavGroup, NavItem } from "../types/dashboard-types";

const navGroups: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/Intelligence", label: "Intelligence", icon: Sparkles },
      { href: "/records", label: "Records", icon: FileText },
    ],
  },
  {
    title: "FIELD OPERATIONS",
    items: [
      { href: "/sessions", label: "Sessions", icon: CalendarDays },
      { href: "/stores", label: "Stores", icon: MapPin },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { href: "/products", label: "Products", icon: Package },
      { href: "/agents", label: "Agents", icon: Users },
      { href: "/admins", label: "Admins", icon: ShieldCheck },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function SidebarNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}): ReactElement {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-accent font-medium text-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
        )}
        <span className="flex items-center gap-2.5">
          <Icon
            className={cn(
              "h-[18px] w-[18px] transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          />
          {item.label}
        </span>
        {item.badge}
      </Link>
    </li>
  );
}

function SidebarNavSection({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}): ReactElement {
  const pathname = usePathname();
  return (
    <div>
      <p className="px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </ul>
    </div>
  );
}

export function Sidebar(): ReactElement {
  return (
    <aside className="flex h-dvh w-[280px] shrink-0 flex-col border-r border-border/70 bg-card px-4 py-5">
      <div className="mb-5 flex items-center gap-3 px-2">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
          <Image
            src="/images/Logo-removebg-preview.png"
            alt="JMD Bakery"
            width={40}
            height={40}
            className="shrink-0"
            priority
          />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">JMD Bakery</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            RouteLedger · Est. 2011
          </p>
        </div>
      </div>

      <div className="-mx-1 mb-4 h-px bg-border/70" />

      <div className="flex-1 space-y-6 overflow-auto pb-2">
        {navGroups.map((group) => (
          <SidebarNavSection
            key={group.title}
            title={group.title}
            items={group.items}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border/70 pt-4">
        <div className="flex-1">
          <AccountCard />
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export default Sidebar;
