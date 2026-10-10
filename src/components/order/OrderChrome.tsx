"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Check, ShoppingBag } from "lucide-react";
import { money, useOrder } from "./OrderProvider";
import { ease } from "../motion";

/** Bag button for the navbar. */
export function CartNavButton() {
  const { count, setCartOpen } = useOrder();
  return (
    <button
      type="button"
      onClick={() => setCartOpen(true)}
      aria-label={`Open order, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative inline-flex size-12 cursor-pointer items-center justify-center rounded-full text-cream transition-colors hover:text-gold"
    >
      <ShoppingBag aria-hidden className="size-5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            aria-hidden
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="absolute right-1 top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-ember px-1 text-[11px] font-bold leading-5 text-white"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/** Sticky "view order" pill once something is in the bag. */
export function FloatingCart() {
  const { count, subtotal, setCartOpen, cartOpen } = useOrder();
  return (
    <AnimatePresence>
      {count > 0 && !cartOpen && (
        <motion.button
          type="button"
          onClick={() => setCartOpen(true)}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { duration: 0.4, ease } }}
          exit={{ y: 80, opacity: 0, transition: { duration: 0.2 } }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-30 inline-flex min-h-14 cursor-pointer items-center gap-3 rounded-full bg-ember pl-5 pr-6 font-semibold text-white shadow-xl shadow-ember/30"
        >
          <ShoppingBag aria-hidden className="size-5" />
          View order · {count} · <span className="tabular-nums">{money(subtotal)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function Toast() {
  const { toast, dismissToast, setCartOpen } = useOrder();

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(dismissToast, 4000);
    return () => window.clearTimeout(t);
  }, [toast, dismissToast]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0, transition: { duration: 0.15 } }}
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-gold/40 bg-char/95 py-2 pl-4 pr-2 shadow-xl backdrop-blur"
          >
            <Check aria-hidden className="size-4 text-gold" />
            <span className="text-sm">{toast.message}</span>
            <button
              type="button"
              onClick={() => {
                dismissToast();
                setCartOpen(true);
              }}
              className="min-h-9 cursor-pointer rounded-full bg-gold/15 px-3 text-sm font-semibold text-gold hover:bg-gold/25"
            >
              View
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-ember via-gold to-[#f3d58a]"
    />
  );
}
