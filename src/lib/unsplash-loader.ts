"use client";

import type { ImageLoaderProps } from "next/image";

/** Let Unsplash's CDN resize images, instead of Next's optimizer downloading full-size originals. */
export default function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  // Local photos in /public are pre-sized at build time; the query only keeps srcset entries distinct.
  if (src.startsWith("/")) return `${src}?w=${width}`;
  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  return url.toString();
}
