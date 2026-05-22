"use client";

import type { ComponentType, ReactElement, ReactNode } from "react";
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

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: ReactNode;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

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
          "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <span className="flex items-center gap-2">
          <Icon
            className={cn(
              "h-4 w-4",
              isActive ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground",
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
      <p className="px-3 pb-2 text-[11px] font-medium tracking-wider text-muted-foreground">
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
    <aside className="flex h-dvh w-[280px] shrink-0 flex-col border-r bg-card px-4 py-5">
      <div className="mb-4 flex items-center gap-3 px-2">
        <Image
          src="/images/Logo-removebg-preview.png"
          alt="JMD Bakery"
          width={64}
          height={64}
          className="shrink-0"
          priority
        />
        <div className="leading-tight">
          <p className="text-sm font-semibold">JMD Bakery</p>
          <p className="text-xs text-muted-foreground">RouteLedger</p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-auto pb-2">
        {navGroups.map((group) => (
          <SidebarNavSection
            key={group.title}
            title={group.title}
            items={group.items}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1">
          <AccountCard />
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export default Sidebar;
