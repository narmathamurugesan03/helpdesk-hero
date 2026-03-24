// ============================================================
// CreateTicket Page — form with validation + file upload
// ============================================================
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/contexts/TicketContext";
import type { TicketCategory, TicketPriority } from "@/types";
import { CheckCircle2, PlusCircle, Upload, X, ArrowLeft } from "lucide-react";

const CATEGORIES: TicketCategory[] = ["Network", "Hardware", "Software", "Security", "Account Access", "Other"];
const PRIORITIES: TicketPriority[]  = ["Low", "Medium", "High"];

const priorityColors: Record<TicketPriority, string> = {
  Low: "border-[hsl(var(--priority-low))] bg-[hsl(var(--priority-low-bg))] text-[hsl(var(--priority-low))]",
  Medium: "border-[hsl(var(--priority-medium))] bg-[hsl(var(--priority-medium-bg))] text-[hsl(var(--priority-medium))]",
  High: "border-[hsl(var(--priority-high))] bg-[hsl(var(--priority-high-bg))] text-[hsl(var(--priority-high))]",
};

export default function CreateTicketPage() {
  const { currentUser } = useAuth();
  const { addTicket } = useTickets();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "" as TicketCategory | "",
    priority: "" as TicketPriority | "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim())      errs.title = "Title is required.";
    else if (form.title.length < 5) errs.title = "Title must be at least 5 characters.";
    if (!form.description.trim()) errs.description = "Description is required.";
    else if (form.description.length < 10) errs.description = "Please provide more detail (min 10 characters).";
    if (!form.category)           errs.category = "Please select a category.";
    if (!form.priority)           errs.priority = "Please select a priority.";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    setTimeout(() => {
      addTicket({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category as TicketCategory,
        priority: form.priority as TicketPriority,
        status: "Open",
        createdById: currentUser!.id,
        createdByName: currentUser!.name,
        attachments: files.map((f) => f.name),
      });
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  // Success screen
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6 animate-fade-in">
        <div className="bg-card rounded-2xl border border-border shadow-card p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--status-closed-bg))] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[hsl(var(--status-closed))]" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Ticket Submitted!</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Your ticket has been created and our support team will be in touch shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setSubmitted(false); setForm({ title: "", description: "", category: "", priority: "" }); setFiles([]); }}
              className="px-5 py-2.5 text-sm border border-input text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Create Another
            </button>
            <button
              onClick={() => navigate("/tickets")}
              className="px-5 py-2.5 text-sm bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium"
            >
              View All Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      {/* Back link */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Create New Ticket</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Describe your issue and we'll get it resolved.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); if (errors.title) setErrors((er) => ({ ...er, title: "" })); }}
              placeholder="Brief summary of the issue"
              className={`w-full px-3.5 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${errors.title ? "border-destructive" : "border-input focus:border-primary"}`}
            />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => { setForm((f) => ({ ...f, description: e.target.value })); if (errors.description) setErrors((er) => ({ ...er, description: "" })); }}
              placeholder="Describe the issue in detail — steps to reproduce, error messages, etc."
              rows={5}
              className={`w-full px-3.5 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 resize-none ${errors.description ? "border-destructive" : "border-input focus:border-primary"}`}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? <p className="text-xs text-destructive">{errors.description}</p> : <span />}
              <span className="text-xs text-muted-foreground">{form.description.length} chars</span>
            </div>
          </div>

          {/* Category + Priority row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => { setForm((f) => ({ ...f, category: e.target.value as TicketCategory })); if (errors.category) setErrors((er) => ({ ...er, category: "" })); }}
                className={`w-full px-3.5 py-2.5 rounded-lg border bg-background text-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 cursor-pointer ${errors.category ? "border-destructive" : "border-input focus:border-primary"}`}
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Priority <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setForm((f) => ({ ...f, priority: p })); if (errors.priority) setErrors((er) => ({ ...er, priority: "" })); }}
                    className={`flex-1 py-2.5 text-xs font-medium rounded-lg border transition-all ${
                      form.priority === p ? priorityColors[p] + " border-2" : "border-input text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {errors.priority && <p className="mt-1 text-xs text-destructive">{errors.priority}</p>}
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Attachments (optional)</label>
            <label className="flex flex-col items-center justify-center gap-2 w-full p-5 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-colors group">
              <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Click to upload files
              </span>
              <span className="text-xs text-muted-foreground">PNG, JPG, PDF, DOCX (max 10MB each)</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const added = Array.from(e.target.files ?? []);
                  setFiles((prev) => [...prev, ...added]);
                }}
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg text-sm">
                    <span className="truncate text-foreground">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="ml-2 text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm border border-input text-foreground rounded-lg hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-primary-foreground font-medium text-sm rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              {loading ? "Submitting…" : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
