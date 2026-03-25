// ============================================================
// Login Page — glassmorphism card over IT workspace background
// ============================================================
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Headphones, Eye, EyeOff, AlertCircle, LogIn, Mail, Lock, Shield,
} from "lucide-react";
import loginBg from "@/assets/login-bg.jpg";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      const result = login(form.email, form.password);
      if (result.success) navigate("/dashboard");
      else setApiError(result.message);
      setLoading(false);
    }, 800);
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const fillDemo = (role: "admin" | "agent" | "user") => {
    const creds = {
      admin: "admin@helpdesk.com",
      agent: "agent@helpdesk.com",
      user:  "user@helpdesk.com",
    };
    setForm({ email: creds[role], password: `${role}123` });
    setErrors({});
    setApiError("");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Full-screen background ── */}
      <img
        src={loginBg}
        alt="IT workspace background"
        className="absolute inset-0 w-full h-full object-cover object-center"
        width={1920}
        height={1080}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65 backdrop-brightness-75" />

      {/* Subtle grid overlay for tech feel */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(221 83% 53%) 1px, transparent 1px), linear-gradient(90deg, hsl(221 83% 53%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Floating card ── */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-[fadeSlideUp_0.5s_ease-out]">
        {/* Glassmorphism card */}
        <div
          className="rounded-2xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden"
          style={{
            background: "rgba(10, 18, 40, 0.72)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[hsl(var(--primary))] via-cyan-400 to-[hsl(var(--primary))]" />

          <div className="px-8 pt-8 pb-10">
            {/* Brand header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-[0_0_20px_hsl(221_83%_53%/0.5)]">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">IT Helpdesk</h1>
                <p className="text-white/40 text-xs">Smart Support Platform</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">Secure</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-white/50 text-sm mb-7">Sign in to manage your support tickets</p>

            {/* API error */}
            {apiError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-5 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-white/70">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@company.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all
                      border bg-white/5
                      focus:bg-white/8 focus:ring-2 focus:ring-[hsl(var(--primary))/50]
                      ${errors.email
                        ? "border-red-500/50 focus:ring-red-500/30"
                        : "border-white/10 focus:border-[hsl(var(--primary))/60]"
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-white/70">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all
                      border bg-white/5
                      focus:bg-white/8 focus:ring-2 focus:ring-[hsl(var(--primary))/50]
                      ${errors.password
                        ? "border-red-500/50 focus:ring-red-500/30"
                        : "border-white/10 focus:border-[hsl(var(--primary))/60]"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.password}
                  </p>
                )}
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => setRememberMe((v) => !v)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer
                      ${rememberMe
                        ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]"
                        : "bg-white/5 border-white/20 hover:border-white/40"
                      }`}
                  >
                    {rememberMe && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-[hsl(var(--primary))] hover:text-cyan-400 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-semibold text-white transition-all
                  bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(221_83%_43%)]
                  hover:shadow-[0_0_24px_hsl(221_83%_53%/0.5)] hover:-translate-y-0.5 active:translate-y-0
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-white/40">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[hsl(var(--primary))] font-semibold hover:text-cyan-400 transition-colors"
              >
                Create account
              </Link>
            </p>

            {/* Demo credentials */}
            <div className="mt-6 p-4 rounded-xl border border-white/8 bg-white/3">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-3.5 h-3.5 text-white/30" />
                <p className="text-xs font-medium text-white/30">Quick demo access</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["admin", "agent", "user"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => fillDemo(r)}
                    className="text-xs py-2 px-3 rounded-lg border border-white/10 bg-white/5
                      text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20
                      capitalize transition-all font-medium"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-white/25 text-xs mt-5">
          © 2025 Smart IT Helpdesk · Secure · Reliable
        </p>
      </div>
    </div>
  );
}
