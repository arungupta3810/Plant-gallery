'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import type { Plant } from '@/lib/plants';

type CartItem = Plant & { qty: number };
type CartCtx = {
  items: CartItem[];
  fav: Record<string, boolean>;
  drawer: boolean;
  setDrawer: (b: boolean) => void;
  addToCart: (p: Plant, qty?: number) => void;
  setQty: (p: Plant, q: number) => void;
  removeItem: (p: Plant) => void;
  toggleFav: (p: Plant) => void;
  cartCount: number;
  wishCount: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [fav, setFav] = useState<Record<string, boolean>>({});
  const [drawer, setDrawer] = useState(false);

  const addToCart = (p: Plant, qty = 1) => {
    setItems((c) => {
      const ex = c.find((i) => i.id === p.id);
      if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
      return [...c, { ...p, qty }];
    });
    setDrawer(true);
  };
  const setQty = (p: Plant, q: number) =>
    setItems((c) => (q <= 0 ? c.filter((i) => i.id !== p.id) : c.map((i) => (i.id === p.id ? { ...i, qty: q } : i))));
  const removeItem = (p: Plant) => setItems((c) => c.filter((i) => i.id !== p.id));
  const toggleFav = (p: Plant) => setFav((f) => ({ ...f, [p.id]: !f[p.id] }));

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const wishCount = Object.values(fav).filter(Boolean).length;

  return (
    <Ctx.Provider value={{ items, fav, drawer, setDrawer, addToCart, setQty, removeItem, toggleFav, cartCount, wishCount }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used within CartProvider');
  return c;
};
