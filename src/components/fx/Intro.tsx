"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Flame } from "lucide-react";
import { ease } from "../motion";

/** Seconds until the curtains open; hero entrances are timed after this. */
export const INTRO_SECONDS = 1.9;
const NAME = "Ember & Oak";

export function Intro() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), reduce ? 150 : INTRO_SECONDS * 1000);
    return () => window.clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {!open && (
        <motion.div
          key="intro"
          aria-hidden
          // CSS failsafe hides this even if JavaScript never runs.
          className="intro-failsafe fixed inset-0 z-[90] flex items-center justify-center"
          exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.75 } }}
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-ink"
            exit={{ y: "-100%", transition: { duration: 0.9, ease } }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
            exit={{ y: "100%", transition: { duration: 0.9, ease } }}
          />
          <motion.div
            className="relative text-center"
            exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)", transition: { duration: 0.35 } }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: [0, 1.25, 1], rotate: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              <Flame className="mx-auto size-12 text-ember drop-shadow-[0_0_18px_rgba(220,38,38,0.7)]" />
            </motion.div>
            <p className="text-gold-gradient mt-5 font-display text-5xl md:text-7xl" style={{ perspective: 600 }}>
              {NAME.split("").map((c, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  style={{ transformOrigin: "50% 100%" }}
                  initial={{ opacity: 0, y: 40, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.7, ease }}
                >
                  {c === " " ? " " : c}
                </motion.span>
              ))}
            </p>
            <div className="mx-auto mt-6 h-px w-40 overflow-hidden bg-line">
              <motion.div
                className="h-full origin-left bg-gold"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: INTRO_SECONDS - 0.2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
