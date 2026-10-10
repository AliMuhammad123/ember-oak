"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Flame, Menu as MenuIcon, X } from "lucide-react";
import { durations, ease } from "./motion";

const links = [
  { label: "Menu", href: "#menu" },
  { label: "Our story", href: "#story" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
];

export function Navbar({ actions }: { actions?: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        solid ? "border-line bg-ink/90 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2 font-display text-xl tracking-wide">
          <Flame aria-hidden className="size-5 text-ember" />
          Ember &amp; Oak
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm uppercase tracking-[0.18em] text-stone transition-colors duration-200 hover:text-cream"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 md:gap-3">
          {actions}
          <a href="#reserve" className="btn btn-primary hidden md:inline-flex">
            Reserve a table
          </a>

          <button
            type="button"
            className="-mr-2 inline-flex size-12 cursor-pointer items-center justify-center rounded-full md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden /> : <MenuIcon aria-hidden />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: durations.base * 0.6, ease } }}
            exit={{ opacity: 0, y: -8, transition: { duration: durations.fast * 0.75 } }}
            className="border-t border-line bg-ink px-5 pb-6 md:hidden"
          >
            <ul className="flex flex-col py-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 font-display text-2xl"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <a href="#reserve" onClick={() => setOpen(false)} className="btn btn-primary mt-2 w-full">
              Reserve a table
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
