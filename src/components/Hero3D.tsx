"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Box, ChevronRight } from "lucide-react";
import { local } from "@/lib/data";
import { signatures } from "@/lib/dishes";
import { money, useOrder } from "./order/OrderProvider";
import { Magnetic, ease } from "./motion";
import { INTRO_SECONDS } from "./fx/Intro";

const HeroScene = dynamic(() => import("./three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="size-48 animate-pulse rounded-full bg-gradient-to-b from-cream/10 to-transparent" />
    </div>
  ),
});

const CYCLE_MS = 6000;

export function Hero3D() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  const { openDish } = useOrder();
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % signatures.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, inView]);

  const select = (i: number) => {
    setAutoplay(false);
    setIndex(i);
  };

  const active = signatures[index];
  const introDelay = reduce ? 0 : INTRO_SECONDS; // let the curtains open first

  return (
    <section ref={ref} id="top" className="relative isolate overflow-hidden pt-28 pb-16 md:pt-32">
      {/* Atmospheric backdrop */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-20"
        initial={{ scale: 1.08 }}
        animate={reduce ? undefined : { scale: 1.2 }}
        transition={{ duration: 26, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
      >
        <Image src={local.diningRoom} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_55%,rgba(217,168,84,0.16),transparent_55%),linear-gradient(to_bottom,rgba(20,16,13,0.6),#14100d_92%)]"
      />

      <motion.div style={{ opacity: fade }} className="mx-auto max-w-7xl px-5 text-center md:px-8">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: introDelay }}
        >
          Wood-fired fine dining · Est. 2014
        </motion.p>
        <motion.h1
          className="text-gold-gradient mx-auto mt-5 max-w-4xl font-display text-5xl leading-[1.04] sm:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease, delay: introDelay + 0.1 }}
        >
          A Symphony of <br className="hidden sm:block" />
          <em>Fire</em> &amp; Flavour
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg text-stone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: introDelay + 0.5 }}
        >
          Seasonal plates cooked over live oak. Book a table by the fire, or order our kitchen&rsquo;s
          signatures to enjoy at home.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: introDelay + 0.65 }}
        >
          <Magnetic>
            <a href="#reserve" className="btn btn-primary">
              Reserve a table
            </a>
          </Magnetic>
          <Magnetic>
            <a href="#menu" className="btn btn-ghost">
              Order online
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* 3D plate */}
      <motion.div style={{ y: sceneY }} className="relative mx-auto mt-2 h-[46vh] min-h-[320px] max-w-6xl md:h-[60vh]">
        <HeroScene index={index} active={inView} still={!!reduce} scroll={scrollYProgress} entryDelay={introDelay} />
      </motion.div>

      {/* Signature selector */}
      <div className="mx-auto -mt-4 max-w-6xl px-5 md:px-8">
        <p className="sr-only" aria-live="polite">
          Showing {active.name} in 3D
        </p>
        <ul className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-auto sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {signatures.map((d, i) => {
            const selected = i === index;
            return (
              <motion.li
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease, delay: introDelay + 0.9 + i * 0.08 }}
                className={`relative flex w-[78vw] shrink-0 snap-center items-center gap-3 rounded-2xl border p-3 backdrop-blur-md transition-colors duration-300 sm:w-auto ${
                  selected ? "border-gold/70 bg-gold/10" : "border-line bg-char/70 hover:border-gold/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={selected}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left after:absolute after:inset-0 after:rounded-2xl"
                >
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/40">
                    <Image src={d.photo} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 font-display text-[1.05rem] leading-tight">{d.name}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-sm text-stone">
                      <Box aria-hidden className="size-3.5 shrink-0 text-gold" />
                      <span className={`tabular-nums ${selected ? "text-gold" : ""}`}>{money(d.price)}</span>
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => openDish(d.id)}
                  aria-label={`${d.name}: details and order`}
                  className="relative z-10 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-stone transition-colors hover:border-gold hover:text-gold"
                >
                  <ChevronRight aria-hidden className="size-5" />
                </button>
                {selected && autoplay && !reduce && (
                  <motion.span
                    key={index}
                    aria-hidden
                    className="absolute inset-x-4 bottom-0 h-px origin-left bg-gold"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                  />
                )}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
