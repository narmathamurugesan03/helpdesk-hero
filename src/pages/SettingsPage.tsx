// ============================================================
// Settings Page — tabbed panel with 5 sections
// ============================================================
import React, { useState, useRef } from "react";
import {
  Settings, Globe, Ticket, Bell, Shield, Palette,
  Upload, Check, AlertCircle, ChevronDown, X, Image,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// ── Toggle Switch component ──────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${checked ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]" : "bg-input"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
    {label && (
      <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors select-none">{label}</span>
    )}
  </label>
);

// ── Section card ─────────────────────────────────────────────
const Section: React.FC<{ title: string; description: string; icon: React.ElementType; children: React.ReactNode }> = ({
  title, description, icon: Icon, children,
}) => (
  <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
    <div className="flex items-start gap-4 px-6 py-5 border-b border-border bg-muted/20">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
    <div className="px-6 py-5 space-y-5">{children}</div>
  </div>
);

// ── Form row ──────────────────────────────────────────────────
const FormRow: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
    <div className="sm:w-52 flex-shrink-0 pt-0.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

// ── Themed input ─────────────────────────────────────────────
const FieldInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm
      placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${props.className ?? ""}`}
  />
);

const FieldSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <div className="relative">
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 pr-9 rounded-xl border border-input bg-background text-foreground text-sm
        focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all appearance-none ${props.className ?? ""}`}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
  </div>
);

// ── Tab definitions ───────────────────────────────────────────
const TABS = [
  { id: "general",      label: "General",      icon: Globe   },
  { id: "tickets",      label: "Tickets",      icon: Ticket  },
  { id: "notifications",label: "Notifications",icon: Bell    },
  { id: "security",     label: "Security",     icon: Shield  },
  { id: "appearance",   label: "Appearance",   icon: Palette },
] as const;

type TabId = typeof TABS[number]["id"];

