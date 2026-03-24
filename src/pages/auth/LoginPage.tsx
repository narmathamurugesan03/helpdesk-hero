// ============================================================
// Login Page — email + password with full validation
// ============================================================
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Headphones, Eye, EyeOff, AlertCircle, LogIn } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /** Client-side validation */
  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    // Simulate async call
    setTimeout(() => {
      const result = login(form.email, form.password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setApiError(result.message);
      }
      setLoading(false);
    }, 500);
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Demo credentials helper
  const fillDemo = (role: "admin" | "agent" | "user") => {
    const creds = { admin: "admin@helpdesk.com", agent: "agent@helpdesk.com", user: "user@helpdesk.com" };
    setForm({ email: creds[role], password: `${role}123` });
    setErrors({});
    setApiError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 stat-card-primary flex-col items-center justify-center p-12 text-primary-foreground">
        <div className="max-w-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto">
            <Headphones className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Smart IT Helpdesk</h1>
          <p className="text-primary-foreground/80 leading-relaxed">
            Streamline your IT support requests with our modern ticketing system. Fast, organised, and easy to use.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[["500+", "Tickets Resolved"], ["3", "User Roles"], ["24/7", "Support"]].map(([val, label]) => (
              <div key={label} className="bg-white/10 rounded-xl p-3">
                <p className="text-xl font-bold">{val}</p>
                <p className="text-xs text-primary-foreground/70 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Headphones className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg">IT Helpdesk</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your helpdesk account</p>

          {/* API error */}
          {apiError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-5 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@company.com"
                className={`w-full px-3.5 py-2.5 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${
                  errors.email ? "border-destructive" : "border-input focus:border-primary"
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${
                    errors.password ? "border-destructive" : "border-input focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-dark text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create account
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-muted rounded-xl">
            <p className="text-xs font-medium text-muted-foreground mb-2">Quick demo logins:</p>
            <div className="flex flex-wrap gap-2">
              {(["admin", "agent", "user"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => fillDemo(r)}
                  className="text-xs px-3 py-1.5 bg-card border border-border rounded-lg text-foreground hover:bg-secondary capitalize transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
