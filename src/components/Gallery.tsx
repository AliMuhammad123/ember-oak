"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { gallery } from "@/lib/data";
import { ImageReveal, SectionHeading } from "./motion";

/** Photo that tilts back in depth as it enters, flattens at centre, and tilts forward as it leaves. */
function DepthPhoto({ g, delay }: { g: (typeof gallery)[number]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [0, 0, 0] : [22, 0, -22]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [0.88, 1, 0.88]);

  return (
    <motion.div ref={ref} style={{ rotateX, scale, transformPerspective: 1100 }}>
      <ImageReveal delay={delay} className={`relative overflow-hidden rounded-2xl ${g.ratio}`}>
        <Image
          src={g.src}
          alt={g.alt}
          fill
          sizes="(min-width: 768px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out hover:scale-105"
        />
      </ImageReveal>
    </motion.div>
  );
}

function Column({ items, y }: { items: typeof gallery; y: MotionValue<number> }) {
  return (
    <motion.div style={{ y }} className="flex flex-col gap-4 md:gap-6">
      {items.map((g, i) => (
        <DepthPhoto key={g.src} g={g} delay={i * 0.1} />
      ))}
    </motion.div>
  );
}

export function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const range = reduce ? 0 : 1;
  const y1 = useTransform(scrollYProgress, [0, 1], [40 * range, -40 * range]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-30 * range, 60 * range]);
  const y3 = useTransform(scrollYProgress, [0, 1], [60 * range, -60 * range]);

  return (
    <section id="gallery" className="overflow-hidden py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow="Gallery" title="Evenings at Ember & Oak" align="center">
          The room, the terrace and the plates — come see it in person.
        </SectionHeading>

        <div ref={ref} className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          <Column items={gallery.slice(0, 2)} y={y1} />
          <Column items={gallery.slice(2, 4)} y={y2} />
          <div className="hidden md:block">
            <Column items={gallery.slice(4, 6)} y={y3} />
          </div>
        </div>
      </div>
    </section>
  );
}
