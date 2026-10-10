"use client";

import Image from "next/image";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Box, Flame, Plus } from "lucide-react";
import { hours, local } from "@/lib/data";
import { dishesIn, drinks, type CategoryId, type Dish } from "@/lib/dishes";
import { money, useOrder } from "./order/OrderProvider";
import { SectionHeading, ease } from "./motion";
import { useMediaQuery } from "./useMediaQuery";

/* ---------- pages ---------- */

const PAGE_TITLES = ["Cover", "Welcome", "Garden", "From the fire", "Pasta & pizza", "Desserts", "Drinks", "Visit us"];
const PAGE_COUNT = PAGE_TITLES.length;
const LEAVES = PAGE_COUNT / 2;
/** Pages a guest can jump straight to. */
const CHAPTERS = [2, 3, 4, 5, 6];

const TAG_STYLES: Record<string, string> = {
  Signature: "bg-ember/20 text-[#ff8a7a]",
  "Chef's pick": "bg-gold/20 text-gold",
  New: "bg-emerald-500/15 text-emerald-300",
  Vegan: "bg-lime-500/15 text-lime-300",
};

function DishRow({ dish, index }: { dish: Dish; index: number }) {
  const { openDish, add } = useOrder();
  const [added, setAdded] = useState(0);
  return (
    <motion.li
      className="group/row flex items-center gap-1"
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease, delay: 0.15 + index * 0.07 }}
    >
      <button
        type="button"
        onClick={() => openDish(dish.id)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors duration-200 hover:bg-gold/10"
      >
        <span className="relative size-16 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/40 transition-transform duration-500 group-hover/row:-rotate-6 group-hover/row:scale-110">
          <Image src={dish.photo} alt="" fill sizes="64px" className="object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-lg leading-tight">{dish.name}</span>
            <span aria-hidden className="flex-1 -translate-y-1 border-b border-dotted border-gold/30" />
            <span className="font-semibold tabular-nums text-gold">{money(dish.price)}</span>
          </span>
          <span className="mt-0.5 line-clamp-1 text-sm leading-snug text-stone">{dish.description}</span>
          <span className="mt-1 flex flex-wrap gap-1.5">
            {dish.tag && (
              <span className={`rounded-full px-2 py-px text-[11px] font-semibold ${TAG_STYLES[dish.tag] ?? "bg-gold/15 text-gold"}`}>
                {dish.tag}
              </span>
            )}
            {dish.plate && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-cream/10 px-2 py-px text-[11px] font-semibold text-cream/80">
                <Box aria-hidden className="size-3" />
                3D view
              </span>
            )}
          </span>
        </span>
      </button>
      <motion.button
        key={added}
        type="button"
        onClick={() => {
          add(dish.id);
          setAdded((n) => n + 1);
        }}
        aria-label={`Add ${dish.name} to order`}
        initial={added ? { scale: 0.6 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 14 }}
        className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold hover:text-ink"
      >
        <Plus aria-hidden className="size-4" />
      </motion.button>
    </motion.li>
  );
}

/** Photo banner across the top of a page; slowly zooms (Ken Burns). */
function Banner({ src, title, kicker, position = "center" }: { src: string; title: string; kicker: string; position?: string }) {
  return (
    <div className="relative h-28 shrink-0 overflow-hidden rounded-lg sm:h-36">
      <Image src={src} alt="" fill sizes="460px" className="kenburns object-cover" style={{ objectPosition: position }} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1a1410] via-[#1a1410]/40 to-transparent" />
      <div className="absolute inset-x-4 bottom-3">
        <p className="eyebrow text-[10px]">{kicker}</p>
        <h3 className="text-gold-gradient font-display text-3xl leading-tight">{title}</h3>
      </div>
    </div>
  );
}

function PageFrame({ children, number }: { children: ReactNode; number?: number }) {
  return (
    <div className="flex h-full flex-col p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-2 rounded-lg border border-gold/15" />
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      {number !== undefined && (
        <p className="relative mt-1 text-center font-display text-sm italic text-gold/60">— {number} —</p>
      )}
    </div>
  );
}

const BANNERS: Record<CategoryId, { src: string; position?: string; kicker: string }> = {
  garden: { src: dishesIn("garden")[0].photo, kicker: "Fresh from the garden" },
  fire: { src: local.skewers, position: "50% 45%", kicker: "Over live oak" },
  pasta: { src: dishesIn("pasta")[1].photo, kicker: "Hand-rolled daily" },
  dessert: { src: dishesIn("dessert")[0].photo, kicker: "Something sweet" },
};

function CategoryPage({ title, category, number }: { title: string; category: CategoryId; number: number }) {
  const b = BANNERS[category];
  return (
    <PageFrame number={number}>
      <Banner src={b.src} title={title} kicker={b.kicker} position={b.position} />
      <ul className="mt-2 flex min-h-0 flex-1 flex-col justify-center-safe overflow-y-auto">
        {dishesIn(category).map((d, i) => (
          <DishRow key={d.id} dish={d} index={i} />
        ))}
      </ul>
    </PageFrame>
  );
}

