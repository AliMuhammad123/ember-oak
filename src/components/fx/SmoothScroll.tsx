"use client";

import { useEffect } from "react";
import { useReducedMotion } from "motion/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Buttery inertia scrolling for the whole page. Off when the device asks for reduced motion. */
export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      autoRaf: true,
      anchors: { offset: -80 },
      // Let modals, drawers and the menu book's page lists scroll on their own.
      prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
    });
    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      delete window.__lenis;
    };
  }, [reduce]);

  return null;
}
