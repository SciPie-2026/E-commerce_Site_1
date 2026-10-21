import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/** Local wishlist for the visual-foundation phase; syncs to the customer's account in Phase 2. */

const WishlistContext = createContext<{
  slugs: string[];
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
} | null>(null);

const KEY = "aidah-wishlist-v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  }, [slugs]);

  const value = useMemo(
    () => ({
      slugs,
      has: (slug: string) => slugs.includes(slug),
      toggle: (slug: string) =>
        setSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug])),
    }),
    [slugs]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
