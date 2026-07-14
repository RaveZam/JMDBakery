import type { ComponentType, ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: ReactNode;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};
