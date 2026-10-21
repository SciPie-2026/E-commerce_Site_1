import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Lightweight local cart used during the visual-foundation phase.
 * Phase 2 replaces this with a database-backed cart keyed to the signed-in
 * customer; the context API below is kept stable so pages won't change shape.
 */

export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  qty: number;
  maxQty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "key">) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "aidah-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);
    return {
      lines,
      count,
      subtotal,
      add: (line) =>
        setLines((prev) => {
          const key = `${line.productId}|${line.size}|${line.color}`;
          const existing = prev.find((l) => l.key === key);
          if (existing) {
            return prev.map((l) =>
              l.key === key
                ? { ...l, qty: Math.min(l.qty + line.qty, l.maxQty) }
                : l
            );
          }
          return [...prev, { ...line, key }];
        }),
      remove: (key) => setLines((prev) => prev.filter((l) => l.key !== key)),
      setQty: (key, qty) =>
        setLines((prev) =>
          prev.map((l) =>
            l.key === key ? { ...l, qty: Math.max(1, Math.min(qty, l.maxQty)) } : l
          )
        ),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
