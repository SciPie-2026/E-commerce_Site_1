import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Sign In · AIDAH The Label | Gurugram" },
      {
        name: "description",
        content:
          "Sign in to your AIDAH atelier customer account to manage bespoke orders and saved addresses.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = useSearch({ from: "/login" });
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      const destination = redirect || "/account";
      window.location.href = destination;
    }
  }, [user, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
        rememberMe,
      });
      toast.success("Welcome back to AIDAH.");
      const destination = redirect || "/account";
      window.location.href = destination;
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your email and password.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="eyebrow text-gold">Atelier Portal</p>
          <h1 className="display-2 mt-2 text-3xl sm:text-4xl text-foreground font-serif">
            Sign In
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-cocoa leading-relaxed">
            Access your curated fashion archives, active couture fittings, and atelier privileges.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 rounded-2xl border border-rose/30 bg-rose/5 p-4 text-xs text-rose-deep leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs uppercase tracking-wider text-cocoa font-medium mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs uppercase tracking-wider text-cocoa font-medium"
                >
                  Password
                </label>
                <Link
                  to={"/forgot-password" as any}
                  className="text-xs text-gold hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground/60 hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-cocoa">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-gold focus:ring-gold"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Authenticating..." : "Sign In to Atelier"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Social login divider */}
          <div className="mt-8 relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-4 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              Or continue with
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => toast.info("Google OAuth is enabled in production deployment.")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-background py-2.5 px-4 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => toast.info("Apple Sign In is enabled in production deployment.")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-background py-2.5 px-4 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.82 1.11-1.96.99-3.1-.96.04-2.11.64-2.8 1.44-.61.71-1.14 1.87-1 2.99 1.07.08 2.15-.55 2.81-1.33z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-cocoa">
          New to AIDAH?{" "}
          <Link
            to="/register"
            search={redirect ? { redirect } : undefined}
            className="font-semibold text-gold hover:underline"
          >
            Create an Atelier Account
          </Link>
        </p>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[0.65rem] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-gold" />
          <span>256-Bit SSL Encrypted &amp; Token-Secured Sessions</span>
        </div>
      </div>
    </div>
  );
}
