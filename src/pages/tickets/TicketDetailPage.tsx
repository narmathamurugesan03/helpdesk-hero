// ============================================================
// TicketDetail Page — full ticket info, comments, status update
// ============================================================
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/contexts/TicketContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Modal } from "@/components/shared/Modal";
import type { TicketStatus } from "@/types";
import {
  ArrowLeft, Calendar, User, Tag, Paperclip,
  MessageSquare, Send, RefreshCw, Trash2, CheckCircle
} from "lucide-react";

const STATUSES: TicketStatus[] = ["Open", "In Progress", "Closed"];

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getTicketById, updateTicketStatus, addComment, deleteTicket } = useTickets();

  const ticket = getTicketById(id ?? "");

  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [statusModal, setStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <p className="text-xl font-semibold text-foreground">Ticket not found</p>
        <button onClick={() => navigate("/tickets")} className="text-primary hover:underline text-sm">
          ← Back to tickets
        </button>
      </div>
    );
  }

  const canUpdateStatus = currentUser?.role === "admin" || currentUser?.role === "agent";
  const canDelete = currentUser?.role === "admin";

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) { setCommentError("Comment cannot be empty."); return; }
    addComment(ticket.id, comment.trim(), currentUser!);
    setComment("");
    setCommentError("");
  };

  const handleStatusChange = () => {
    if (selectedStatus) {
      updateTicketStatus(ticket.id, selectedStatus);
      setStatusModal(false);
      setSelectedStatus(null);
    }
  };

  const handleDelete = () => {
    deleteTicket(ticket.id);
    navigate("/tickets");
  };

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const roleChip: Record<string, string> = {
    admin: "bg-[hsl(var(--priority-high-bg))] text-[hsl(var(--priority-high))]",
    agent: "bg-[hsl(var(--status-inprogress-bg))] text-[hsl(var(--status-inprogress))]",
    user:  "bg-[hsl(var(--status-closed-bg))] text-[hsl(var(--status-closed))]",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ticket header card */}
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <div className="flex flex-wrap items-start gap-2 mb-4">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">#{ticket.id}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-3">{ticket.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ticket.description}</p>

            {/* Attachments */}
            {ticket.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  Attachments ({ticket.attachments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((a) => (
                    <span key={a} className="text-xs px-2.5 py-1.5 bg-muted rounded-lg text-muted-foreground">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">
                Comments <span className="text-muted-foreground font-normal">({ticket.comments.length})</span>
              </h3>
            </div>

            <div className="divide-y divide-border">
              {ticket.comments.map((c) => (
                <div key={c.id} className="px-6 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                      {initials(c.authorName)}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{c.authorName}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${roleChip[c.authorRole]}`}>
                        {c.authorRole}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed pl-11">{c.body}</p>
                </div>
              ))}
              {ticket.comments.length === 0 && (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No comments yet. Be the first to reply.
                </div>
              )}
            </div>

            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="px-6 py-4 border-t border-border">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0 mt-0.5">
                  {initials(currentUser?.name ?? "U")}
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => { setComment(e.target.value); if (commentError) setCommentError(""); }}
                    placeholder="Write a comment…"
                    rows={3}
                    className={`w-full px-3.5 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 resize-none ${commentError ? "border-destructive" : "border-input focus:border-primary"}`}
                  />
                  {commentError && <p className="mt-1 text-xs text-destructive">{commentError}</p>}
                  <button
                    type="submit"
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-medium rounded-lg transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post Comment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Details card */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Ticket Details</h3>

            {[
              { icon: Tag,      label: "Category",   value: ticket.category },
              { icon: Calendar, label: "Created",     value: new Date(ticket.createdAt).toLocaleDateString() },
              { icon: Calendar, label: "Updated",     value: new Date(ticket.updatedAt).toLocaleDateString() },
              { icon: User,     label: "Created by",  value: ticket.createdByName },
              { icon: User,     label: "Assigned to", value: ticket.assignedToName ?? "Unassigned" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions card */}
          {(canUpdateStatus || canDelete) && (
            <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Actions</h3>

              {canUpdateStatus && (
                <button
                  onClick={() => { setSelectedStatus(ticket.status); setStatusModal(true); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-medium rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Update Status
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-destructive/30 text-destructive text-sm font-medium rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Ticket
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status update modal */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Status" maxWidth="sm">
        <p className="text-sm text-muted-foreground mb-4">Select the new status for this ticket.</p>
        <div className="space-y-2 mb-5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-colors ${
                selectedStatus === s
                  ? "border-primary bg-primary-light text-foreground"
                  : "border-input hover:bg-muted text-foreground"
              }`}
            >
              {selectedStatus === s && <CheckCircle className="w-4 h-4 text-primary" />}
              {selectedStatus !== s && <span className="w-4 h-4 rounded-full border-2 border-input inline-block" />}
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setStatusModal(false)} className="px-4 py-2 text-sm text-muted-foreground border border-input rounded-lg hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleStatusChange}
            disabled={!selectedStatus || selectedStatus === ticket.status}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium"
          >
            Apply
          </button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Ticket" maxWidth="sm">
        <p className="text-sm text-muted-foreground mb-5">
          This action is permanent. Are you sure you want to delete "{ticket.title}"?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-muted-foreground border border-input rounded-lg hover:bg-muted">
            Cancel
          </button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
