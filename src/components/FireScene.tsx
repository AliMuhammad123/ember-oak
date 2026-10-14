"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, Flame } from "lucide-react";
import { asset } from "@/lib/data";
import { dishById } from "@/lib/dishes";
import { money, useOrder } from "./order/OrderProvider";

const FireCanvas = dynamic(() => import("./three/FireCanvas"), { ssr: false });

const DARK = "#120b07";
const CREAM = "#ece2d2";
const SKEWERS = asset("/images/fire/skewers.webp");
const ROUND = asset("/images/round-skewers.jpg");

/** Ingredient pieces cut from the real skewers photo. x/y are vw/vh offsets from the centre. */
const PIECES = [
  { src: "beef-1", size: 13, from: [-14, -6], to: [-36, 30], spin: 300, front: true },
  { src: "chicken-1", size: 13, from: [-4, -12], to: [-12, 33], spin: -220, front: false },
  { src: "pepper-1", size: 12, from: [-10, 2], to: [-24, 36], spin: 180, front: true },
  { src: "beef-3", size: 10, from: [10, -16], to: [31, 31], spin: -320, front: false },
  { src: "beef-4", size: 14, from: [12, -4], to: [16, 35], spin: 240, front: true },
  { src: "pepper-2", size: 12, from: [14, 4], to: [41, 36], spin: -160, front: true },
  { src: "chicken-2", size: 14, from: [0, 6], to: [2, 37], spin: 200, front: false },
  { src: "beef-5", size: 14, from: [16, 10], to: [-2, 31], spin: -280, front: true },
  { src: "beef-2", size: 14, from: [-6, 10], to: [-44, 37], spin: 260, front: false },
  { src: "beef-6", size: 13, from: [8, 16], to: [27, 37], spin: -240, front: true },
] as const;

const FALL_START = 0.35;
const FALL_END = 0.62;

function Piece({ piece, index, p }: { piece: (typeof PIECES)[number]; index: number; p: MotionValue<number> }) {
  // Each piece leaves a little later than the last, so they tumble rather than drop as one.
  const t0 = FALL_START + index * 0.012;
  const t1 = FALL_END + index * 0.008;
  const x = useTransform(p, [t0, t1], [`${piece.from[0]}vw`, `${piece.to[0]}vw`]);
  // Gravity: slow at first, then fast.
  const y = useTransform(p, [t0, t0 + (t1 - t0) * 0.35, t1], [`${piece.from[1]}vh`, `${piece.from[1] + 6}vh`, `${piece.to[1]}vh`]);
  const rotate = useTransform(p, [t0, t1], [0, piece.spin]);
  const opacity = useTransform(p, [t0 - 0.02, t0, 0.76, 0.82], [0, 1, 1, 0]);
  const scale = useTransform(p, [t0, t1, 0.76, 0.82], [0.8, 1, 1, 0.6]);

  return (
    <motion.img
      src={asset(`/images/fire/${piece.src}.webp`)}
      alt=""
      draggable={false}
      className="pointer-events-none absolute left-1/2 top-1/2 h-auto select-none drop-shadow-[0_18px_22px_rgba(0,0,0,0.35)]"
      style={{
        width: `clamp(64px, ${piece.size}vmin, 190px)`,
        x,
        y,
        rotate,
        opacity,
        scale,
        translateX: "-50%",
        translateY: "-50%",
        zIndex: piece.front ? 30 : 10,
        maskImage: "radial-gradient(closest-side, #000 72%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(closest-side, #000 72%, transparent 100%)",
      }}
    />
  );
}

function Headline({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`font-impact uppercase leading-[0.86] tracking-tight ${className}`}>{children}</h2>;
}

