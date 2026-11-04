import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Lock, Mail, Eye, EyeOff, ShieldAlert, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Atelier Executive Entrance · AIDAH Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate({ to: "/admin" });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const loggedInUser = await login({
        email,
        password,
        rememberMe: true,
      });

      if (loggedInUser.role !== "ADMIN") {
        await logout();
        setErrorMsg("Access Denied: Administrative privileges required.");
        return;
      }

      toast.success("Welcome, Atelier Administrator.");
      navigate({ to: "/admin" });
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid administrative credentials or insufficient privileges.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#110f10] text-[#fbf7f2] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Seal Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/40 mb-4 shadow-lg shadow-gold/10">
            <ShieldCheck className="h-7 w-7 text-gold" strokeWidth={1.5} />
          </div>
          <p className="text-[0.65rem] font-bold tracking-[0.3em] uppercase text-gold">
            Restricted Enterprise Access
          </p>
          <h1 className="font-serif text-3xl mt-2 tracking-wide text-ivory">
            AIDAH Administration
          </h1>
          <p className="mt-2 text-xs text-muted-foreground/80">
            Administrative operations, catalog curation, and real-time order fulfillment pipeline.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#2e2629] bg-[#1a1618] p-8 shadow-2xl backdrop-blur-md">
          {errorMsg && (
            <div className="mb-6 rounded-2xl border border-rose/40 bg-rose/10 p-4 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5"
              >
                Admin Email
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aidah.com"
                  className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-3 pl-10 text-sm text-ivory placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/50" />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5"
              >
                Security Passphrase
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-3 pl-10 pr-10 text-sm text-ivory placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/50" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground/50 hover:text-ivory"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3.5 text-xs uppercase tracking-wider text-charcoal font-semibold hover:bg-gold-soft transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Verifying Credentials..." : "Authenticate Administrator"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 border-t border-[#2e2629] pt-6 text-center text-[0.65rem] text-muted-foreground/60 leading-relaxed">
            Unauthorized access attempts are logged with client IP address and timestamped into the
            persistent security audit trail.
          </div>
        </div>
      </div>
    </div>
  );
}
