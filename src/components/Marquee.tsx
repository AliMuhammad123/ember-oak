"use client";

import { useState } from "react";
import { Pause, Play, Sparkle } from "lucide-react";
import { signatures } from "@/lib/data";

export function Marquee() {
  const [paused, setPaused] = useState(false);

  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {signatures.map((s) => (
        <li key={s} className="flex items-center gap-8 pr-8 font-display text-2xl italic text-cream/90 md:text-3xl">
          {s}
          <Sparkle aria-hidden className="size-4 fill-ember text-ember" />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Signature dishes" className="relative border-y border-line bg-char py-6">
      <div className="overflow-hidden">
        <div className="marquee-track flex w-max" data-paused={paused}>
          {row(false)}
          {row(true)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Play scrolling dishes" : "Pause scrolling dishes"}
        className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-ink/80 text-stone transition-colors hover:text-cream"
      >
        {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
      </button>
    </section>
  );
}
