import type { NextConfig } from "next";

// GITHUB_PAGES=true builds a static site under /ember-oak for GitHub Pages.
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/ember-oak" : "";

const nextConfig: NextConfig = {
  /* config options here */
  ...(pages ? { output: "export" as const, basePath, trailingSlash: true } : { cacheComponents: true, partialPrefetching: true }),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/unsplash-loader.ts",
  },
  turbopack: {
    // A stray package-lock.json in the home folder otherwise confuses root detection.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
