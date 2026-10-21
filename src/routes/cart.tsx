import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Bag — AIDAH The Label" },
      { name: "description", content: "Review your selected handcrafted designer wear and proceed to boutique checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, remove, setQty, clear } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");
    if (promoCode.trim().toUpperCase() === "AIDAH10") {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      setPromoSuccess("10% Atelier Welcome Privilege applied!");
    } else {
      setPromoError("Invalid code. Try 'AIDAH10' for 10% privilege savings.");
    }
  };

  const shippingThreshold = 5000;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingFee = isFreeShipping || lines.length === 0 ? 0 : 350;
  const finalTotal = Math.max(0, subtotal - discount + shippingFee);

  const handleCheckout = () => {
    setCheckingOut(true);
    setTimeout(() => {
      setCheckingOut(false);
      setOrderComplete(true);
      clear();
    }, 1500);
  };

  if (orderComplete) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft/30 text-gold mb-6">
          <Check className="h-8 w-8 text-gold" />
        </div>
        <p className="eyebrow text-gold">Order Confirmed</p>
        <h1 className="display-2 mt-2 text-3xl sm:text-4xl">Thank You for Your Order</h1>
        <p className="mt-4 text-sm text-cocoa leading-relaxed">
          Your bespoke piece has been reserved at our Gurugram atelier. Our concierge team will reach out via WhatsApp/Email with your tracking timeline and fitting details.
        </p>
        <div className="mt-8 rounded-2xl border border-gold/30 bg-cream/60 p-6 text-xs text-cocoa">
          <p className="font-semibold text-foreground">Aidah Designer House &amp; Boutique</p>
          <p className="mt-1">Baani City Centre, Sector 63, Gurugram, Haryana</p>
          <p className="mt-1">Concierge: concierge@aidah.in</p>
        </div>
        <div className="mt-8">
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
        <h1 className="display-2 mt-2 text-3xl sm:text-4xl text-foreground">Shopping Bag</h1>
      </div>

      {lines.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center bg-card">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" strokeWidth={1} />
          <h2 className="font-display text-2xl">Your bag is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Discover our hand-finished lehengas, pure linen sets, and occasion dresses tailored at Baani City Centre.
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
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Items List (8 Cols) */}
          <div className="lg:col-span-8">
            {/* Free shipping progress */}
            <div className="mb-6 rounded-2xl border border-gold/30 bg-gold-soft/10 p-4 text-xs">
              {isFreeShipping ? (
                <p className="text-emerald-800 font-medium flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-gold" />
                  Congratulations! You unlocked complimentary boutique shipping across India.
                </p>
              ) : (
                <p className="text-cocoa">
                  Add <strong>{formatINR(shippingThreshold - subtotal)}</strong> more to unlock complimentary white-glove shipping.
                </p>
              )}
            </div>

            <div className="divide-y divide-border rounded-3xl border border-border bg-card p-6 shadow-sm">
              {lines.map((item) => (
                <div key={item.key} className="py-6 first:pt-0 last:pb-0 flex gap-4 sm:gap-6">
                  {/* Thumbnail */}
                  <Link to={"/product/$slug" as any} params={{ slug: item.slug } as any} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-28 w-24 sm:h-32 sm:w-28 rounded-xl object-cover border border-border"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link to={"/product/$slug" as any} params={{ slug: item.slug } as any}>
                          <h3 className="font-display text-lg text-foreground hover:text-rose-deep transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <button
                          onClick={() => remove(item.key)}
                          aria-label={`Remove ${item.name}`}
                          className="text-muted-foreground hover:text-rose-deep transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-cocoa mt-1">
                        Size: <span className="font-medium text-foreground">{item.size}</span> • Colour: <span className="font-medium text-foreground">{item.color}</span>
                      </p>
                      <p className="text-sm font-medium text-foreground mt-2">
                        {formatINR(item.price)}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs">
                        <button
                          onClick={() => setQty(item.key, item.qty - 1)}
                          className="px-2 py-0.5 text-cocoa hover:text-foreground text-sm"
                        >
                          −
                        </button>
                        <span className="px-2 font-medium">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.key, item.qty + 1)}
                          className="px-2 py-0.5 text-cocoa hover:text-foreground text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {formatINR(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center text-xs text-muted-foreground">
              <Link to="/shop" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
              </Link>
              <button onClick={clear} className="text-rose-deep hover:underline">
                Clear Shopping Bag
              </button>
            </div>
          </div>

          {/* Order Summary (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-display text-xl mb-4 text-foreground">Order Summary</h2>

              {/* Promo code */}
              <form onSubmit={applyPromo} className="mb-6">
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Privilege code (e.g. AIDAH10)"
                    className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
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
                  <div className="flex justify-between text-rose-deep">
                    <span>Privilege Discount</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-cocoa">
                  <span>Boutique Express Delivery</span>
                  <span>{isFreeShipping ? "FREE (Complimentary)" : formatINR(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-cocoa">
                  <span>Estimated Taxes</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-foreground border-t border-border pt-4">
                  <span>Grand Total</span>
                  <span>{formatINR(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout action */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="mt-6 w-full rounded-full bg-charcoal py-3.5 text-xs uppercase tracking-wider font-semibold text-ivory hover:bg-rose-deep shadow-md hover:shadow-lg transition-all"
              >
                {checkingOut ? "Securing Your Order…" : `Proceed to Checkout • ${formatINR(finalTotal)}`}
              </button>

              <div className="mt-6 border-t border-border pt-4 space-y-2 text-[0.7rem] text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold shrink-0" />
                  100% Genuine Handcrafted Pieces
                </p>
                <p className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold shrink-0" />
                  Includes custom alterations at Baani City Centre
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
