// ============================================================
// Navbar — top bar with breadcrumb, user avatar, notifications
// ============================================================
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Menu, X, Search } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/tickets":    "All Tickets",
  "/my-tickets": "My Tickets",
  "/tickets/new":"Create Ticket",
  "/users":      "User Management",
  "/settings":   "Settings",
};

interface Props {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export const Navbar: React.FC<Props> = ({ onMobileMenuToggle, mobileMenuOpen }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // Resolve route title — handle /tickets/:id patterns
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

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--priority-high))]" />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-card rounded-xl shadow-dropdown border border-border py-1 animate-fade-in">
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
