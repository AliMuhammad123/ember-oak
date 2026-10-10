"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, MoveRight } from "lucide-react";
import { local } from "@/lib/data";
import { useOrder } from "./order/OrderProvider";
import { useMediaQuery } from "./useMediaQuery";
import { ease } from "./motion";

type Slide = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  text: string;
  wide?: boolean;
  dishId?: string;
  cta?: { label: string; href: string };
};

const slides: Slide[] = [
  {
    src: local.langoustine,
    alt: "Grilled langoustine tails with aioli, dressed leaves and sourdough",
    eyebrow: "New on the grill",
    title: "Grilled langoustine",
    text: "Butterflied over oak and finished with smoked paprika butter.",
    wide: true,
    dishId: "langoustine",
  },
  {
    src: local.searedSalmon,
    alt: "Maple-seared salmon on a black plate with courgette and carrot ribbons",
    eyebrow: "From the fire",
    title: "Maple-seared salmon",
    text: "Crisp skin, a glossy maple glaze and garden ribbons.",
    wide: true,
    dishId: "seared-salmon",
  },
  {
    src: local.brunchTable,
    alt: "A brunch burger with fries, brioche French toast and a beetroot salad down a long table",
    eyebrow: "Long tables",
    title: "Made for sharing",
    text: "Burgers, brioche French toast and beetroot salads for the whole table.",
    cta: { label: "Book a group table", href: "#reserve" },
  },
  {
    src: local.platedService,
    alt: "A plated fish course being set down at a candlelit table with wine",
    eyebrow: "Thursday – Saturday",
    title: "The seven-course tasting menu",
    text: "Let the kitchen cook for you, paired glass by glass.",
    wide: true,
    cta: { label: "Reserve the tasting menu", href: "#reserve" },
  },
  {
    src: local.breakfastSpread,
    alt: "Weekend brunch spread with shakshuka, French toast, berries and coffee",
    eyebrow: "Weekends 10 – 3",
    title: "Brunch by the hearth",
    text: "Shakshuka, French toast, fresh berries and properly good coffee.",
    wide: true,
    cta: { label: "Book brunch", href: "#reserve" },
  },
  {
    src: local.diningHall,
    alt: "Looking down on a marble-floored dining hall with white tablecloths",
    eyebrow: "Private dining",
    title: "The marble hall",
    text: "Afternoon tea, celebrations and private events for up to 40 guests.",
    cta: { label: "Enquire about events", href: "#reserve" },
  },
];

function SlideCard({ slide, progress, mobile }: { slide: Slide; progress?: MotionValue<number>; mobile?: boolean }) {
  const { openDish } = useOrder();
  const centred = useMotionValue(0.5);
  // Image drifts inside its frame as the row moves past (stays centred in the swipe carousel).
  const drift = useTransform(progress ?? centred, [0, 1], ["-7%", "7%"]);

  const size = mobile
    ? "h-[62dvh] w-[84vw] shrink-0 snap-center"
    : `h-[70dvh] shrink-0 ${slide.wide ? "w-[min(58vw,760px)]" : "w-[min(34vw,460px)]"}`;

  return (
    <article className={`group relative overflow-hidden rounded-3xl border border-line bg-char ${size}`}>
      <motion.div style={{ x: drift }} className="absolute inset-y-0 -left-[8%] -right-[8%]">
        <Image
          src={slide.src}
          alt={slide.alt}
          fill
          sizes={mobile ? "90vw" : slide.wide ? "60vw" : "36vw"}
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />

      <motion.div
        className="absolute inset-x-0 bottom-0 p-6 sm:p-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.4, once: true }}
        transition={{ duration: 0.8, ease }}
      >
        <p className="eyebrow">{slide.eyebrow}</p>
        <h3 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{slide.title}</h3>
        <p className="mt-3 max-w-md text-stone">{slide.text}</p>
        {slide.dishId ? (
          <button type="button" onClick={() => openDish(slide.dishId!)} className="btn btn-primary mt-6">
            View &amp; order <ArrowRight aria-hidden className="size-4" />
          </button>
        ) : slide.cta ? (
          <a href={slide.cta.href} className="btn btn-ghost mt-6">
            {slide.cta.label} <ArrowRight aria-hidden className="size-4" />
          </a>
        ) : null}
      </motion.div>
    </article>
  );
}

function Intro({ mobile }: { mobile?: boolean }) {
  return (
    <div className={mobile ? "px-5" : "flex w-[min(30vw,400px)] shrink-0 flex-col justify-center"}>
      <p className="eyebrow">An evening at Ember &amp; Oak</p>
      <h2 className="mt-4 font-display text-4xl leading-tight text-balance md:text-6xl">
        From weekend brunch <em className="text-gold-gradient">to the last pour.</em>
      </h2>
      <p className="mt-5 text-lg text-stone">
        Signature plates, long tables and a room made for lingering.
      </p>
      {!mobile && (
        <p className="mt-10 flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-stone">
          Keep scrolling <MoveRight aria-hidden className="size-5 text-gold" />
        </p>
      )}
    </div>
  );
}

/** Desktop: the section pins and scrolling moves the row sideways. */
function PinnedShowcase() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDistance(Math.max(0, el.scrollWidth - window.innerWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);

  return (
    <section
      ref={section}
      aria-label="An evening at Ember & Oak"
      className="relative"
      style={{ height: `calc(100dvh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex w-max items-center gap-6 px-[6vw]">
          <Intro />
          {slides.map((s) => (
            <SlideCard key={s.title} slide={s} progress={smooth} />
          ))}
        </motion.div>
        <div aria-hidden className="absolute inset-x-[6vw] bottom-8 h-px bg-line">
          <motion.div style={{ scaleX: smooth }} className="h-full origin-left bg-gold" />
        </div>
      </div>
    </section>
  );
}

/** Phones and reduced motion: a native swipe carousel with snap points. */
function SwipeShowcase() {
  return (
    <section aria-label="An evening at Ember & Oak" className="py-24">
      <Intro mobile />
      <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
        {slides.map((s) => (
          <SlideCard key={s.title} slide={s} mobile />
        ))}
      </div>
    </section>
  );
}

export function Showcase() {
  const desktop = useMediaQuery("(min-width: 768px)");
  const reduce = useReducedMotion();
  return desktop && !reduce ? <PinnedShowcase /> : <SwipeShowcase />;
}
