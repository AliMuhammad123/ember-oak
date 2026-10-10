"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { dishById, type Dish } from "@/lib/dishes";

type Line = { dish: Dish; qty: number };

type OrderContext = {
  lines: Line[];
  count: number;
  subtotal: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  activeDish: Dish | null;
  openDish: (id: string) => void;
  closeDish: () => void;
  toast: { id: number; message: string } | null;
  dismissToast: () => void;
};

const Ctx = createContext<OrderContext | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<OrderContext["toast"]>(null);

  const add = useCallback((id: string, qty = 1) => {
    setQtys((q) => ({ ...q, [id]: (q[id] ?? 0) + qty }));
    const name = dishById(id)?.name ?? "Dish";
    setToast({ id: Date.now(), message: `${qty > 1 ? `${qty} × ` : ""}${name} added to your order` });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setQtys((q) => {
      const next = { ...q };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }, []);

  const value = useMemo<OrderContext>(() => {
    const lines = Object.entries(qtys).map(([id, qty]) => ({ dish: dishById(id)!, qty }));
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.dish.price, 0),
      add,
      setQty,
      clear: () => setQtys({}),
      cartOpen,
      setCartOpen,
      activeDish: activeId ? (dishById(activeId) ?? null) : null,
      openDish: setActiveId,
      closeDish: () => setActiveId(null),
      toast,
      dismissToast: () => setToast(null),
    };
  }, [qtys, add, setQty, cartOpen, activeId, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrder() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0 });
