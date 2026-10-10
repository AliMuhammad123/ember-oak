"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useMediaQuery } from "../useMediaQuery";

const INTERACTIVE = 'a,button,[role="tab"],input,select,textarea,label,canvas';

/** Gold ring that trails the mouse and swells over interactive elements. Mouse-only; the native cursor stays. */
export function Cursor() {
  const fine = useMediaQuery("(pointer: fine)");
  const reduce = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.5 });
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);

  const enabled = fine && !reduce;

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setHover(!!(e.target as Element | null)?.closest?.(INTERACTIVE));
    };
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: rx, y: ry }}
        animate={{
          scale: down ? 0.8 : hover ? 1.9 : 1,
          backgroundColor: hover ? "rgba(217,168,84,0.12)" : "rgba(217,168,84,0)",
          borderColor: hover ? "rgba(217,168,84,0.9)" : "rgba(217,168,84,0.55)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-5 -mt-5 size-10 rounded-full border"
      />
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-1 -mt-1 size-2 rounded-full bg-ember shadow-[0_0_12px_3px_rgba(255,110,40,0.7)]"
      />
    </>
  );
}
