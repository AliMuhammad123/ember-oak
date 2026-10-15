"use client";

import { useEffect, useState, type RefObject } from "react";
import { useInView } from "motion/react";
import { INTRO_SECONDS } from "./fx/Intro";

/** Calls `fn` once the browser is idle (or after `timeout` ms at the latest). */
export function whenIdle(fn: () => void, timeout = 2000) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}

/**
 * Defers mounting heavy content (WebGL scenes) until the opening animation has played and the
 * browser is idle, or earlier if the visitor scrolls close to it, so start-up stays smooth.
 */
export function useDeferredMount(ref: RefObject<Element | null>, extraDelayMs = 0) {
  const near = useInView(ref, { margin: "120% 0px", once: true });
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let cancelIdle = () => {};
    const t = window.setTimeout(
      () => (cancelIdle = whenIdle(() => setIdle(true))),
      (INTRO_SECONDS + 2.6) * 1000 + extraDelayMs,
    );
    return () => {
      window.clearTimeout(t);
      cancelIdle();
    };
  }, [extraDelayMs]);

  return near || idle;
}
