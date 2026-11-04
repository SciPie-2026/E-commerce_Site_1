import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Check,
  Lock,
  MapPin,
  X,
  User,
  UserPlus,
  Mail,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatINR } from "@/lib/format";
import { validatePromoCodeFn } from "@/lib/server/checkout";
import { getUserAddressesFn } from "@/lib/server/auth";
import { useRazorpay } from "@/hooks/useRazorpay";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Bag — AIDAH The Label" },
      {
        name: "description",
        content: "Review your selected handcrafted designer wear and proceed to boutique checkout.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, remove, setQty, clear } = useCart();
  const { user, login, register } = useAuth();

  const getLineKey = (l: any) => l.key ?? l.id ?? `${l.productId ?? ""}|${l.size ?? ""}|${l.color ?? ""}`;
  const getLineSlug = (l: any) => l.slug ?? l.product?.slug ?? "";
  const getLineName = (l: any) => l.name ?? l.product?.name ?? "Designer Piece";
  const getLineImage = (l: any) => l.image ?? l.product?.images?.[0] ?? "";
  const getLinePrice = (l: any) => l.price ?? l.product?.price ?? 0;
  const getLineColor = (l: any) => (typeof l.color === "object" ? l.color?.name : l.color) ?? "";

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Customer Checkout Modals & Auth State
  const [showAuthPromptModal, setShowAuthPromptModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);

  // Auth Modal Tab: "login" or "register"
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  // Quick Sign In Modal State
  const [quickEmail, setQuickEmail] = useState("");
  const [quickPassword, setQuickPassword] = useState("");
  const [showQuickPassword, setShowQuickPassword] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [quickLoginError, setQuickLoginError] = useState("");

  // Quick Register Modal State
  const [quickRegName, setQuickRegName] = useState("");
  const [quickRegEmail, setQuickRegEmail] = useState("");
  const [quickRegPassword, setQuickRegPassword] = useState("");
  const [showQuickRegPassword, setShowQuickRegPassword] = useState(false);
  const [quickRegLoading, setQuickRegLoading] = useState(false);
  const [quickRegError, setQuickRegError] = useState("");

  // Delivery & Fitting Customer Form
  const [custName, setCustName] = useState(user?.name || "");
  const [custEmail, setCustEmail] = useState(user?.email || "");
  const [custPhone, setCustPhone] = useState(user?.phone || "");
  const [custStreet, setCustStreet] = useState("");
  const [custCity, setCustCity] = useState("");
  const [custState, setCustState] = useState("Haryana");
  const [custPostal, setCustPostal] = useState("");

  // Synchronize profile data and fetch saved address for logged-in users
  useEffect(() => {
    if (user) {
      if (user.name) setCustName(user.name);
      if (user.email) setCustEmail(user.email);
      if (user.phone) setCustPhone(user.phone);

      getUserAddressesFn()
        .then((res) => {
          if (res?.addresses && res.addresses.length > 0) {
            const def = res.addresses.find((a: any) => a.isDefault) || res.addresses[0];
            if (def) {
              if (def.street) setCustStreet(def.street);
              if (def.city) setCustCity(def.city);
              if (def.state) setCustState(def.state);
              if (def.postalCode) setCustPostal(def.postalCode);
              if (def.phone && !user.phone) setCustPhone(def.phone);
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const { processCheckout, isLoading: checkoutLoading } = useRazorpay({
    onSuccess: (orderNumber) => {
      setConfirmedOrderNumber(orderNumber);
      setOrderComplete(true);
      setShowCheckoutModal(false);
      clear();
    },
    onFailure: (err) => {
      toast.error(err || "Payment could not be completed.");
    },
  });

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    if (!promoCode.trim()) return;

    try {
      const res = await validatePromoCodeFn({
        data: {
          code: promoCode.trim().toUpperCase(),
          cartSubtotalPaise: subtotal * 100,
        },
      });
      const discInRupees = Math.round(res.discountPaise / 100);
      setDiscount(discInRupees);
      setPromoSuccess(res.message);
    } catch (err: any) {
      setPromoError(err.message || "Invalid or inapplicable privilege code.");
      setDiscount(0);
    }
  };

  const shippingThreshold = 5000;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingFee = isFreeShipping || lines.length === 0 ? 0 : 350;
  const finalTotal = Math.max(0, subtotal - discount + shippingFee);

  const handleStartCheckout = () => {
    if (lines.length === 0) return;
    // Prompt login/registration if user is not authenticated and hasn't explicitly chosen guest mode
    if (!user && !isGuestCheckout) {
      setShowAuthPromptModal(true);
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickLoginError("");
    setQuickLoginLoading(true);

    try {
      await login({
        email: quickEmail,
        password: quickPassword,
        rememberMe: true,
      });
      toast.success("Welcome back to AIDAH Atelier!");
      setShowAuthPromptModal(false);
      setShowCheckoutModal(true);
    } catch (err: any) {
      setQuickLoginError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickRegError("");

    if (!quickRegName.trim() || quickRegName.trim().length < 2) {
      setQuickRegError("Please enter your full name.");
      return;
    }
    if (!quickRegEmail.trim() || !quickRegEmail.includes("@")) {
      setQuickRegError("Please enter a valid email address.");
      return;
    }
    if (!quickRegPassword || quickRegPassword.length < 8) {
      setQuickRegError("Password must be at least 8 characters with upper, lower, number & symbol.");
      return;
    }

    setQuickRegLoading(true);

    try {
      await register({
        name: quickRegName.trim(),
        email: quickRegEmail.trim(),
        password: quickRegPassword,
        confirmPassword: quickRegPassword,
        acceptTerms: true,
      });
      toast.success("Welcome to AIDAH! Your account is ready.");
      setCustName(quickRegName.trim());
      setCustEmail(quickRegEmail.trim());
      setShowAuthPromptModal(false);
      setShowCheckoutModal(true);
    } catch (err: any) {
      setQuickRegError(err.message || "Could not create account. Please verify your details.");
    } finally {
      setQuickRegLoading(false);
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side address validation to provide instant feedback
    if (!custName.trim() || custName.trim().length < 2) {
      toast.error("Please provide your full name (at least 2 characters).");
      return;
    }
    if (!custEmail.trim() || !custEmail.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }
    if (!custPhone.trim() || custPhone.trim().length < 8) {
      toast.error("Please provide a valid contact phone number.");
      return;
    }
    if (!custStreet.trim() || custStreet.trim().length < 5) {
      toast.error("Please provide a complete shipping address (at least 5 characters).");
      return;
    }
    if (!custCity.trim() || custCity.trim().length < 2) {
      toast.error("Please enter your city.");
      return;
    }
    if (!custState.trim() || custState.trim().length < 2) {
      toast.error("Please enter your State / Province.");
      return;
    }
    if (!custPostal.trim() || custPostal.trim().length < 3) {
      toast.error("Please enter your postal / PIN code.");
      return;
    }

    const items = lines.map((line) => ({
      productSlug: getLineSlug(line),
      productTitle: getLineName(line),
      size: line.size || "Free Size",
      color: getLineColor(line) || undefined,
      unitPrice: getLinePrice(line) * 100, // In paise
      quantity: line.qty,
    }));

    await processCheckout({
      customer: {
        name: custName.trim(),
        email: custEmail.trim(),
        phone: custPhone.trim(),
        street: custStreet.trim(),
        city: custCity.trim(),
        state: custState.trim(),
        postalCode: custPostal.trim(),
      },
      items,
      promoCode: discount > 0 ? promoCode : undefined,
    });
  };

  if (orderComplete) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft/30 text-gold mb-6 shadow-sm">
          <Check className="h-8 w-8 text-gold" />
        </div>
        <p className="eyebrow text-gold">Order Confirmed</p>
        <h1 className="display-2 mt-2 text-3xl sm:text-4xl">Thank You for Your Order</h1>
        {confirmedOrderNumber && (
          <p className="font-mono text-sm font-bold text-gold mt-2 bg-gold/10 inline-block px-4 py-1.5 rounded-full border border-gold/30">
            Order Reference: {confirmedOrderNumber}
          </p>
        )}
        <p className="mt-4 text-sm text-cocoa leading-relaxed max-w-lg mx-auto">
          Your bespoke piece has been reserved at our Gurugram atelier. Our concierge team will
          reach out via WhatsApp/Email with your tracking timeline and fitting details.
        </p>
        <div className="mt-8 rounded-2xl border border-gold/30 bg-cream/60 p-6 text-xs text-cocoa">
          <p className="font-semibold text-foreground">Aidah Designer House &amp; Boutique</p>
          <p className="mt-1">Baani City Centre, Sector 63, Gurugram, Haryana</p>
          <p className="mt-1">Concierge: concierge@aidah.in</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {user ? (
            <Link
              to="/account"
              className="inline-flex items-center gap-2 rounded-full border border-charcoal bg-transparent px-8 py-3.5 text-xs uppercase tracking-wider text-charcoal hover:bg-secondary transition-colors"
            >
              Track in My Account
            </Link>
          ) : (
            <Link
              to="/register"
              search={{ redirect: "/account" }}
              className="inline-flex items-center gap-2 rounded-full border border-gold bg-gold/10 px-8 py-3.5 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-ivory transition-colors"
            >
              Create Account to Track Order
            </Link>
          )}
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors"
          >
            Return to Boutique <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="eyebrow text-gold">Your Selections</p>
        <h1 className="display-2 mt-2 text-3xl sm:text-4xl text-foreground font-serif">
          Shopping Bag
        </h1>
      </div>

      {!mounted || lines.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center bg-card">
          <ShoppingBag
            className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4"
            strokeWidth={1}
          />
          <h2 className="font-display text-2xl font-serif">Your bag is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Discover our hand-finished lehengas, pure linen sets, and occasion dresses tailored at
            Baani City Centre.
          </p>
          <div className="mt-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors"
            >
              Explore Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Items list */}
          <div className="lg:col-span-8 space-y-6">
            <div className="divide-y divide-border rounded-3xl border border-border bg-card p-6 shadow-sm">
              {lines.map((line) => {
                const itemKey = getLineKey(line);
                const itemSlug = getLineSlug(line);
                const itemName = getLineName(line);
                const itemImage = getLineImage(line);
                const itemPrice = getLinePrice(line);
                const itemColor = getLineColor(line);

                return (
                  <div key={itemKey} className="flex gap-4 sm:gap-6 py-6 first:pt-0 last:pb-0">
                    <Link
                      to={"/product/$slug" as any}
                      params={{ slug: itemSlug } as any}
                      className="shrink-0"
                    >
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="h-28 w-20 sm:h-36 sm:w-28 rounded-2xl object-cover ring-1 ring-gold/20"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            to={"/product/$slug" as any}
                            params={{ slug: itemSlug } as any}
                            className="font-serif text-base sm:text-lg hover:text-rose-deep transition-colors"
                          >
                            {itemName}
                          </Link>
                          <button
                            onClick={() => remove(itemKey)}
                            className="text-muted-foreground/60 hover:text-rose transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cocoa">
                          {line.size && <span>Size: {line.size}</span>}
                          {itemColor && <span>Color: {itemColor}</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        {/* Qty selector */}
                        <div className="flex items-center border border-border rounded-full px-2 py-0.5">
                          <button
                            onClick={() => setQty(itemKey, line.qty - 1)}
                            className="px-2 text-cocoa hover:text-foreground text-sm"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold">{line.qty}</span>
                          <button
                            onClick={() => setQty(itemKey, line.qty + 1)}
                            className="px-2 text-cocoa hover:text-foreground text-sm"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-serif text-sm sm:text-base font-semibold text-foreground">
                          {formatINR(itemPrice * line.qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-cocoa hover:text-gold transition-colors font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Continue Browsing Boutique
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm sticky top-24">
              <h2 className="font-serif text-xl text-foreground mb-4">Order Summary</h2>

              {/* Promo code */}
              <form onSubmit={applyPromo} className="mb-6">
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Privilege code (e.g. AIDAH10)"
                    className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-gold"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground hover:bg-gold-soft/30 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="mt-1.5 text-xs text-rose-deep">{promoError}</p>}
                {promoSuccess && <p className="mt-1.5 text-xs text-emerald-700">{promoSuccess}</p>}
              </form>

              {/* Price rows */}
              <div className="space-y-3 text-xs border-t border-border pt-4">
                <div className="flex justify-between text-cocoa">
                  <span>Bag Subtotal</span>
                  <span className="font-medium text-foreground">{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-deep font-medium">
                    <span>Privilege Savings</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-cocoa">
                  <span>Boutique Express Delivery</span>
                  <span>{isFreeShipping ? "FREE (Complimentary)" : formatINR(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-cocoa">
                  <span>Atelier Taxes &amp; Duties</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-foreground border-t border-border pt-4">
                  <span className="font-serif">Grand Total</span>
                  <span className="font-serif text-gold font-bold">{formatINR(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout action */}
              <button
                onClick={handleStartCheckout}
                disabled={checkoutLoading}
                className="mt-6 w-full rounded-full bg-charcoal py-3.5 text-xs uppercase tracking-wider font-semibold text-ivory hover:bg-rose-deep shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                Proceed to Checkout • {formatINR(finalTotal)}
              </button>

              <div className="mt-6 border-t border-border pt-4 space-y-2 text-[0.7rem] text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold shrink-0" />
                  Isolated Razorpay / Test Gateway Integration
                </p>
                <p className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold shrink-0" />
                  Complimentary fitting consultations at Gurugram Atelier
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATELIER AUTH REQUIRED PROMPT MODAL */}
      {showAuthPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="eyebrow text-gold">Atelier Checkout</p>
                <h3 className="font-serif text-2xl text-foreground">
                  Complete Your Order
                </h3>
              </div>
              <button
                onClick={() => setShowAuthPromptModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Auth Mode Tabs: Sign In vs Create Account */}
            <div className="flex rounded-full bg-secondary/80 p-1 border border-border">
              <button
                type="button"
                onClick={() => setAuthTab("login")}
                className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  authTab === "login"
                    ? "bg-charcoal text-ivory shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("register")}
                className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  authTab === "register"
                    ? "bg-charcoal text-ivory shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>

            {authTab === "login" ? (
              /* Quick Sign In Form */
              <form onSubmit={handleQuickLogin} className="space-y-3.5 rounded-2xl border border-border/60 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In with Existing Account</span>
                </div>

                {quickLoginError && (
                  <div className="rounded-xl border border-rose/30 bg-rose/5 p-3 text-xs text-rose-deep">
                    {quickLoginError}
                  </div>
                )}

                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-cocoa mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={quickEmail}
                      onChange={(e) => setQuickEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2 pl-9 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
                    />
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[0.7rem] uppercase tracking-wider text-cocoa">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[0.65rem] text-gold hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showQuickPassword ? "text" : "password"}
                      required
                      value={quickPassword}
                      onChange={(e) => setQuickPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2 pl-9 pr-9 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
                    />
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                    <button
                      type="button"
                      onClick={() => setShowQuickPassword(!showQuickPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showQuickPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={quickLoginLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-xs uppercase tracking-wider font-semibold text-ivory hover:bg-rose-deep transition-all duration-300 disabled:opacity-50"
                >
                  {quickLoginLoading ? "Signing in..." : "Sign In & Continue to Order"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              /* Quick Account Creation Form */
              <form onSubmit={handleQuickRegister} className="space-y-3 rounded-2xl border border-border/60 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                  <UserPlus className="h-4 w-4" />
                  <span>Create Atelier Account</span>
                </div>

                {quickRegError && (
                  <div className="rounded-xl border border-rose/30 bg-rose/5 p-3 text-xs text-rose-deep">
                    {quickRegError}
                  </div>
                )}

                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-cocoa mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={quickRegName}
                      onChange={(e) => setQuickRegName(e.target.value)}
                      placeholder="e.g. Anu Sharma"
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2 pl-9 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
                    />
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-cocoa mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={quickRegEmail}
                      onChange={(e) => setQuickRegEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2 pl-9 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
                    />
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-cocoa mb-1">
                    Password (Min 8 characters, Upper, Lower, Number & Symbol)
                  </label>
                  <div className="relative">
                    <input
                      type={showQuickRegPassword ? "text" : "password"}
                      required
                      value={quickRegPassword}
                      onChange={(e) => setQuickRegPassword(e.target.value)}
                      placeholder="Create secure password"
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2 pl-9 pr-9 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
                    />
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                    <button
                      type="button"
                      onClick={() => setShowQuickRegPassword(!showQuickRegPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showQuickRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={quickRegLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-xs uppercase tracking-wider font-semibold text-ivory hover:bg-rose-deep transition-all duration-300 disabled:opacity-50"
                >
                  {quickRegLoading ? "Creating Account..." : "Create Account & Place Order"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-3 text-[0.7rem] uppercase tracking-wider text-muted-foreground font-medium">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Guest Checkout Option */}
            <button
              type="button"
              onClick={() => {
                setIsGuestCheckout(true);
                setShowAuthPromptModal(false);
                setShowCheckoutModal(true);
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline decoration-muted-foreground/40 transition-colors py-1"
            >
              Continue as Guest Checkout (without saving account) →
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="eyebrow text-gold">Boutique Checkout</p>
                <h3 className="font-serif text-2xl text-foreground">
                  Delivery &amp; Fitting Details
                </h3>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Member vs Guest status indicator */}
            {user ? (
              <div className="flex items-center justify-between rounded-2xl border border-gold/30 bg-gold/5 px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
                  <span>
                    Signed in as <strong className="text-gold">{user.name}</strong> ({user.email})
                  </span>
                </div>
                <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[0.65rem] font-bold text-gold uppercase tracking-wider">
                  Verified
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-xs text-cocoa">
                <span>Guest Checkout Mode (No account linked)</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setShowAuthPromptModal(true);
                  }}
                  className="text-gold font-semibold hover:underline text-xs"
                >
                  Sign In instead
                </button>
              </div>
            )}

            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@domain.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Flat / Villa / Street, Landmark"
                    value={custStreet}
                    onChange={(e) => setCustStreet(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gurugram / Mumbai / Delhi"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haryana / Delhi / Maharashtra"
                    value={custState}
                    onChange={(e) => setCustState(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="6-digit PIN code"
                    value={custPostal}
                    onChange={(e) => setCustPostal(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 flex items-center justify-between text-xs">
                <span className="text-cocoa font-medium">Grand Total Due:</span>
                <span className="font-serif font-bold text-base text-gold">
                  {formatINR(finalTotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={checkoutLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-all duration-300 disabled:opacity-50"
              >
                {checkoutLoading
                  ? "Launching Secure Gateway..."
                  : "Pay via Razorpay / Test Gateway"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
