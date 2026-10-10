"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import type { Dish } from "@/lib/dishes";
import { money, useOrder } from "./OrderProvider";
import { useModalA11y } from "./useModalA11y";
import { ease } from "../motion";

const PlateViewer = dynamic(() => import("../three/PlateViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-stone">Plating your dish…</div>
  ),
});

function DishDialog({ dish, onClose }: { dish: Dish; onClose: () => void }) {
  const { add, setCartOpen } = useOrder();
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  useModalA11y(true, panel, onClose);

  const addToOrder = () => {
    add(dish.id, qty);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <div aria-hidden className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-title"
        className="relative grid max-h-[94dvh] w-full max-w-5xl overflow-y-auto rounded-t-3xl border border-line bg-char shadow-2xl md:grid-cols-2 sm:rounded-3xl"
        initial={{ y: 60, scale: 0.97 }}
        animate={{ y: 0, scale: 1, transition: { duration: 0.45, ease } }}
        exit={{ y: 40, scale: 0.98, transition: { duration: 0.2 } }}
      >
        <div className="relative h-[320px] bg-[radial-gradient(circle_at_50%_60%,rgba(217,168,84,0.14),transparent_65%)] sm:h-[380px] md:h-auto md:min-h-[520px]">
          {dish.plate ? (
            <PlateViewer dish={dish} still={!!reduce} />
          ) : (
            <Image src={dish.photo} alt={dish.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          )}
        </div>

        <div className="flex flex-col p-6 sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              {dish.tag && <p className="eyebrow">{dish.tag}</p>}
              <h2 id="dish-title" className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
                {dish.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 -mt-1 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-stone transition-colors hover:bg-coal hover:text-cream"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <p className="mt-4 text-lg text-stone">{dish.description}</p>

          <h3 className="eyebrow mt-8">Ingredients</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {dish.ingredients.map((i) => (
              <li key={i} className="rounded-full border border-line px-3 py-1 text-sm">
                {i}
              </li>
            ))}
          </ul>

          <h3 className="eyebrow mt-6">Allergens</h3>
          <p className="mt-2 text-sm text-stone">{dish.allergens.length ? dish.allergens.join(" · ") : "None listed"}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6 md:mt-auto">
            <div className="flex items-center rounded-full border border-line" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty === 1}
                aria-label="Decrease quantity"
                className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus aria-hidden className="size-4" />
              </button>
              <output aria-live="polite" className="w-8 text-center font-semibold tabular-nums">
                {qty}
              </output>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                aria-label="Increase quantity"
                className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full"
              >
                <Plus aria-hidden className="size-4" />
              </button>
            </div>
            <button type="button" data-autofocus onClick={addToOrder} className="btn btn-primary flex-1">
              Add to order · {money(dish.price * qty)}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              setCartOpen(true);
            }}
            className="mt-4 cursor-pointer self-center text-sm text-stone underline-offset-4 hover:text-cream hover:underline"
          >
            View current order
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DishModal() {
  const { activeDish, closeDish } = useOrder();
  return <AnimatePresence>{activeDish && <DishDialog key={activeDish.id} dish={activeDish} onClose={closeDish} />}</AnimatePresence>;
}
