import {
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

type BORiskTone = "healthy" | "medium" | "warning" | "critical";

export interface BORisk {
  tone: BORiskTone;
  label: string;
  icon: LucideIcon;
}

export function deriveBORisk(borate: number): BORisk {
  if (borate < 5)
    return { tone: "healthy", label: "Healthy", icon: ShieldCheck };
  if (borate < 10)
    return { tone: "medium", label: "Medium", icon: AlertCircle };
  if (borate < 20)
    return { tone: "warning", label: "At Risk", icon: AlertTriangle };
  return { tone: "critical", label: "Critical", icon: ShieldAlert };
}
