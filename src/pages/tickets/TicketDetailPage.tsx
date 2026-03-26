// ============================================================
// TicketDetail Page — SLA timer, chat UI, smart suggestions
// ============================================================
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/contexts/TicketContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Modal } from "@/components/shared/Modal";
import type { TicketStatus, TicketCategory } from "@/types";
import {
  ArrowLeft, Calendar, User, Tag, Paperclip,
  MessageSquare, Send, RefreshCw, Trash2, CheckCircle,
  Clock, Lightbulb, AlertTriangle,
} from "lucide-react";

const STATUSES: TicketStatus[] = ["Open", "In Progress", "Closed"];

// ---- SLA config (mock: 4 hours per ticket) ----
const SLA_HOURS = 4;

function getSlaInfo(createdAt: string, status: string) {
  if (status === "Closed") return { label: "Resolved", color: "text-[hsl(var(--status-closed))]", bgColor: "bg-[hsl(var(--status-closed-bg))]", pct: 100 };
  const created = new Date(createdAt).getTime();
  const deadline = created + SLA_HOURS * 60 * 60 * 1000;
  const now = Date.now();
  const remaining = deadline - now;
  const totalMs = SLA_HOURS * 60 * 60 * 1000;
  const pct = Math.max(0, Math.min(100, (remaining / totalMs) * 100));

  if (remaining <= 0) return { label: "Overdue", color: "text-[hsl(var(--priority-high))]", bgColor: "bg-[hsl(var(--priority-high-bg))]", pct: 0 };
  const hrs = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  if (remaining < totalMs * 0.25) return { label: `${hrs}h ${mins}m left`, color: "text-[hsl(var(--priority-high))]", bgColor: "bg-[hsl(var(--priority-high-bg))]", pct };
  if (remaining < totalMs * 0.5)  return { label: `${hrs}h ${mins}m left`, color: "text-[hsl(var(--status-open))]", bgColor: "bg-[hsl(var(--status-open-bg))]", pct };
  return { label: `${hrs}h ${mins}m left`, color: "text-[hsl(var(--status-closed))]", bgColor: "bg-[hsl(var(--status-closed-bg))]", pct };
}

