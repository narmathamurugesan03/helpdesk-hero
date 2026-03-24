// ============================================================
// TicketList Page — table with status/priority filters + search
// ============================================================
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/contexts/TicketContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Modal } from "@/components/shared/Modal";
import type { TicketFilters, TicketStatus, TicketPriority, Ticket } from "@/types";
import { Search, PlusCircle, Trash2, Eye, SlidersHorizontal, X } from "lucide-react";

const STATUSES: (TicketStatus | "All")[]  = ["All", "Open", "In Progress", "Closed"];
const PRIORITIES: (TicketPriority | "All")[] = ["All", "High", "Medium", "Low"];

interface Props {
  /** When true, only shows tickets created by the current user */
  myTickets?: boolean;
}

export default function TicketListPage({ myTickets = false }: Props) {
  const { currentUser } = useAuth();
  const { tickets, deleteTicket } = useTickets();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<TicketFilters>({ status: "All", priority: "All", search: "" });
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);

  const visible = useMemo(() => {
    return tickets.filter((t) => {
      if (myTickets && t.createdById !== currentUser?.id) return false;
      if (filters.status !== "All" && t.status !== filters.status) return false;
      if (filters.priority !== "All" && t.priority !== filters.priority) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q) && !t.createdByName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tickets, filters, myTickets, currentUser]);

  const clearFilters = () => setFilters({ status: "All", priority: "All", search: "" });
  const hasActiveFilters = filters.status !== "All" || filters.priority !== "All" || filters.search;

  const confirmDelete = (t: Ticket) => setDeleteTarget(t);
  const handleDelete = () => {
    if (deleteTarget) { deleteTicket(deleteTarget.id); setDeleteTarget(null); }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">{myTickets ? "My Tickets" : "All Tickets"}</h2>
          <p className="text-muted-foreground text-sm">{visible.length} ticket{visible.length !== 1 ? "s" : ""} found</p>
        </div>
        <Link
          to="/tickets/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-medium rounded-lg transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          New Ticket
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tickets…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as TicketStatus | "All" }))}
            className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            {STATUSES.map((s) => <option key={s}>{s === "All" ? "All Statuses" : s}</option>)}
          </select>

          {/* Priority filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value as TicketPriority | "All" }))}
            className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            {PRIORITIES.map((p) => <option key={p}>{p === "All" ? "All Priorities" : p}</option>)}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-input rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Created</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono text-muted-foreground">#{ticket.id}</span>
                  </td>
                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="font-medium text-foreground truncate">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">{ticket.createdByName}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">{ticket.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <PriorityBadge priority={ticket.priority} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={ticket.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-light transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(currentUser?.role === "admin") && (
                        <button
                          onClick={() => confirmDelete(ticket)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="py-16 text-center">
              <SlidersHorizontal className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No tickets match your filters.</p>
              <button onClick={clearFilters} className="mt-2 text-sm text-primary hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Ticket" maxWidth="sm">
        <p className="text-sm text-muted-foreground mb-1">
          Are you sure you want to permanently delete:
        </p>
        <p className="font-medium text-foreground mb-5">"{deleteTarget?.title}"</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 text-sm text-muted-foreground border border-input rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Delete Ticket
          </button>
        </div>
      </Modal>
    </div>
  );
}
