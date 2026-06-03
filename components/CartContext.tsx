'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import type { Plant } from '@/lib/plants';
import { api, getToken, setToken, type AuthUser } from '@/lib/api';

type CartItem = Plant & { qty: number };

type CartCtx = {
  // cart
  items: CartItem[];
  drawer: boolean;
  setDrawer: (b: boolean) => void;
  addToCart: (p: Plant, qty?: number) => void;
  setQty: (p: Plant, q: number) => void;
  removeItem: (p: Plant) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  // wishlist
  fav: Record<string, boolean>;
  toggleFav: (p: Plant) => void;
  wishCount: number;
  // auth
  user: AuthUser | null;
  authReady: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

const CART_KEY = 'pg_cart';
const FAV_KEY = 'pg_fav';

const keyOf = (p: Plant) => p.slug ?? p.id;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [fav, setFav] = useState<Record<string, boolean>>({});
  const [drawer, setDrawer] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // ---- hydrate from localStorage on mount ----
  useEffect(() => {
    try {
      const c = window.localStorage.getItem(CART_KEY);
      if (c) setItems(JSON.parse(c));
      const f = window.localStorage.getItem(FAV_KEY);
      if (f) setFav(JSON.parse(f));
    } catch { /* ignore */ }

    // restore session
    if (getToken()) {
      api.me()
        .then((u) => { setUser(u); return loadServerWishlist(); })
        .catch(() => setToken(null))
        .finally(() => setAuthReady(true));
    } else {
      setAuthReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- persist cart + guest favourites ----
  useEffect(() => {
    try { window.localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);
  useEffect(() => {
    try { window.localStorage.setItem(FAV_KEY, JSON.stringify(fav)); } catch { /* ignore */ }
  }, [fav]);

  const loadServerWishlist = useCallback(async () => {
    try {
      const list = await api.wishlist();
      const map: Record<string, boolean> = {};
      list.forEach((p) => { map[p.slug ?? p.id] = true; });
      setFav(map);
    } catch { /* ignore */ }
  }, []);

  // ---- cart ops ----
  const addToCart = (p: Plant, qty = 1) => {
    setItems((c) => {
      const k = keyOf(p);
      const ex = c.find((i) => keyOf(i) === k);
      if (ex) return c.map((i) => (keyOf(i) === k ? { ...i, qty: i.qty + qty } : i));
      return [...c, { ...p, qty }];
    });
    setDrawer(true);
  };
  const setQty = (p: Plant, q: number) =>
    setItems((c) => (q <= 0 ? c.filter((i) => keyOf(i) !== keyOf(p)) : c.map((i) => (keyOf(i) === keyOf(p) ? { ...i, qty: q } : i))));
  const removeItem = (p: Plant) => setItems((c) => c.filter((i) => keyOf(i) !== keyOf(p)));
  const clearCart = () => setItems([]);

  // ---- wishlist ops ----
  const toggleFav = (p: Plant) => {
    const k = keyOf(p);
    setFav((f) => ({ ...f, [k]: !f[k] })); // optimistic
    if (user) api.toggleWish(k).catch(() => setFav((f) => ({ ...f, [k]: !f[k] }))); // revert on error
  };

  // ---- auth ops ----
  const afterAuth = async (token: string, u: AuthUser) => {
    setToken(token);
    setUser(u);
    await loadServerWishlist();
  };
  const loginUser = async (email: string, password: string) => {
    const { token, user: u } = await api.login({ email, password });
    await afterAuth(token, u);
  };
  const registerUser = async (name: string, email: string, password: string, phone?: string) => {
    const { token, user: u } = await api.register({ name, email, password, phone });
    await afterAuth(token, u);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    setFav({});
  };

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const wishCount = Object.values(fav).filter(Boolean).length;

  const value = useMemo<CartCtx>(() => ({
    items, drawer, setDrawer, addToCart, setQty, removeItem, clearCart, cartCount, subtotal,
    fav, toggleFav, wishCount,
    user, authReady, loginUser, registerUser, logout,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [items, drawer, fav, user, authReady, cartCount, subtotal, wishCount]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used within CartProvider');
  return c;
};
