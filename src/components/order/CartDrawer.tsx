"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bike, CheckCircle2, Loader2, Minus, Plus, ShoppingBag, Store, X } from "lucide-react";
import { money, useOrder } from "./OrderProvider";
import { useModalA11y } from "./useModalA11y";
import { ease } from "../motion";

const DELIVERY_FEE = 4.99;

type Mode = "pickup" | "delivery";
type Errors = Partial<Record<"name" | "phone" | "address", string>>;

function Drawer({ onClose }: { onClose: () => void }) {
  const { lines, subtotal, setQty, clear } = useOrder();
  const panel = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pickup");
  const [step, setStep] = useState<"cart" | "placing" | "done">("cart");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [receipt, setReceipt] = useState<{ number: string; mode: Mode } | null>(null);
  useModalA11y(true, panel, onClose);

  const fee = mode === "delivery" && lines.length ? DELIVERY_FEE : 0;
  const total = subtotal + fee;

  const validate = () => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Enter a name for the order.";
    if (!/^[+\d][\d\s()-]{6,}$/.test(form.phone)) e.phone = "Enter a phone number so we can reach you, e.g. +1 555 010 2030.";
    if (mode === "delivery" && form.address.trim().length < 6) e.address = "Enter a street address for delivery.";
    return e;
  };

  const placeOrder = async (ev: FormEvent) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      panel.current?.querySelector<HTMLElement>(`#order-${first}`)?.focus();
      return;
    }
    setStep("placing");
    // Replace with a real ordering API call.
    await new Promise((r) => setTimeout(r, 1300));
    setReceipt({ number: `EO-${Math.floor(1000 + Math.random() * 9000)}`, mode });
    clear();
    setStep("done");
  };

  const field = (key: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`order-${key}`} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={`order-${key}`}
        className="field"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `order-${key}-error` : undefined}
        {...props}
      />
      {errors[key] && (
        <p id={`order-${key}-error`} role="alert" className="mt-1.5 text-sm text-red-300">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
      <div aria-hidden className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        data-lenis-prevent
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-char shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0, transition: { duration: 0.45, ease } }}
        exit={{ x: "100%", transition: { duration: 0.25, ease: "easeIn" } }}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="cart-title" className="font-display text-2xl">
            Your order
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order"
            className="-mr-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-stone transition-colors hover:bg-coal hover:text-cream"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        {step === "done" && receipt ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center" aria-live="polite">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 15 }}>
              <CheckCircle2 aria-hidden className="size-16 text-gold" />
            </motion.div>
            <h3 className="mt-6 font-display text-3xl">Order {receipt.number} confirmed</h3>
            <p className="mt-3 text-stone">
              {receipt.mode === "pickup"
                ? "Your order will be ready for pickup at 48 Harbour Lane in about 25 minutes."
                : "Your order is on its way and should arrive in about 40 minutes."}{" "}
              We&rsquo;ve sent updates to {form.phone}.
            </p>
            <button type="button" onClick={onClose} className="btn btn-ghost mt-8">
              Back to the menu
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <ShoppingBag aria-hidden className="size-12 text-stone" />
            <h3 className="mt-5 font-display text-2xl">Your order is empty</h3>
            <p className="mt-2 text-stone">Open the menu book and tap a dish to add it.</p>
            <a href="#menu" onClick={onClose} className="btn btn-primary mt-8">
              Browse the menu
            </a>
          </div>
        ) : (
          <form onSubmit={placeOrder} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ul className="divide-y divide-line">
                <AnimatePresence initial={false}>
                  {lines.map(({ dish, qty }) => (
                    <motion.li
                      key={dish.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                      className="flex items-center gap-3 py-4"
                    >
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                        <Image src={dish.photo} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-lg leading-tight">{dish.name}</p>
                        <p className="text-sm tabular-nums text-gold">{money(dish.price * qty)}</p>
                      </div>
                      <div className="flex items-center rounded-full border border-line" role="group" aria-label={`${dish.name} quantity`}>
                        <button
                          type="button"
                          onClick={() => setQty(dish.id, qty - 1)}
                          aria-label={qty === 1 ? `Remove ${dish.name}` : `Decrease ${dish.name}`}
                          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full"
                        >
                          <Minus aria-hidden className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(dish.id, qty + 1)}
                          aria-label={`Increase ${dish.name}`}
                          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full"
                        >
                          <Plus aria-hidden className="size-3.5" />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <fieldset className="mt-6">
                <legend className="eyebrow">How would you like it?</legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: "pickup", label: "Pickup", hint: "~25 min", Icon: Store },
                      { value: "delivery", label: "Delivery", hint: `~40 min · ${money(DELIVERY_FEE)}`, Icon: Bike },
                    ] as const
                  ).map(({ value, label, hint, Icon }) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold ${
                        mode === value ? "border-gold bg-gold/10" : "border-line hover:border-stone/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mode"
                        value={value}
                        checked={mode === value}
                        onChange={() => setMode(value)}
                        className="sr-only"
                      />
                      <Icon aria-hidden className="size-5 text-gold" />
                      <span>
                        <span className="block font-semibold">{label}</span>
                        <span className="block text-xs text-stone">{hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-6 space-y-4">
                {field("name", "Name", { autoComplete: "name", required: true })}
                {field("phone", "Phone", { type: "tel", autoComplete: "tel", inputMode: "tel", required: true })}
                {mode === "delivery" && field("address", "Delivery address", { autoComplete: "street-address", required: true })}
              </div>
            </div>

            <div className="border-t border-line px-6 py-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{money(subtotal)}</dd>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between text-stone">
                    <dt>Delivery</dt>
                    <dd className="tabular-nums">{money(fee)}</dd>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums text-gold">{money(total)}</dd>
                </div>
              </dl>
              <button type="submit" disabled={step === "placing"} className="btn btn-primary mt-4 w-full">
                {step === "placing" ? (
                  <>
                    <Loader2 aria-hidden className="size-4 animate-spin" /> Placing order…
                  </>
                ) : (
                  `Place order · ${money(total)}`
                )}
              </button>
              <p className="mt-2 text-center text-xs text-stone">
                Pay on {mode === "pickup" ? "pickup" : "delivery"} — card or cash.
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useOrder();
  return <AnimatePresence>{cartOpen && <Drawer onClose={() => setCartOpen(false)} />}</AnimatePresence>;
}
