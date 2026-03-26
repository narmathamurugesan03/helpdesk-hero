// ============================================================
// Navbar — top bar with breadcrumb, availability, notifications, user
// ============================================================
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Menu, X, ChevronDown } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/tickets":    "All Tickets",
  "/my-tickets": "My Tickets",
  "/tickets/new":"Create Ticket",
  "/users":      "User Management",
  "/settings":   "Settings",
};

type AgentStatus = "available" | "busy" | "offline";

const STATUS_CONFIG: Record<AgentStatus, { label: string; dot: string }> = {
  available: { label: "Available", dot: "bg-[hsl(var(--status-closed))]" },
  busy:      { label: "Busy",      dot: "bg-[hsl(var(--status-open))]" },
  offline:   { label: "Offline",   dot: "bg-[hsl(var(--priority-high))]" },
};

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "assigned" | "priority" | "update";
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "New ticket assigned", description: "Ticket #t4 — Suspicious email received", time: "2 min ago", read: false, type: "assigned" },
  { id: "n2", title: "High priority alert", description: "Ticket #t1 — VPN issue needs attention", time: "15 min ago", read: false, type: "priority" },
  { id: "n3", title: "Status updated", description: "Ticket #t2 moved to In Progress", time: "1 hr ago", read: false, type: "update" },
  { id: "n4", title: "New ticket assigned", description: "Ticket #t6 — Printer issue", time: "3 hrs ago", read: true, type: "assigned" },
];

const NOTIF_ICON_COLOR: Record<string, string> = {
  assigned: "bg-[hsl(var(--status-inprogress-bg))] text-[hsl(var(--status-inprogress))]",
  priority: "bg-[hsl(var(--priority-high-bg))] text-[hsl(var(--priority-high))]",
  update:   "bg-[hsl(var(--status-closed-bg))] text-[hsl(var(--status-closed))]",
};

interface Props {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export const Navbar: React.FC<Props> = ({ onMobileMenuToggle, mobileMenuOpen }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("available");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const pageTitle =
    routeLabels[location.pathname] ??
    (location.pathname.startsWith("/tickets/") ? "Ticket Details" : "IT Helpdesk");

  const initials = currentUser?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const roleColor: Record<string, string> = {
    admin: "bg-[hsl(var(--priority-high-bg))] text-[hsl(var(--priority-high))]",
    agent: "bg-[hsl(var(--status-inprogress-bg))] text-[hsl(var(--status-inprogress))]",
    user:  "bg-[hsl(var(--status-closed-bg))] text-[hsl(var(--status-closed))]",
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20">
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          onClick={onMobileMenuToggle}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div>
          <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            IT Help Desk Ticketing System
          </p>
        </div>
      </div>

      {/* Right: status + notifications + user */}
      <div className="flex items-center gap-2">
        {/* Agent availability status */}
        {(currentUser?.role === "agent" || currentUser?.role === "admin") && (
          <div className="relative">
            <button
              onClick={() => { setShowStatusMenu((v) => !v); setShowNotifications(false); setShowDropdown(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[agentStatus].dot}`} />
              <span className="hidden sm:inline">{STATUS_CONFIG[agentStatus].label}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-card rounded-xl shadow-[var(--shadow-dropdown)] border border-border py-1 animate-fade-in z-50">
                {(Object.keys(STATUS_CONFIG) as AgentStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setAgentStatus(s); setShowStatusMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted ${agentStatus === s ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications((v) => !v); setShowStatusMenu(false); setShowDropdown(false); }}
            className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[hsl(var(--priority-high))] text-[10px] font-bold text-white px-1">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-1 w-80 bg-card rounded-xl shadow-[var(--shadow-dropdown)] border border-border animate-fade-in z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary-light/30" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${NOTIF_ICON_COLOR[n.type]}`}>
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowDropdown((v) => !v); setShowStatusMenu(false); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {initials}
              </div>
              {/* Status dot on avatar */}
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${STATUS_CONFIG[agentStatus].dot}`} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-card rounded-xl shadow-[var(--shadow-dropdown)] border border-border py-1 animate-fade-in z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleColor[currentUser?.role ?? "user"]}`}>
                  {currentUser?.role}
                </span>
              </div>
              <button
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
