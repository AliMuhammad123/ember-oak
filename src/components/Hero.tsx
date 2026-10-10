"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, Clock, MapPin, Star } from "lucide-react";
import { images } from "@/lib/data";
import { ease } from "./motion";

const words = ["Fire,", "smoke", "&", "good"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, reduce ? 1.05 : 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const wordIn = (i: number) => ({
    initial: { y: "110%" },
    animate: { y: "0%" },
    transition: { duration: 0.9, ease, delay: 0.2 + i * 0.08 },
  });

  return (
    <section ref={ref} id="top" className="relative isolate flex min-h-dvh items-end overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
        <Image
          src={images.hero}
          alt="Chef tossing a flaming pan over the wood-fired range"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="mx-auto w-full max-w-7xl px-5 pb-16 pt-36 md:px-8 md:pb-24"
      >
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Wood-fired kitchen · Est. 2014
        </motion.p>

        <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[1.05] sm:text-7xl lg:text-8xl">
          {words.map((w, i) => (
            <span key={w} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span className="inline-block" {...wordIn(i)}>
                {w}
              </motion.span>
            </span>
          ))}
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span className="inline-block italic text-gold" {...wordIn(words.length)}>
              company.
            </motion.span>
          </span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.75 }}
        >
          <p className="mt-6 max-w-xl text-lg text-stone md:text-xl">
            Seasonal plates cooked over oak embers in the heart of the city. Open for dinner
            Tuesday to Sunday, long lunches on the weekend.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a href="#reserve" className="btn btn-primary">
              Reserve a table
            </a>
            <a href="#menu" className="btn btn-ghost">
              Explore the menu
            </a>
          </div>

          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-stone">
            <li className="flex items-center gap-2">
              <Star aria-hidden className="size-4 fill-gold text-gold" />
              4.9 · 2,300+ reviews
            </li>
            <li className="flex items-center gap-2">
              <Clock aria-hidden className="size-4 text-gold" />
              Tonight from 5:00 pm
            </li>
            <li className="flex items-center gap-2">
              <MapPin aria-hidden className="size-4 text-gold" />
              48 Harbour Lane
            </li>
          </ul>
        </motion.div>
      </motion.div>

      <motion.a
        href="#menu"
        aria-label="Scroll to menu"
        className="absolute bottom-8 right-6 hidden size-12 items-center justify-center rounded-full border border-cream/30 text-cream md:flex"
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown aria-hidden className="size-5" />
      </motion.a>
    </section>
  );
}