// ══════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("general");
  const [saved, setSaved] = useState(false);

  // General settings
  const [systemName, setSystemName]     = useState("Smart IT Helpdesk");
  const [language, setLanguage]         = useState("en");

  // Ticket settings
  const [defaultStatus]                 = useState("Open");
  const [priorities, setPriorities]     = useState({ Low: true, Medium: true, High: true });
  const [categories, setCategories]     = useState({
    Hardware: true, Software: true, Network: true, Security: true, "Account Access": true,
  });
  const [autoAssign, setAutoAssign]     = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif]     = useState(true);
  const [notifCreated, setNotifCreated] = useState(true);
  const [notifUpdated, setNotifUpdated] = useState(true);
  const [notifClosed, setNotifClosed]   = useState(false);

  // Security
  const [minPwdLen, setMinPwdLen]       = useState(8);
  const [allowReg, setAllowReg]         = useState(true);
  const [rbac, setRbac]                 = useState(true);

  // Appearance
  const [darkMode, setDarkMode]         = useState(false);
  const [themeColor, setThemeColor]     = useState("#3b82f6");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your helpdesk system preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
            ${saved
              ? "bg-emerald-500 text-white shadow-[0_4px_14px_hsl(142_71%_45%/0.4)]"
              : "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-dark))] hover:shadow-[0_4px_14px_hsl(var(--primary)/0.4)]"
            }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-2xl overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
              ${tab === id
                ? "bg-card text-foreground shadow-[var(--shadow-card)]"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── GENERAL ── */}
      {tab === "general" && (
        <Section title="General Settings" description="Basic configuration for your helpdesk system" icon={Globe}>
          <FormRow label="System Name" hint="Displayed in the header and emails">
            <FieldInput value={systemName} onChange={(e) => setSystemName(e.target.value)} />
          </FormRow>
          <div className="border-t border-border" />
          <FormRow label="Logo Upload" hint="PNG or SVG, max 2 MB">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dashed border-border bg-muted/30
                hover:bg-muted/60 hover:border-primary/50 transition-all text-sm text-muted-foreground hover:text-foreground">
                <Upload className="w-4 h-4" />
                Choose file…
              </div>
              <input type="file" accept="image/*" className="hidden" />
              <span className="text-xs text-muted-foreground">No file chosen</span>
            </label>
          </FormRow>
          <div className="border-t border-border" />
          <FormRow label="Default Language" hint="Interface language for all users">
            <FieldSelect value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="es">Spanish</option>
              <option value="ar">Arabic</option>
            </FieldSelect>
          </FormRow>
        </Section>
      )}

      {/* ── TICKETS ── */}
      {tab === "tickets" && (
        <div className="space-y-5">
          <Section title="Ticket Settings" description="Control how tickets are created and assigned" icon={Ticket}>
            <FormRow label="Default Status" hint="Status assigned when a ticket is created">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground w-fit">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {defaultStatus}
                <span className="ml-2 text-xs text-muted-foreground/60">(fixed)</span>
              </div>
            </FormRow>
            <div className="border-t border-border" />
            <FormRow label="Auto-Assign Tickets" hint="Automatically assign new tickets to available agents">
              <Toggle checked={autoAssign} onChange={setAutoAssign} label={autoAssign ? "Enabled" : "Disabled"} />
            </FormRow>
          </Section>

          <Section title="Priority Levels" description="Enable or disable ticket priorities" icon={AlertCircle}>
            {(Object.keys(priorities) as (keyof typeof priorities)[]).map((p) => (
              <FormRow key={p} label={p} hint={`Allow tickets to be marked as ${p.toLowerCase()} priority`}>
                <Toggle
                  checked={priorities[p]}
                  onChange={(v) => setPriorities((prev) => ({ ...prev, [p]: v }))}
                  label={priorities[p] ? "Active" : "Disabled"}
                />
              </FormRow>
            ))}
          </Section>

          <Section title="Ticket Categories" description="Choose which categories are available" icon={Ticket}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(categories) as (keyof typeof categories)[]).map((cat) => (
                <div key={cat} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
                  <span className="text-sm font-medium text-foreground">{cat}</span>
                  <Toggle
                    checked={categories[cat]}
                    onChange={(v) => setCategories((prev) => ({ ...prev, [cat]: v }))}
                  />
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab === "notifications" && (
        <Section title="Notification Settings" description="Configure when and how notifications are sent" icon={Bell}>
          <FormRow label="Email Notifications" hint="Master toggle for all email alerts">
            <Toggle checked={emailNotif} onChange={setEmailNotif} label={emailNotif ? "Enabled" : "Disabled"} />
          </FormRow>
          <div className="border-t border-border" />
          <div className={`space-y-5 transition-opacity ${emailNotif ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notify on…</p>
            {[
              { label: "Ticket Created",  hint: "Send email when a new ticket is submitted",  value: notifCreated, set: setNotifCreated },
              { label: "Ticket Updated",  hint: "Send email when a ticket status changes",     value: notifUpdated, set: setNotifUpdated },
              { label: "Ticket Closed",   hint: "Send email when a ticket is resolved",        value: notifClosed,  set: setNotifClosed  },
            ].map(({ label, hint, value, set }) => (
              <FormRow key={label} label={label} hint={hint}>
                <Toggle checked={value} onChange={set} label={value ? "On" : "Off"} />
              </FormRow>
            ))}
          </div>
        </Section>
      )}

      {/* ── SECURITY ── */}
      {tab === "security" && (
        <Section title="Security Settings" description="Manage authentication rules and access control" icon={Shield}>
          <FormRow label="Min. Password Length" hint="Minimum characters required for all passwords">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={6}
                max={20}
                value={minPwdLen}
                onChange={(e) => setMinPwdLen(Number(e.target.value))}
                className="flex-1 accent-[hsl(var(--primary))]"
              />
              <span className="w-10 text-center text-sm font-bold text-foreground bg-primary/10 rounded-lg py-1 border border-primary/20">
                {minPwdLen}
              </span>
            </div>
          </FormRow>
          <div className="border-t border-border" />
          <FormRow label="User Registration" hint="Allow new users to self-register">
            <Toggle checked={allowReg} onChange={setAllowReg} label={allowReg ? "Open" : "Invite Only"} />
          </FormRow>
          <div className="border-t border-border" />
          <FormRow label="Role-Based Access" hint="Restrict features based on user role">
            <Toggle checked={rbac} onChange={setRbac} label={rbac ? "Enforced" : "Disabled"} />
          </FormRow>
          {!rbac && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Disabling RBAC grants all users equal access. This is not recommended for production.
            </div>
          )}
        </Section>
      )}

      {/* ── APPEARANCE ── */}
      {tab === "appearance" && (
        <Section title="Appearance" description="Customise the visual look of your helpdesk" icon={Palette}>
          <FormRow label="Dark Mode" hint="Toggle between light and dark interface">
            <Toggle checked={darkMode} onChange={setDarkMode} label={darkMode ? "Dark" : "Light"} />
          </FormRow>
          <div className="border-t border-border" />
          <FormRow label="Theme Color" hint="Primary accent color used across the UI">
            <div className="flex items-center gap-3 flex-wrap">
              {["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"].map((c) => (
                <button
                  key={c}
                  onClick={() => setThemeColor(c)}
                  style={{ background: c }}
                  className={`w-9 h-9 rounded-xl transition-all hover:scale-110 ${
                    themeColor === c
                      ? "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110"
                      : "ring-1 ring-transparent"
                  }`}
                />
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-muted-foreground">Custom:</span>
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-border cursor-pointer p-0.5 bg-background"
                />
              </label>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-5 h-5 rounded-md" style={{ background: themeColor }} />
              <span className="text-sm text-muted-foreground font-mono">{themeColor}</span>
            </div>
          </FormRow>
        </Section>
      )}
    </div>
  );
}
