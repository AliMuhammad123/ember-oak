"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { local } from "@/lib/data";
import { Magnetic } from "./motion";

const LINE = "Low light, warm oak and the hiss of the grill — evenings here are meant to linger.";

function Word({ word, index, total, progress }: { word: string; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const opacity = useTransform(progress, [start, start + 1 / total], [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  );
}

export function ExperienceBand() {
  const section = useRef<HTMLElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-12%", "12%"]);
  const { scrollYProgress: reveal } = useScroll({ target: text, offset: ["start 0.85", "end 0.5"] });
  const words = LINE.split(" ");

  return (
    <section ref={section} className="relative isolate flex min-h-[90dvh] items-center overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[15%] -z-10">
        <Image
          src={local.interiorLamps}
          alt="Pendant lamps glowing over a dining room with an open kitchen"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-ink/70" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,#14100d_85%)]" />

      <div className="mx-auto max-w-5xl px-5 py-28 text-center md:px-8">
        <p className="eyebrow">The room</p>
        <p ref={text} className="mt-6 font-display text-4xl leading-tight text-balance md:text-6xl">
          {reduce
            ? LINE
            : words.map((w, i) => <Word key={i} word={w} index={i} total={words.length} progress={reveal} />)}
        </p>
        <div className="mt-12">
          <Magnetic>
            <a href="#reserve" className="btn btn-primary">
              Reserve your evening
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
