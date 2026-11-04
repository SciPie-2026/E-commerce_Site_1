import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { validatePasswordPolicy } from "@/lib/auth/password";
import { sanitizeRedirectUrl } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/register")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Create Atelier Account · AIDAH The Label" },
      {
        name: "description",
        content:
          "Join AIDAH The Label to receive bespoke couture updates, early drop access, and streamlined ordering.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { redirect } = useSearch({ from: "/register" });
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      const destination = sanitizeRedirectUrl(redirect, "/account");
      window.location.href = destination;
    }
  }, [user, redirect]);

  // Dynamic password strength computation
  const passwordStatus = useMemo(() => {
    return validatePasswordPolicy(password);
  }, [password]);

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-rose", "bg-amber-500", "bg-blue-500", "bg-emerald-600"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!acceptTerms) {
      setErrorMsg("Please accept the terms and conditions to proceed.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!passwordStatus.valid) {
      setErrorMsg(passwordStatus.errors[0]);
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        confirmPassword,
        acceptTerms,
      });
      toast.success("Welcome to the AIDAH Atelier family!");
      const destination = sanitizeRedirectUrl(redirect, "/account");
      window.location.href = destination;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="eyebrow text-gold">Membership Privilege</p>
          <h1 className="display-2 mt-2 text-3xl sm:text-4xl text-foreground font-serif">
            Create Account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-cocoa leading-relaxed">
            Register to save measurements, receive invitations to private previews, and track
            bespoke orders.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 rounded-2xl border border-rose/30 bg-rose/5 p-4 text-xs text-rose-deep leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs uppercase tracking-wider text-cocoa font-medium mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aanya Sharma"
                  className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                />
                <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs uppercase tracking-wider text-cocoa font-medium mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs uppercase tracking-wider text-cocoa font-medium mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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

              {/* Dynamic Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[0.65rem]">
                    <span className="text-cocoa">Strength:</span>
                    <span className="font-semibold text-foreground">
                      {strengthLabels[Math.max(0, passwordStatus.score - 1)] || "Too Weak"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all duration-300 ${
                          step < passwordStatus.score
                            ? strengthColors[passwordStatus.score - 1] || "bg-rose"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements checklist */}
                  <div className="grid grid-cols-2 gap-1 text-[0.65rem] text-cocoa pt-1">
                    <span className="flex items-center gap-1">
                      {password.length >= 8 ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground/60" />
                      )}
                      8+ characters
                    </span>
                    <span className="flex items-center gap-1">
                      {/[A-Z]/.test(password) ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground/60" />
                      )}
                      Uppercase letter
                    </span>
                    <span className="flex items-center gap-1">
                      {/[0-9]/.test(password) ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground/60" />
                      )}
                      Number
                    </span>
                    <span className="flex items-center gap-1">
                      {/[^A-Za-z0-9]/.test(password) ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground/60" />
                      )}
                      Special character
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block text-xs uppercase tracking-wider text-cocoa font-medium mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-cocoa leading-relaxed">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-border text-gold focus:ring-gold"
                />
                <span>
                  I accept the{" "}
                  <Link to="/terms" className="text-gold underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-gold underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Creating Membership..." : "Complete Registration"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-cocoa">
          Already an Atelier member?{" "}
          <Link
            to="/login"
            search={redirect ? { redirect } : undefined}
            className="font-semibold text-gold hover:underline"
          >
            Sign In here
          </Link>
        </p>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[0.65rem] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-gold" />
          <span>Argon2 / Bcrypt Encrypted Credentials · Zero Plaintext Storage</span>
        </div>
      </div>
    </div>
  );
}
