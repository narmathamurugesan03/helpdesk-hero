// ============================================================
// StatusBadge — displays ticket status with semantic colors
// ============================================================
import React from "react";
import type { TicketStatus } from "@/types";

interface Props {
  status: TicketStatus;
  size?: "sm" | "md";
}

const config: Record<TicketStatus, { label: string; dot: string; chip: string }> = {
  Open: {
    label: "Open",
    dot: "bg-[hsl(var(--status-open))]",
    chip: "bg-[hsl(var(--status-open-bg))] text-[hsl(var(--status-open))]",
  },
  "In Progress": {
    label: "In Progress",
    dot: "bg-[hsl(var(--status-inprogress))]",
    chip: "bg-[hsl(var(--status-inprogress-bg))] text-[hsl(var(--status-inprogress))]",
  },
  Closed: {
    label: "Closed",
    dot: "bg-[hsl(var(--status-closed))]",
    chip: "bg-[hsl(var(--status-closed-bg))] text-[hsl(var(--status-closed))]",
  },
};

export const StatusBadge: React.FC<Props> = ({ status, size = "md" }) => {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${c.chip} ${
        size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"
      }`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};
