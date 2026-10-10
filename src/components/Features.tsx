"use client";

import type { PointerEvent, ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Award, Flame, Sprout, Wine } from "lucide-react";
import { SectionHeading, ease } from "./motion";

const features = [
  { icon: Flame, title: "Cooked over live oak", text: "Every plate passes through our wood-fired hearth — no gas, no shortcuts." },
  { icon: Sprout, title: "Sourced within 100 miles", text: "We buy whole animals and seasonal produce from 40+ local growers." },
  { icon: Wine, title: "A cellar of 300 labels", text: "Natural, old-world and small-batch wines, paired by our sommelier." },
  { icon: Award, title: "Private dining for 40", text: "A candlelit room for celebrations, with a menu built around you." },
];

function TiltCard({ children, delay, index }: { children: ReactNode; delay: number; index: number }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 220, damping: 20 });
  const glowX = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(py, [-0.5, 0.5], ["0%", "100%"]);
  const glow = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(260px circle at ${x} ${y}, rgba(217,168,84,0.18), transparent 70%)`,
  );

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: index % 2 ? 75 : -75, y: 30 }}
      whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, ease, delay }}
      style={{ perspective: 900, transformPerspective: 1000, transformOrigin: index % 2 ? "100% 50%" : "0% 50%" }}
    >
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative h-full overflow-hidden rounded-2xl border border-line bg-char p-7"
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glow }}
        />
        <div style={{ transform: "translateZ(40px)" }}>{children}</div>
      </motion.div>
    </motion.div>
  );
}

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <SectionHeading eyebrow="Why guests return" title="The Ember & Oak difference" align="center" />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <TiltCard key={f.title} delay={i * 0.12} index={i}>
            <span className="inline-flex size-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
              <f.icon aria-hidden className="size-6 text-gold" />
            </span>
            <h3 className="mt-6 font-display text-2xl leading-snug">{f.title}</h3>
            <p className="mt-3 text-stone">{f.text}</p>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
