"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { images, local } from "@/lib/data";
import { ImageReveal, Reveal, SectionHeading, ease } from "./motion";

function Counter({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const format = (v: number) => v.toFixed(decimals) + suffix;

  useEffect(() => {
    const el = ref.current;
    if (!inView || !el) return;
    if (reduce) {
      el.textContent = format(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease,
      onUpdate: (v) => (el.textContent = format(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, to]);

  return (
    <>
      <span ref={ref} aria-hidden className="tabular-nums">
        {format(0)}
      </span>
      <span className="sr-only">{format(to)}</span>
    </>
  );
}

const stats = [
  { to: 12, suffix: "h", label: "Low and slow smoke on our ribs" },
  { to: 40, suffix: "+", label: "Local farms and fishers we buy from" },
  { to: 4.9, decimals: 1, label: "Average guest rating" },
];

export function Story() {
  return (
    <section id="story" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
      <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="relative grid grid-cols-5 gap-4">
          <ImageReveal className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src={images.chef}
              alt="Chef chopping fresh herbs on a white board"
              fill
              sizes="(min-width: 1024px) 30vw, 60vw"
              className="object-cover"
            />
          </ImageReveal>
          <ImageReveal delay={0.2} className="relative col-span-2 mt-24 aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src={local.platedService}
              alt="A plated fish course being served at a candlelit table"
              fill
              sizes="(min-width: 1024px) 20vw, 40vw"
              className="object-cover"
            />
          </ImageReveal>
        </div>

        <div>
          <SectionHeading
            eyebrow="Our story"
            title={
              <>
                Cooked over oak, <em className="text-gold">the way it used to be.</em>
              </>
            }
          >
            Ember &amp; Oak started as a single wood-fired oven and a stubborn idea: that the
            best food is honest food. A decade on, every plate still passes through the fire —
            seasoned with smoke, finished with care.
          </SectionHeading>

          <Reveal delay={0.1}>
            <p className="mt-5 text-lg text-stone">
              We work with small farms within a hundred miles, change the menu with the seasons,
              and let the embers do the rest.
            </p>
          </Reveal>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-line pt-10">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={0.1 * i}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-4xl text-cream md:text-5xl">
                  <Counter to={s.to} decimals={s.decimals} suffix={s.suffix} />
                </dd>
                <dd aria-hidden className="mt-2 text-sm leading-snug text-stone">
                  {s.label}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
