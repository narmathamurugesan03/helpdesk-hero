// ============================================================
// PriorityBadge — displays ticket priority with semantic colors
// ============================================================
import React from "react";
import type { TicketPriority } from "@/types";
import { AlertTriangle, ArrowDown, Minus } from "lucide-react";

interface Props {
  priority: TicketPriority;
  size?: "sm" | "md";
}

const config: Record<TicketPriority, { icon: React.ElementType; chip: string; label: string }> = {
  Low: {
    icon: ArrowDown,
    label: "Low",
    chip: "bg-[hsl(var(--priority-low-bg))] text-[hsl(var(--priority-low))]",
  },
  Medium: {
    icon: Minus,
    label: "Medium",
    chip: "bg-[hsl(var(--priority-medium-bg))] text-[hsl(var(--priority-medium))]",
  },
  High: {
    icon: AlertTriangle,
    label: "High",
    chip: "bg-[hsl(var(--priority-high-bg))] text-[hsl(var(--priority-high))]",
  },
};

export const PriorityBadge: React.FC<Props> = ({ priority, size = "md" }) => {
  const c = config[priority];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${c.chip} ${
        size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"
      }`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {c.label}
    </span>
  );
};
