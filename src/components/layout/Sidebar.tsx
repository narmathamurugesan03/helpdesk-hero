// ============================================================
// Sidebar — main navigation with role-based menu items
// ============================================================
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Headphones,
  LogOut,
} from "lucide-react";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
  roles: Role[];
}

const navItems: NavItem[] = [
  { label: "Dashboard",      icon: LayoutDashboard, to: "/dashboard",       roles: ["admin", "agent", "user"] },
  { label: "All Tickets",    icon: Ticket,          to: "/tickets",          roles: ["admin", "agent"] },
  { label: "My Tickets",     icon: Ticket,          to: "/my-tickets",       roles: ["user"] },
  { label: "Create Ticket",  icon: PlusCircle,      to: "/tickets/new",      roles: ["admin", "agent", "user"] },
  { label: "Users",          icon: Users,           to: "/users",            roles: ["admin"] },
  { label: "Settings",       icon: Settings,        to: "/settings",         roles: ["admin"] },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const { currentUser, logout } = useAuth();

  const visible = navItems.filter(
    (item) => currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[hsl(var(--sidebar))] transition-all duration-300 flex-shrink-0 ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[hsl(var(--sidebar-border))]">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Headphones className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold text-[hsl(var(--sidebar-foreground))] text-sm leading-tight">
            IT Helpdesk
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""} ${collapsed ? "justify-center" : ""}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-2 pb-4 border-t border-[hsl(var(--sidebar-border))] pt-3">
        {!collapsed && currentUser && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-[hsl(var(--sidebar-foreground))] truncate">{currentUser.name}</p>
            <p className="text-xs text-[hsl(var(--sidebar-muted))] capitalize">{currentUser.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={`nav-item w-full ${collapsed ? "justify-center" : ""} hover:bg-destructive/20 hover:text-destructive`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-card border border-border shadow-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
};
