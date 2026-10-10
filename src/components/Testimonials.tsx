"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, Quote, Star } from "lucide-react";
import { testimonials } from "@/lib/data";
import { SectionHeading } from "./motion";
import { useMediaQuery } from "./useMediaQuery";

const N = testimonials.length;
const STEP = 360 / N;
const AUTOPLAY_MS = 5000;
const mod = (n: number) => ((n % N) + N) % N;

/** Reviews arranged on a 3D cylinder that turns to bring each one forward. */
export function Testimonials() {
  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  const [turn, setTurn] = useState(0); // unbounded, so the ring always turns the short way
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false); // hover or keyboard focus inside

  const card = wide ? 400 : 290;
  const radius = Math.round(card / 2 / Math.tan(Math.PI / N)) + (wide ? 60 : 30);
  const active = mod(turn);

  useEffect(() => {
    if (paused || holding || reduce || !inView) return;
    const id = window.setInterval(() => setTurn((t) => t + 1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, holding, reduce, inView]);

  return (
    <section ref={section} id="reviews" className="overflow-hidden border-y border-line bg-char py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow="Kind words" title="What our guests say" align="center" />

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Guest reviews"
          onPointerEnter={() => setHolding(true)}
          onPointerLeave={() => setHolding(false)}
          onFocus={() => setHolding(true)}
          onBlur={() => setHolding(false)}
          className="relative mt-14"
        >
          <motion.div
            className="relative mx-auto h-[400px] cursor-grab touch-pan-y active:cursor-grabbing md:h-[380px]"
            style={{ perspective: 1800 }}
            onPanEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 40) setTurn((t) => t + (info.offset.x < 0 ? 1 : -1));
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d", translateZ: -radius }}
              animate={{ rotateY: -turn * STEP }}
              transition={{ type: "spring", stiffness: 60, damping: 18 }}
            >
              {testimonials.map((t, i) => {
                const isActive = i === active;
                return (
                  <figure
                    key={t.name}
                    inert={!isActive}
                    aria-hidden={!isActive}
                    className={`absolute left-1/2 top-4 flex flex-col rounded-2xl border bg-ink p-7 transition-[opacity,border-color] duration-700 ${
                      isActive ? "border-gold/50 opacity-100" : "border-line opacity-40"
                    }`}
                    style={{
                      width: card,
                      marginLeft: -card / 2,
                      transform: `rotateY(${i * STEP}deg) translateZ(${radius}px)`,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <Quote aria-hidden className="size-8 text-ember" />
                    <div className="mt-5 flex gap-1" role="img" aria-label="Rated 5 out of 5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} aria-hidden className="size-4 fill-gold text-gold" />
                      ))}
                    </div>
                    <blockquote className="mt-4 flex-1 font-display text-xl leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="mt-6">
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-stone">{t.role}</p>
                    </figcaption>
                  </figure>
                );
              })}
            </motion.div>
          </motion.div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setTurn((t) => t - 1)}
              aria-label="Previous review"
              className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-line transition-colors hover:border-gold hover:text-gold"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <div className="flex items-center gap-2" aria-hidden>
              {testimonials.map((t, i) => (
                <span
                  key={t.name}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-gold" : "w-1.5 bg-line"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTurn((t) => t + 1)}
              aria-label="Next review"
              className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-line transition-colors hover:border-gold hover:text-gold"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
            {!reduce && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                aria-label={paused ? "Resume auto-rotation" : "Pause auto-rotation"}
                className="ml-2 inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-line text-stone transition-colors hover:border-gold hover:text-gold"
              >
                {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
              </button>
            )}
          </div>
          <p className="sr-only" aria-live="polite">
            Review {active + 1} of {N}: {testimonials[active].name}
          </p>
        </div>
      </div>
    </section>
  );
}
