import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { forgotPasswordFn } from "@/lib/server/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password · AIDAH The Label" },
      {
        name: "description",
        content: "Request a secure password reset link for your AIDAH Atelier account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [devResetToken, setDevResetToken] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await forgotPasswordFn({ data: { email } });
      setIsSubmitted(true);
      if (res.devResetToken) {
        setDevResetToken(res.devResetToken);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <p className="eyebrow text-gold">Security Recovery</p>
          <h1 className="display-2 mt-2 text-3xl sm:text-4xl text-foreground font-serif">
            Forgot Password
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-cocoa leading-relaxed">
            Enter your account email to receive a cryptographically verified 15-minute reset link.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="font-serif text-xl text-foreground">Reset Instructions Dispatched</h2>
              <p className="text-xs text-cocoa leading-relaxed">
                If an account exists for{" "}
                <span className="font-semibold text-foreground">{email}</span>, a secure reset token
                has been generated.
              </p>

              {devResetToken && (
                <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/5 p-4 text-left">
                  <p className="text-[0.65rem] font-bold text-gold uppercase tracking-wider mb-1">
                    Development Sandbox Simulation Link:
                  </p>
                  <Link
                    to={"/reset-password" as any}
                    search={{ token: devResetToken }}
                    className="text-xs text-rose-deep font-mono underline break-all"
                  >
                    Click to proceed with token: {devResetToken.substring(0, 16)}...
                  </Link>
                </div>
              )}

              <div className="pt-4">
                <Link
                  to={"/login" as any}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gold hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="rounded-2xl border border-rose/30 bg-rose/5 p-4 text-xs text-rose-deep">
                  {errorMsg}
                </div>
              )}

              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs uppercase tracking-wider text-cocoa font-medium mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="forgot-email"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? "Generating Token..." : "Dispatch Reset Link"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <Link
                  to={"/login" as any}
                  className="inline-flex items-center gap-1.5 text-xs text-cocoa hover:text-gold transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
