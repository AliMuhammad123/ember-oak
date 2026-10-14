"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { asset } from "@/lib/data";
import { dishById } from "@/lib/dishes";
import { money, useOrder } from "./order/OrderProvider";
import { Magnetic, ease } from "./motion";
import { INTRO_SECONDS } from "./fx/Intro";

/** Frames pulled from the burger film; scrolling scrubs through them like a video. */
const FRAMES = 96;
const LAST_FRAME_AT = 0.86; // scroll progress at which the film reaches its final frame
const FOCUS_X = 0.53; // keep the burger centred when the frame is cropped (portrait screens)
const frameSrc = (i: number, small: boolean) =>
  asset(`/images/${small ? "burger-sm" : "burger"}/${String(i + 1).padStart(3, "0")}.webp`);

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  const dx = Math.min(0, Math.max(w - dw, w / 2 - dw * FOCUS_X));
  ctx.drawImage(img, dx, (h - dh) / 2, dw, dh);
}

/** Paints the scroll-driven frame (blending neighbours for sub-frame smoothness) plus a gentle idle steam loop. */
function useFilmCanvas(progress: MotionValue<number>, active: boolean) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 767px)").matches;
    const list: HTMLImageElement[] = [];
    for (let i = 0; i < FRAMES; i++) {
      const img = new Image();
      img.decoding = "async";
      if (i < 4) img.fetchPriority = "high";
      img.src = frameSrc(i, small);
      list.push(img);
    }
    frames.current = list;
    return () => {
      for (const img of list) img.src = "";
    };
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el || !active) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = -1;
    let lastW = 0;
    const started = performance.now();

    const ready = (i: number) => {
      const img = frames.current[i];
      return img && img.complete && img.naturalWidth > 0 ? img : null;
    };
    const nearestReady = (i: number) => {
      for (let d = 0; d < FRAMES; d++) {
        const a = ready(i - d) ?? ready(i + d);
        if (a) return a;
      }
      return null;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(el.clientWidth * dpr);
      const h = Math.round(el.clientHeight * dpr);
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
      }

      const scroll = Math.min(progress.get() / LAST_FRAME_AT, 1) * (FRAMES - 1);
      // Idle: while resting at the top, rock through the first frames so the steam keeps drifting.
      const idle = (1 - Math.cos((now - started) / 1400)) * 3 * Math.max(0, 1 - scroll / 4);
      const f = Math.min(FRAMES - 1, scroll + idle);
      if (Math.abs(f - last) < 0.004 && w === lastW) return;

      const i0 = Math.floor(f);
      const a = ready(i0) ?? nearestReady(i0);
      if (!a) return;
      ctx.globalAlpha = 1;
      drawCover(ctx, a, w, h);
      const b = ready(Math.min(i0 + 1, FRAMES - 1));
      const t = f - i0;
      if (b && b !== a && t > 0.01) {
        ctx.globalAlpha = t;
        drawCover(ctx, b, w, h);
        ctx.globalAlpha = 1;
      }
      last = f;
      lastW = w;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, progress]);

  return canvas;
}