// ---- Smart suggestions per category ----
const SUGGESTIONS: Record<TicketCategory, { title: string; desc: string }[]> = {
  Network: [
    { title: "Restart network adapter", desc: "Disable and re-enable your network adapter from Device Manager" },
    { title: "Flush DNS cache", desc: "Run 'ipconfig /flushdns' in Command Prompt as administrator" },
    { title: "Check VPN configuration", desc: "Verify VPN server address and authentication settings" },
  ],
  Hardware: [
    { title: "Restart the device", desc: "Power cycle the affected hardware completely" },
    { title: "Check cable connections", desc: "Ensure all cables are firmly connected" },
    { title: "Update device drivers", desc: "Check Device Manager for driver updates" },
  ],
  Software: [
    { title: "Reinstall the application", desc: "Uninstall and reinstall the affected software" },
    { title: "Clear application cache", desc: "Remove temp files and restart the application" },
    { title: "Check for updates", desc: "Ensure the software is updated to the latest version" },
  ],
  Security: [
    { title: "Do not click suspicious links", desc: "Mark the email as spam and report to IT security" },
    { title: "Run antivirus scan", desc: "Perform a full system scan with your antivirus software" },
    { title: "Change passwords immediately", desc: "Update passwords for any potentially compromised accounts" },
  ],
  "Account Access": [
    { title: "Try password reset", desc: "Use the self-service portal to reset your password" },
    { title: "Clear browser cookies", desc: "Clear cache and cookies, then try logging in again" },
    { title: "Check caps lock", desc: "Ensure caps lock is off when entering credentials" },
  ],
  Other: [
    { title: "Restart your system", desc: "A simple restart often resolves many issues" },
    { title: "Check system resources", desc: "Open Task Manager to check CPU and memory usage" },
    { title: "Contact IT support", desc: "If the issue persists, reach out directly to the IT team" },
  ],
};

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.comments.length]);

  // SLA info
  const sla = useMemo(() => ticket ? getSlaInfo(ticket.createdAt, ticket.status) : null, [ticket]);

  // Suggestions
  const suggestions = useMemo(() => ticket ? (SUGGESTIONS[ticket.category] ?? SUGGESTIONS.Other) : [], [ticket]);

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

  const isCurrentUser = (authorId: string) => authorId === currentUser?.id;

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

          {/* Chat-style comments */}
          <div className="bg-card rounded-xl border border-border shadow-card flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">
                Conversation <span className="text-muted-foreground font-normal">({ticket.comments.length})</span>
              </h3>
            </div>

            {/* Chat messages */}
            <div className="flex-1 max-h-96 overflow-y-auto px-6 py-4 space-y-4">
              {ticket.comments.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No messages yet. Start the conversation.
                </div>
              )}
              {ticket.comments.map((c) => {
                const isMine = isCurrentUser(c.authorId);
                return (
                  <div key={c.id} className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}>
                    {!isMine && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0 mt-auto">
                        {initials(c.authorName)}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                      {!isMine && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-medium text-foreground">{c.authorName}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${roleChip[c.authorRole]}`}>
                            {c.authorRole}
                          </span>
                        </div>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}>
                        {c.body}
                      </div>
                      <p className={`text-[10px] mt-1 ${isMine ? "text-right" : ""} text-muted-foreground`}>
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {isMine && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0 mt-auto">
                        {initials(c.authorName)}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <form onSubmit={handleAddComment} className="px-4 py-3 border-t border-border flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={(e) => { setComment(e.target.value); if (commentError) setCommentError(""); }}
                  placeholder="Type a message…"
                  rows={1}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 resize-none ${commentError ? "border-destructive" : "border-input focus:border-primary"}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(e);
                    }
                  }}
                />
                {commentError && <p className="mt-1 text-xs text-destructive">{commentError}</p>}
              </div>
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Smart Suggestions */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--status-open-bg))] flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-[hsl(var(--status-open))]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Suggested Solutions</h3>
                <p className="text-xs text-muted-foreground">Based on ticket category: {ticket.category}</p>
              </div>
            </div>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* SLA Timer */}
          {sla && (
            <div className={`rounded-xl border border-border shadow-card p-5 ${sla.bgColor}`}>
              <div className="flex items-center gap-2 mb-3">
                {sla.label === "Overdue" ? (
                  <AlertTriangle className={`w-5 h-5 ${sla.color}`} />
                ) : (
                  <Clock className={`w-5 h-5 ${sla.color}`} />
                )}
                <h3 className="font-semibold text-foreground text-sm">SLA Timer</h3>
              </div>
              <p className={`text-lg font-bold ${sla.color}`}>{sla.label}</p>
              <div className="mt-2 h-2 bg-background/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    sla.pct > 50 ? "bg-[hsl(var(--status-closed))]" :
                    sla.pct > 25 ? "bg-[hsl(var(--status-open))]" :
                    "bg-[hsl(var(--priority-high))]"
                  }`}
                  style={{ width: `${sla.pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">SLA: {SLA_HOURS} hours per ticket</p>
            </div>
          )}

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
          <button onClick={() => setStatusModal(false)} className="px-4 py-2 text-sm text-muted-foreground border border-input rounded-lg hover:bg-muted">Cancel</button>
          <button onClick={handleStatusChange} disabled={!selectedStatus || selectedStatus === ticket.status} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium">Apply</button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Ticket" maxWidth="sm">
        <p className="text-sm text-muted-foreground mb-5">
          This action is permanent. Are you sure you want to delete "{ticket.title}"?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-muted-foreground border border-input rounded-lg hover:bg-muted">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
