"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { menu } from "@/lib/data";
import { SectionHeading, ease } from "./motion";

const panel: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export function Menu() {
  const [active, setActive] = useState(menu[0].id);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const category = menu.find((c) => c.id === active)!;

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (index + dir + menu.length) % menu.length;
    setActive(menu[next].id);
    tabsRef.current[next]?.focus();
  };

  return (
    <section id="menu" className="bg-char py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <SectionHeading eyebrow="The menu" title="Made for sharing, built around the fire.">
            A short menu that changes with the season. Ask your server about tonight&rsquo;s specials.
          </SectionHeading>

          <div role="tablist" aria-label="Menu categories" className="flex w-fit gap-1 rounded-full border border-line bg-ink p-1">
            {menu.map((c, i) => {
              const selected = c.id === active;
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabsRef.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${c.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${c.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(c.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`relative min-h-11 cursor-pointer whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-200 sm:px-5 ${
                    selected ? "text-white" : "text-stone hover:text-cream"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="menu-pill"
                      className="absolute inset-0 -z-0 rounded-full bg-ember"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={category.id}
            id={`panel-${category.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${category.id}`}
            variants={panel}
            initial="hidden"
            animate="show"
            exit="exit"
            className="mt-14 grid gap-6 lg:grid-cols-3"
          >
            {category.featured.map((dish) => (
              <motion.article
                key={dish.name}
                variants={item}
                className="group overflow-hidden rounded-2xl border border-line bg-ink"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={dish.image!}
                    alt={dish.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {dish.tag && (
                    <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur">
                      {dish.tag}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl">{dish.name}</h3>
                    <p className="font-semibold tabular-nums text-gold">${dish.price}</p>
                  </div>
                  <p className="mt-2 text-stone">{dish.description}</p>
                </div>
              </motion.article>
            ))}

            <motion.div variants={item} className="rounded-2xl border border-line bg-ink p-6 md:p-8">
              <h3 className="eyebrow">Also tonight</h3>
              <ul className="mt-6 divide-y divide-line">
                {category.more.map((dish) => (
                  <li key={dish.name} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-xl">{dish.name}</span>
                      <span aria-hidden className="flex-1 border-b border-dotted border-line" />
                      <span className="font-semibold tabular-nums text-gold">${dish.price}</span>
                    </div>
                    <p className="mt-1 text-sm text-stone">{dish.description}</p>
                  </li>
                ))}
              </ul>
              <a href="#reserve" className="btn btn-ghost mt-8 w-full">
                Book to taste it
              </a>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