function renderPage(p: number, goNext: () => void): ReactNode {
  switch (p) {
    case 0:
      return (
        <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
          <Image src={local.diningRoom} alt="" fill sizes="460px" className="kenburns object-cover" />
          <div aria-hidden className="absolute inset-0 bg-[#120d0a]/75" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(217,168,84,0.18),transparent_65%)]" />
          <div className="pointer-events-none absolute inset-4 rounded-lg border border-gold/50" />
          <div className="pointer-events-none absolute inset-6 rounded-md border border-gold/20" />
          <Flame aria-hidden className="relative size-10 text-ember drop-shadow-[0_0_14px_rgba(220,38,38,0.7)]" />
          <p className="text-gold-gradient relative mt-6 font-display text-4xl sm:text-5xl">Ember &amp; Oak</p>
          <p className="eyebrow relative mt-4">The menu · Autumn 2026</p>
          <button type="button" onClick={goNext} className="btn btn-ghost relative mt-10 bg-ink/40 backdrop-blur">
            Open the menu <ArrowRight aria-hidden className="size-4" />
          </button>
        </div>
      );
    case 1:
      return (
        <PageFrame number={1}>
          <div className="relative h-40 shrink-0 overflow-hidden rounded-lg sm:h-48">
            <Image src={local.platedService} alt="" fill sizes="460px" className="kenburns object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1a1410] to-transparent" />
          </div>
          <div className="flex flex-1 flex-col justify-center text-center">
            <p className="eyebrow">Welcome</p>
            <h3 className="mt-2 font-display text-2xl italic sm:text-3xl">From our hearth to your table</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm text-stone">
              Dishes are made to share — we suggest two or three per guest. Tap any dish for ingredients and a
              closer look, or press <span className="text-gold">+</span> to add it to your order.
            </p>
            <p className="mt-4 font-display text-lg italic text-gold">— Chef Marco Ruiz</p>
          </div>
        </PageFrame>
      );
    case 2:
      return <CategoryPage title="Garden" category="garden" number={2} />;
    case 3:
      return <CategoryPage title="From the fire" category="fire" number={3} />;
    case 4:
      return <CategoryPage title="Pasta & pizza" category="pasta" number={4} />;
    case 5:
      return <CategoryPage title="Desserts" category="dessert" number={5} />;
    case 6:
      return (
        <PageFrame number={6}>
          <Banner src={local.tableWine} title="Drinks" kicker="Cellar & bar" position="50% 55%" />
          <ul className="mt-3 flex min-h-0 flex-1 flex-col justify-center-safe gap-3 overflow-y-auto px-1">
            {drinks.map((d) => (
              <li key={d.name}>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-lg">{d.name}</span>
                  <span aria-hidden className="flex-1 -translate-y-1 border-b border-dotted border-gold/30" />
                  <span className="font-semibold tabular-nums text-gold">{money(d.price)}</span>
                </div>
                <p className="text-sm text-stone">{d.detail}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-center text-xs text-stone">Drinks are served in the restaurant only.</p>
        </PageFrame>
      );
    default:
      return (
        <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
          <Image src={local.interiorLamps} alt="" fill sizes="460px" className="kenburns object-cover" />
          <div aria-hidden className="absolute inset-0 bg-[#120d0a]/80" />
          <div className="pointer-events-none absolute inset-4 rounded-lg border border-gold/40" />
          <p className="eyebrow relative">Visit us</p>
          <dl className="relative mt-5 w-full max-w-xs space-y-2 text-sm">
            {hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-4 border-b border-line pb-2">
                <dt className="text-stone">{h.days}</dt>
                <dd className="tabular-nums">{h.time}</dd>
              </div>
            ))}
          </dl>
          <a href="#reserve" className="btn btn-primary relative mt-8">
            Reserve a table
          </a>
        </div>
      );
  }
}

/* ---------- book ---------- */

const paper = "bg-[#1a1410] bg-[linear-gradient(135deg,rgba(255,255,255,0.025),transparent_40%,rgba(0,0,0,0.25))]";

