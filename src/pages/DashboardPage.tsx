// ============================================================
// Dashboard Page — stats cards, agent perf, charts, recent activity
// ============================================================
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/contexts/TicketContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Ticket, Clock, CheckCircle2, TrendingUp,
  AlertTriangle, ArrowRight, PlusCircle,
  Timer, Zap, Hourglass,
} from "lucide-react";

// ---- Custom tooltip shared styles ----
const TooltipStyle: React.CSSProperties = {
  background: "hsl(0 0% 100%)",
  border: "1px solid hsl(220 13% 89%)",
  borderRadius: 10,
  boxShadow: "0 4px 16px hsl(222 47% 11% / 0.1)",
  padding: "8px 14px",
  fontSize: 13,
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={TooltipStyle}>
      <p className="font-semibold text-foreground mb-0.5">{label}</p>
      <p className="text-primary">{payload[0].value} ticket{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={TooltipStyle}>
      <p className="font-semibold text-foreground mb-0.5">{label}</p>
      <p className="text-primary">{payload[0].value} ticket{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
};

const CATEGORY_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(38, 92%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(0, 84%, 60%)",
  "hsl(270, 60%, 58%)",
  "hsl(196, 80%, 50%)",
];

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { tickets } = useTickets();

  // ---- Stats ----
  const total      = tickets.length;
  const open       = tickets.filter((t) => t.status === "Open").length;
  const inProgress = tickets.filter((t) => t.status === "In Progress").length;
  const closed     = tickets.filter((t) => t.status === "Closed").length;
  const highPriority = tickets.filter(
    (t) => t.priority === "High" && t.status !== "Closed"
  ).length;

  // ---- Agent performance stats (mock) ----
  const resolvedToday = useMemo(() => {
    // Mock: count closed tickets as "resolved today"
    return tickets.filter((t) => t.status === "Closed").length;
  }, [tickets]);

  const avgResolutionTime = "2.4 hrs";
  const pendingCount = open + inProgress;

  // ---- Recent tickets (last 5) ----
  const recent = useMemo(
    () =>
      [...tickets]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [tickets]
  );

  // ---- Bar chart: tickets per category ----
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach((t) => { counts[t.category] = (counts[t.category] ?? 0) + 1; });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [tickets]);

  // ---- Line chart: ticket volume over time (daily, last 14 days) ----
  const volumeData = useMemo(() => {
    const today = new Date();
    const days: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dateStr = d.toISOString().split("T")[0];
      const count = tickets.filter(
        (t) => t.createdAt.split("T")[0] === dateStr
      ).length;
      days.push({ date: label, count });
    }
    tickets.forEach((t) => {
      const created = t.createdAt.split("T")[0];
      const entry = days.find(
        (d) =>
          new Date(d.date + " 2024").toISOString().split("T")[0] === created ||
          false
      );
      if (entry) entry.count = Math.max(entry.count, 1);
    });
    const allZero = days.every((d) => d.count === 0);
    if (allZero) {
      const mockCounts = [0, 1, 0, 2, 1, 0, 0, 1, 1, 0, 2, 1, 1, 0];
      days.forEach((d, i) => { d.count = mockCounts[i] ?? 0; });
    }
    return days;
  }, [tickets]);

  const ticketListRoute = currentUser?.role === "user" ? "/my-tickets" : "/tickets";

  const stats = [
    { label: "Total Tickets", value: total,       icon: Ticket,       bg: "stat-card-primary" },
    { label: "Open",          value: open,        icon: Clock,        bg: "stat-card-amber"   },
    { label: "In Progress",   value: inProgress,  icon: TrendingUp,   bg: "stat-card-primary" },
    { label: "Closed",        value: closed,      icon: CheckCircle2, bg: "stat-card-green"   },
  ];

  const agentStats = [
    { label: "Resolved Today", value: resolvedToday, icon: Zap,        bg: "stat-card-green",   trend: "+12%" },
    { label: "Avg Resolution",  value: avgResolutionTime, icon: Timer,     bg: "stat-card-primary", trend: "-8%" },
    { label: "Pending",         value: pendingCount,  icon: Hourglass,  bg: "stat-card-amber",   trend: "" },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 18
              ? "afternoon"
              : "evening"}
            , {currentUser?.name.split(" ")[0]} 👋
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

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-5 text-primary-foreground`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-3xl font-bold mt-1">{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Agent Performance Stats ────────────────────── */}
      {(currentUser?.role === "agent" || currentUser?.role === "admin") && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Agent Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {agentStats.map((s) => (
              <div key={s.label} className="bg-card rounded-xl border border-border shadow-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                    {s.trend && (
                      <p className={`text-xs font-medium mt-1 ${s.trend.startsWith("+") ? "text-[hsl(var(--status-closed))]" : "text-[hsl(var(--status-inprogress))]"}`}>
                        {s.trend} vs yesterday
                      </p>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    s.bg === "stat-card-green" ? "bg-[hsl(var(--status-closed-bg))] text-[hsl(var(--status-closed))]" :
                    s.bg === "stat-card-amber" ? "bg-[hsl(var(--status-open-bg))] text-[hsl(var(--status-open))]" :
                    "bg-[hsl(var(--status-inprogress-bg))] text-[hsl(var(--status-inprogress))]"
                  }`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── High priority alert ─────────────────────────── */}
      {highPriority > 0 && (
        <div className="flex items-center gap-3 p-4 bg-[hsl(var(--priority-high-bg))] border border-[hsl(var(--priority-high))/20] rounded-xl">
          <AlertTriangle className="w-5 h-5 text-[hsl(var(--priority-high))] flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">
              {highPriority} high priority ticket{highPriority > 1 ? "s" : ""}
            </span>{" "}
            require immediate attention.
          </p>
          <Link
            to={ticketListRoute}
            className="ml-auto text-xs font-medium text-primary hover:underline whitespace-nowrap"
          >
            View all
          </Link>
        </div>
      )}

      {/* ── Charts row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Tickets by Category</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution across all support categories</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 89%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} interval={0} tickFormatter={(v: string) => v.length > 8 ? v.slice(0, 8) + "…" : v} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "hsl(221 83% 53% / 0.06)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {categoryData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Ticket Volume (Last 14 Days)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Number of tickets created per day</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={volumeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 89%)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line type="monotone" dataKey="count" stroke="hsl(221, 83%, 53%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(221, 83%, 53%)", strokeWidth: 0 }} activeDot={{ r: 5, fill: "hsl(221, 83%, 53%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent tickets + summary ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Tickets</h3>
            <Link to={ticketListRoute} className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recent.map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Ticket className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary truncate transition-colors">{ticket.title}</p>
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

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Status Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Open",        value: open,       max: total, color: "bg-[hsl(var(--status-open))]" },
                { label: "In Progress", value: inProgress, max: total, color: "bg-[hsl(var(--status-inprogress))]" },
                { label: "Closed",      value: closed,     max: total, color: "bg-[hsl(var(--status-closed))]" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${item.color}`} style={{ width: total ? `${(item.value / total) * 100}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Top Categories</h3>
            <div className="space-y-2">
              {categoryData.slice(0, 5).map(({ name, count }, i) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    <span className="text-muted-foreground">{name}</span>
                  </div>
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
