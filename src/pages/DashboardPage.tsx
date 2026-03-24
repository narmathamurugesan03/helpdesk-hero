// ============================================================
// Dashboard Page — stats cards + recent activity
// ============================================================
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/contexts/TicketContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Ticket, Clock, CheckCircle2, AlertTriangle, TrendingUp, ArrowRight, PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { tickets } = useTickets();

  // Stats
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === "Open").length;
  const inProgress = tickets.filter((t) => t.status === "In Progress").length;
  const closed = tickets.filter((t) => t.status === "Closed").length;
  const highPriority = tickets.filter((t) => t.priority === "High" && t.status !== "Closed").length;

  // Recent tickets (last 5 by updatedAt)
  const recent = [...tickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const stats = [
    { label: "Total Tickets",    value: total,       icon: Ticket,       gradient: "stat-card-primary", text: "text-primary-foreground" },
    { label: "Open",             value: open,        icon: Clock,        gradient: "stat-card-amber",   text: "text-primary-foreground" },
    { label: "In Progress",      value: inProgress,  icon: TrendingUp,   gradient: "stat-card-primary", text: "text-primary-foreground" },
    { label: "Closed",           value: closed,      icon: CheckCircle2, gradient: "stat-card-green",   text: "text-primary-foreground" },
  ];

  const ticketListRoute = currentUser?.role === "user" ? "/my-tickets" : "/tickets";

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
            {currentUser?.name.split(" ")[0]} 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here's an overview of your helpdesk today.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-medium rounded-lg transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          New Ticket
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${s.gradient} rounded-xl p-5 text-primary-foreground`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wide">{s.label}</p>
                <p className="text-3xl font-bold mt-1">{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* High priority alert */}
      {highPriority > 0 && (
        <div className="flex items-center gap-3 p-4 bg-[hsl(var(--priority-high-bg))] border border-[hsl(var(--priority-high))/20] rounded-xl">
          <AlertTriangle className="w-5 h-5 text-[hsl(var(--priority-high))] flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{highPriority} high priority ticket{highPriority > 1 ? "s" : ""}</span>{" "}
            require immediate attention.
          </p>
          <Link to={ticketListRoute} className="ml-auto text-xs font-medium text-primary hover:underline whitespace-nowrap">
            View all
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Tickets</h3>
            <Link to={ticketListRoute} className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recent.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-start gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Ticket className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary truncate transition-colors">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    By {ticket.createdByName} · {new Date(ticket.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={ticket.status} size="sm" />
                  <PriorityBadge priority={ticket.priority} size="sm" />
                </div>
              </Link>
            ))}
            {recent.length === 0 && (
              <div className="px-6 py-10 text-center text-muted-foreground text-sm">No tickets yet.</div>
            )}
          </div>
        </div>

        {/* Summary panel */}
        <div className="space-y-4">
          {/* Status breakdown */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Status Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Open",        value: open,        max: total, color: "bg-[hsl(var(--status-open))]" },
                { label: "In Progress", value: inProgress,  max: total, color: "bg-[hsl(var(--status-inprogress))]" },
                { label: "Closed",      value: closed,      max: total, color: "bg-[hsl(var(--status-closed))]" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${item.color}`}
                      style={{ width: total ? `${(item.value / total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Top Categories</h3>
            <div className="space-y-2">
              {Object.entries(
                tickets.reduce<Record<string, number>>((acc, t) => {
                  acc[t.category] = (acc[t.category] ?? 0) + 1;
                  return acc;
                }, {})
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded-md text-xs">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
