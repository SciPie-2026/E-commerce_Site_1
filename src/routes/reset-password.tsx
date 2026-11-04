import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import { resetPasswordFn } from "@/lib/server/auth";
import { toast } from "sonner";
import { z } from "zod";

const resetSearchSchema = z.object({
  token: z.string().optional().default(""),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => resetSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Set New Password · AIDAH The Label" },
      { name: "description", content: "Establish a new password for your AIDAH Atelier account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = useSearch({ from: "/reset-password" });
  const navigate = useNavigate();

  const [inputToken, setInputToken] = useState(token || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!inputToken.trim()) {
      setErrorMsg("Reset token is required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPasswordFn({
        data: {
          token: inputToken.trim(),
          password,
          confirmPassword,
        },
      });
      setIsSuccess(true);
      toast.success("Password updated. All previous sessions revoked.");
    } catch (err: any) {
      setErrorMsg(err.message || "Reset link is invalid or expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <p className="eyebrow text-gold">Security Protocol</p>
          <h1 className="display-2 mt-2 text-3xl sm:text-4xl text-foreground font-serif">
            Set New Password
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-cocoa leading-relaxed">
            Choose a strong password with at least 8 characters, an uppercase letter, a number, and
            a symbol.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="font-serif text-xl text-foreground">Password Successfully Updated</h2>
              <p className="text-xs text-cocoa leading-relaxed">
                Your credentials have been securely re-hashed and all previous login sessions have
                been terminated.
              </p>
              <div className="pt-4">
                <Link
                  to={"/login" as any}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-all duration-300"
                >
                  Sign In with New Password <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-2xl border border-rose/30 bg-rose/5 p-4 text-xs text-rose-deep leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <div>
                <label
                  htmlFor="reset-token"
                  className="block text-xs uppercase tracking-wider text-cocoa font-medium mb-1.5"
                >
                  Reset Verification Token
                </label>
                <input
                  id="reset-token"
                  type="text"
                  required
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="32-byte hexadecimal token"
                  className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="reset-new-password"
                  className="block text-xs uppercase tracking-wider text-cocoa font-medium mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
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

              <div>
                <label
                  htmlFor="reset-confirm-new-password"
                  className="block text-xs uppercase tracking-wider text-cocoa font-medium mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="reset-confirm-new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update Password & Revoke Sessions"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[0.65rem] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-gold" />
          <span>Timing-Safe Cryptographic Signature Verification</span>
        </div>
      </div>
    </div>
  );
}