function Words({ text, delay, className = "" }: { text: string; delay: number; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", rotate: 6 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{ duration: 1, ease, delay: delay + i * 0.09 }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Still() {
  const { openDish } = useOrder();
  return (
    <section id="top" className="relative isolate flex min-h-dvh items-end overflow-hidden pb-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frameSrc(0, false)} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent" />
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <p className="eyebrow">Ember &amp; Oak · Wood-fired kitchen</p>
        <h1 className="mt-4 font-impact text-[clamp(3.6rem,12vw,10rem)] uppercase leading-[0.86]">
          Stack it <span className="text-gold-gradient">high</span>
        </h1>
        <button type="button" onClick={() => openDish("ember-smash")} className="btn btn-primary mt-8">
          Order the Ember smash <ArrowRight aria-hidden className="size-4" />
        </button>
      </div>
    </section>
  );
}

export function BurgerHero() {
  const reduce = useReducedMotion();
  if (reduce) return <Still />;
  return <FilmHero />;
}

function FilmHero() {
  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { margin: "100px 0px" });
  const { openDish } = useOrder();
  const burger = dishById("ember-smash")!;

  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 140, damping: 30, mass: 0.35 });
  const canvas = useFilmCanvas(smooth, inView);

  // Pointer parallax on the film.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const filmX = useSpring(useTransform(px, [-1, 1], [14, -14]), { stiffness: 60, damping: 20 });
  const filmY = useSpring(useTransform(py, [-1, 1], [10, -10]), { stiffness: 60, damping: 20 });
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    px.set((e.clientX / window.innerWidth) * 2 - 1);
    py.set((e.clientY / window.innerHeight) * 2 - 1);
  };

  // Act 1 — Stack it high
  const a1Opacity = useTransform(p, [0, 0.16, 0.24], [1, 1, 0]);
  const a1Y = useTransform(p, [0, 0.24], ["0vh", "-10vh"]);
  const cue = useTransform(p, [0, 0.04], [1, 0]);
  const shadeLeft = useTransform(p, [0, 0.22, 0.3, 0.72, 0.8], [1, 1, 0, 0, 1]);

  // Act 2 — Let it fly
  const a2Opacity = useTransform(p, [0.3, 0.38, 0.6, 0.68], [0, 1, 1, 0]);
  const a2Scale = useTransform(p, [0.3, 0.68], [1.35, 0.92]);
  const a2Spacing = useTransform(p, [0.3, 0.45], ["0.2em", "0em"]);

  // Act 3 — Every layer. All yours.
  const a3Opacity = useTransform(p, [0.74, 0.82], [0, 1]);
  const a3Y = useTransform(p, [0.74, 0.84], ["8vh", "0vh"]);
  const a3Pointer = useTransform(p, (v) => (v > 0.76 ? "auto" : "none"));
  const filmScale = useTransform(p, [0, 0.5, 1], [1.06, 1.12, 1.04]);

  const d = INTRO_SECONDS;

  return (
    <section
      ref={section}
      id="top"
      aria-label="Ember & Oak — the Ember smash burger"
      className="relative h-[330vh] md:h-[400vh]"
      onPointerMove={onPointerMove}
    >
      <div className="sticky top-0 h-dvh overflow-hidden bg-ink">
        {/* Film */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.25, filter: "brightness(0.3) blur(6px)" }}
          animate={{ scale: 1, filter: "brightness(1) blur(0px)" }}
          transition={{ duration: 2.4, ease, delay: d - 0.6 }}
        >
          <motion.div style={{ x: filmX, y: filmY, scale: filmScale }} className="absolute inset-0">
            {/* First frame doubles as the instant poster while the rest load. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={frameSrc(0, false)} alt="" fetchPriority="high" className="absolute inset-0 size-full object-cover" style={{ objectPosition: `${FOCUS_X * 100}% 50%` }} />
            <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
          </motion.div>
        </motion.div>

        {/* Legibility shading */}
        <motion.div
          aria-hidden
          style={{ opacity: shadeLeft }}
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,16,13,0.92),rgba(20,16,13,0.15)_55%,rgba(20,16,13,0.5)),linear-gradient(to_right,rgba(20,16,13,0.85),transparent_65%)]"
        />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />

        {/* Act 1 */}
        <motion.div style={{ opacity: a1Opacity, y: a1Y }} className="absolute inset-x-0 bottom-[12vh] z-10 mx-auto max-w-7xl px-5 md:bottom-[14vh] md:px-8">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease, delay: d + 0.2 }}
          >
            Ember &amp; Oak · Wood-fired kitchen
          </motion.p>
          <h1 className="mt-3 font-impact text-[clamp(3.8rem,13vw,11.5rem)] uppercase leading-[0.84] tracking-tight text-cream">
            <Words text="Stack it" delay={d + 0.3} />
            <br />
            <Words text="high." delay={d + 0.5} className="text-gold-gradient" />
          </h1>
          <motion.p
            className="mt-5 max-w-md text-lg text-cream/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: d + 0.9 }}
          >
            Fire-kissed burgers, live-oak grills and plates worth crossing town for.
          </motion.p>
          <motion.div
            className="mt-7 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: d + 1.05 }}
          >
            <Magnetic>
              <a href="#reserve" className="btn btn-primary">
                Reserve a table
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#menu" className="btn btn-ghost backdrop-blur-sm">
                Order online
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={{ opacity: cue }}
          aria-hidden
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs uppercase tracking-[0.3em] text-cream/70 md:flex"
        >
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d + 1.4 }}>
            Scroll
          </motion.span>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="size-4" />
          </motion.span>
        </motion.div>

        {/* Act 2 */}
        <motion.div style={{ opacity: a2Opacity, scale: a2Scale }} className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4">
          <motion.p
            aria-hidden
            style={{ letterSpacing: a2Spacing, WebkitTextStroke: "2px rgba(245,237,227,0.9)" }}
            className="text-center font-impact text-[clamp(4.5rem,20vw,18rem)] uppercase leading-[0.84] text-transparent"
          >
            Let it fly
          </motion.p>
        </motion.div>

        {/* Act 3 */}
        <motion.div
          style={{ opacity: a3Opacity, y: a3Y, pointerEvents: a3Pointer }}
          className="absolute inset-x-0 bottom-[10vh] z-10 mx-auto max-w-7xl px-5 md:px-8"
        >
          <h2 className="font-impact text-[clamp(3.2rem,9vw,8rem)] uppercase leading-[0.86] text-cream">
            Every layer.
            <br />
            <span className="text-gold-gradient">All yours.</span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-cream/80">{burger.description}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => openDish(burger.id)} className="btn btn-primary">
              Order the {burger.name} · {money(burger.price)} <ArrowRight aria-hidden className="size-4" />
            </button>
            <a href="#menu" className="btn btn-ghost backdrop-blur-sm">
              See the full menu
            </a>
          </div>
        </motion.div>

        {/* Film progress */}
        <div aria-hidden className="absolute inset-x-5 bottom-3 z-10 h-px bg-cream/10 md:inset-x-8">
          <motion.div style={{ scaleX: p }} className="h-full origin-left bg-gold" />
        </div>
      </div>
    </section>
  );
}