/** Static version for reduced motion: one frame of the story, no scroll choreography. */
function StillScene() {
  const { openDish } = useOrder();
  return (
    <section aria-label="Born in fire" className="relative overflow-hidden py-24" style={{ background: DARK }}>
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:grid-cols-2 md:px-8">
        <div>
          <Headline className="text-[clamp(3.5rem,11vw,9rem)] text-cream">Born in fire</Headline>
          <p className="mt-4 text-lg text-stone">Real charcoal. Fierce flavour.</p>
          <button type="button" onClick={() => openDish("ember-skewers")} className="btn btn-primary mt-8">
            Order the skewers <ArrowRight aria-hidden className="size-4" />
          </button>
        </div>
        <Image src={SKEWERS} alt="Beef and chicken skewers with peppers and onion" width={1041} height={796} className="h-auto w-full" />
      </div>
    </section>
  );
}

export function FireScene() {
  const reduce = useReducedMotion();
  if (reduce) return <StillScene />;
  return <ScrollScene />;
}

function ScrollScene() {
  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { margin: "200px 0px" });
  const { openDish } = useOrder();
  const skewers = dishById("ember-skewers")!;
  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end end"] });

  // Scene colour: dark fire → cream "let it fall" → dark finale.
  const bg = useTransform(p, [0, 0.33, 0.4, 0.7, 0.78, 1], [DARK, DARK, CREAM, CREAM, DARK, DARK]);
  const fire = useTransform(p, [0, 0.26, 0.38], [1, 1, 0]);
  const fireOpacity = useTransform(p, [0.3, 0.4], [1, 0]);

  // Act 1 — Born in fire
  const a1Opacity = useTransform(p, [0, 0.22, 0.3], [1, 1, 0]);
  const a1Y = useTransform(p, [0, 0.3], ["0vh", "-8vh"]);
  const skY = useTransform(p, [0, 0.3, 0.36], ["2vh", "8vh", "12vh"]);
  const skRotate = useTransform(p, [0, 0.36], [-8, 6]);
  const skScale = useTransform(p, [0, 0.3, 0.37], [0.92, 1.04, 1.12]);
  const skOpacity = useTransform(p, [0.33, 0.37], [1, 0]);
  const skGlow = useTransform(p, [0, 0.3], [0.15, 0.5]);
  const skFilter = useTransform(skGlow, (g) => `drop-shadow(0 0 ${40 * g}px rgba(255,120,30,${g * 0.7}))`);

  // Act 2 — Let it fall
  const a2Opacity = useTransform(p, [0.37, 0.43, 0.68, 0.74], [0, 1, 1, 0]);
  const a2Scale = useTransform(p, [0.37, 0.5, 0.74], [1.25, 1, 0.94]);
  const a2Spacing = useTransform(p, [0.37, 0.5], ["0.12em", "-0.01em"]);

  // Act 3 — All heat. All yours.
  const a3Opacity = useTransform(p, [0.78, 0.85], [0, 1]);
  const a3Y = useTransform(p, [0.78, 0.88], ["6vh", "0vh"]);
  const plateScale = useTransform(p, [0.76, 0.9], [0.55, 1]);
  const plateRotate = useTransform(p, [0.76, 1], [-35, 10]);
  const plateOpacity = useTransform(p, [0.76, 0.84], [0, 1]);
  const progress = useTransform(p, [0, 1], [0, 1]);
  const a3Pointer = useTransform(p, (v) => (v > 0.8 ? "auto" : "none"));

  return (
    <section ref={section} aria-label="Born in fire — the Ember mixed skewers" className="relative h-[420vh]">
      <motion.div style={{ backgroundColor: bg }} className="sticky top-0 h-dvh overflow-hidden">
        {/* Live fire */}
        <motion.div style={{ opacity: fireOpacity }} className="pointer-events-none absolute inset-0 z-[15]">
          <FireCanvas intensity={fire} active={inView} />
        </motion.div>

        {/* Act 1 */}
        <motion.div style={{ opacity: a1Opacity, y: a1Y }} className="absolute inset-x-0 top-[12vh] z-20 mx-auto max-w-7xl px-5 md:px-8">
          <p className="eyebrow flex items-center gap-2">
            <Flame aria-hidden className="size-4 text-ember" /> Ember mixed skewers
          </p>
          <Headline className="mt-3 text-[clamp(3.6rem,13vw,11rem)] text-cream">
            Born <span className="text-ember">in</span> fire
          </Headline>
          <p className="mt-4 max-w-sm text-lg text-stone">Real charcoal. Fierce flavour. Turned by hand over live oak.</p>
        </motion.div>

        <motion.div
          style={{ y: skY, rotate: skRotate, scale: skScale, opacity: skOpacity, filter: skFilter }}
          className="absolute left-1/2 top-[44%] z-10 w-[min(88vw,760px)] -translate-x-1/2 -translate-y-1/2"
        >
          <Image
            src={SKEWERS}
            alt="Beef and chicken skewers with peppers and onion over the fire"
            width={1041}
            height={796}
            className="h-auto w-full select-none"
            style={{ maskImage: "linear-gradient(to bottom, #000 72%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 72%, transparent)" }}
            draggable={false}
          />
        </motion.div>

        {/* Act 2 */}
        <motion.div style={{ opacity: a2Opacity, scale: a2Scale }} className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <motion.div style={{ letterSpacing: a2Spacing }}>
            <Headline className="text-center text-[clamp(4.5rem,19vw,17rem)] text-[#1a120d]">Let it fall</Headline>
          </motion.div>
        </motion.div>
        <motion.p
          style={{ opacity: a2Opacity }}
          className="font-impact absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 -rotate-90 text-[clamp(1.5rem,3vw,2.5rem)] uppercase tracking-[0.3em] text-[#1a120d]/20 md:block"
          aria-hidden
        >
          Together
        </motion.p>
        {PIECES.map((piece, i) => (
          <Piece key={piece.src} piece={piece} index={i} p={p} />
        ))}

        {/* Act 3 */}
        <motion.div style={{ pointerEvents: a3Pointer }} className="absolute inset-0 z-40 mx-auto flex max-w-7xl flex-col justify-center gap-10 px-5 md:flex-row md:items-center md:justify-between md:px-8">
          <motion.div style={{ opacity: a3Opacity, y: a3Y }} className="max-w-xl">
            <Headline className="text-[clamp(3.4rem,10vw,8.5rem)] text-cream">
              All heat.
              <br />
              <span className="text-gold-gradient">All yours.</span>
            </Headline>
            <p className="mt-5 max-w-sm text-lg text-stone">Charred beef, smoky chicken, blistered peppers — straight off the coals.</p>
            <button type="button" onClick={() => openDish("ember-skewers")} className="btn btn-primary mt-8">
              Order the skewers · {money(skewers.price)} <ArrowRight aria-hidden className="size-4" />
            </button>
          </motion.div>

          <motion.div style={{ scale: plateScale, rotate: plateRotate, opacity: plateOpacity }} className="relative mx-auto w-[min(62vw,420px)] shrink-0 md:mx-0">
            <div className="relative aspect-square overflow-hidden rounded-full border-[10px] border-[#1b1714] shadow-[0_0_0_2px_#d9a854,0_40px_80px_rgba(0,0,0,0.6)]">
              <Image src={ROUND} alt="The Ember mixed skewers, plated" fill sizes="420px" className="object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-gold/40 bg-ink/90 px-5 py-4 backdrop-blur md:-left-16">
              <p className="font-impact text-xl uppercase tracking-wide text-cream">Your next obsession</p>
              <p className="text-sm text-gold">Ember mixed skewers · {money(skewers.price)}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Scene progress */}
        <div aria-hidden className="absolute inset-x-5 bottom-6 z-50 h-px bg-cream/10 md:inset-x-8">
          <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-ember" />
        </div>
      </motion.div>
    </section>
  );
}