function Face({ back, inert, children }: { back?: boolean; inert: boolean; children: ReactNode }) {
  return (
    <div
      inert={inert}
      className={`absolute inset-0 overflow-hidden border border-gold/25 shadow-[0_30px_50px_-10px_rgba(0,0,0,0.6)] ${paper} ${back ? "rounded-l-xl" : "rounded-r-xl"}`}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
        pointerEvents: inert ? "none" : undefined,
      }}
    >
      {children}
      {/* Spine shading */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 w-10 ${
          back ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
        } from-black/45 to-transparent`}
      />
    </div>
  );
}

function SpreadBook({ leaf, dir, goNext }: { leaf: number; dir: number; goNext: () => void }) {
  // The leaf currently turning must sit above both visible pages.
  const moving = dir > 0 ? leaf - 1 : leaf;
  const shift = leaf === 0 ? "-25%" : leaf === LEAVES ? "25%" : "0%";
  return (
    <div className="mx-auto w-full max-w-[920px]">
      <motion.div
        className="relative mx-auto aspect-[920/620] w-full"
        style={{ perspective: 2400 }}
        initial={false}
        animate={{ x: shift }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
      >
        {Array.from({ length: LEAVES }, (_, k) => {
          const flipped = k < leaf;
          const frontVisible = k === leaf;
          const backVisible = k === leaf - 1;
          return (
            <motion.div
              key={k}
              className="absolute left-1/2 top-0 h-full w-1/2"
              style={{
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                zIndex: k === moving ? LEAVES + 2 : frontVisible || backVisible ? LEAVES + 1 : flipped ? k + 1 : LEAVES - k,
              }}
              initial={false}
              animate={{ rotateY: flipped ? -180 : 0 }}
              transition={{ duration: 1.1, ease: [0.645, 0.045, 0.355, 1] }}
            >
              <Face inert={!frontVisible}>{renderPage(2 * k, goNext)}</Face>
              <Face back inert={!backVisible}>
                {renderPage(2 * k + 1, goNext)}
              </Face>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function SingleBook({ page, dir, goNext }: { page: number; dir: number; goNext: () => void }) {
  return (
    <div className="mx-auto w-full max-w-md" style={{ perspective: 1600 }}>
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={page}
          custom={dir}
          className={`relative aspect-[3/4.4] overflow-hidden rounded-xl border border-gold/25 shadow-2xl shadow-black/60 ${paper}`}
          style={{ transformOrigin: dir > 0 ? "left center" : "right center" }}
          initial={{ rotateY: dir > 0 ? 80 : -80, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1, transition: { duration: 0.45, ease } }}
          exit={{ rotateY: dir > 0 ? -80 : 80, opacity: 0, transition: { duration: 0.28, ease: "easeIn" } }}
        >
          {renderPage(page, goNext)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function MenuBook() {
  const single = useMediaQuery("(max-width: 767px)");
  const [leaf, setLeaf] = useState(0); // desktop: leaves turned (0..LEAVES)
  const [page, setPage] = useState(0); // mobile: page index
  const [dir, setDir] = useState(1);

  const pos = single ? page : leaf;
  const max = single ? PAGE_COUNT - 1 : LEAVES;
  const go = (delta: number) => {
    const next = Math.min(max, Math.max(0, pos + delta));
    if (next === pos) return;
    setDir(delta);
    if (single) setPage(next);
    else setLeaf(next);
  };
  const goNext = () => go(1);

  // Jump straight to a chapter: on desktop, page p is visible when leaf = ceil(p / 2).
  const jumpTo = (p: number) => {
    const next = single ? p : Math.ceil(p / 2);
    if (next === pos) return;
    setDir(next > pos ? 1 : -1);
    if (single) setPage(next);
    else setLeaf(next);
  };
  const visible = (p: number) => (single ? page === p : Math.ceil(p / 2) === leaf);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
  };

  const label = single
    ? `Page ${page + 1} of ${PAGE_COUNT}: ${PAGE_TITLES[page]}`
    : leaf === 0
      ? "Cover"
      : leaf === LEAVES
        ? "Back cover"
        : `${PAGE_TITLES[2 * leaf - 1]} & ${PAGE_TITLES[2 * leaf]}`;

  return (
    <section id="menu" className="overflow-hidden bg-char py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow="The menu" title="Turn the pages, taste the fire." align="center">
          Flip through tonight&rsquo;s menu or jump to a chapter. Tap a dish for a closer look, or add it to your order in one tap.
        </SectionHeading>

        <div
          role="group"
          aria-roledescription="menu book"
          aria-label="Ember & Oak menu. Use the arrow keys to turn pages."
          onKeyDown={onKeyDown}
          className="mt-12"
        >
          <nav aria-label="Menu chapters" className="mb-10 flex flex-wrap justify-center gap-2">
            {CHAPTERS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => jumpTo(p)}
                aria-current={visible(p) ? "page" : undefined}
                className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${
                  visible(p) ? "border-gold bg-gold/15 text-gold" : "border-line text-stone hover:border-gold/50 hover:text-cream"
                }`}
              >
                {PAGE_TITLES[p]}
              </button>
            ))}
          </nav>
          {single ? <SingleBook page={page} dir={dir} goNext={goNext} /> : <SpreadBook leaf={leaf} dir={dir} goNext={goNext} />}

          <div className="mt-10 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={pos === 0}
              aria-label="Previous page"
              className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-line text-cream transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-cream"
            >
              <ArrowLeft aria-hidden className="size-5" />
            </button>
            <p aria-live="polite" className="min-w-44 text-center text-sm text-stone">
              {label}
            </p>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={pos === max}
              aria-label="Next page"
              className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-line text-cream transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-cream"
            >
              <ArrowRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
