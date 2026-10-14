"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

const idle = (fn: () => void) =>
  typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 50);

function texturesIn(scene: THREE.Object3D) {
  const found = new Set<THREE.Texture>();
  scene.traverse((o) => {
    const mats = (o as THREE.Mesh).material;
    for (const m of Array.isArray(mats) ? mats : mats ? [mats] : []) {
      for (const v of Object.values(m)) if (v instanceof THREE.Texture) found.add(v);
      const uniforms = (m as THREE.ShaderMaterial).uniforms;
      if (uniforms) for (const u of Object.values(uniforms)) if (u.value instanceof THREE.Texture) found.add(u.value);
    }
  });
  return [...found];
}

/** Objects that own a material, so each one's shader program can be compiled on its own. */
function drawables(scene: THREE.Object3D) {
  const list: THREE.Object3D[] = [];
  scene.traverse((o) => {
    if ((o as THREE.Mesh).material) list.push(o);
  });
  return list;
}

/**
 * Uploads textures and compiles shaders ahead of time, one piece per idle slot, so the first
 * on-screen frame of an off-screen canvas doesn't freeze the page mid-scroll.
 * Mount it inside the same Suspense boundary as the content it should prepare.
 */
export function Warmup({ delay = 0 }: { delay?: number }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const textures = texturesIn(scene);
      const objects = drawables(scene);
      const step = () => {
        if (cancelled) return;
        const tex = textures.shift();
        if (tex) {
          gl.initTexture(tex);
          idle(step);
          return;
        }
        const obj = objects.shift();
        if (obj) {
          // Compiling object by object keeps each pause short instead of one long freeze.
          gl.compileAsync(obj, camera, scene).then(() => idle(step), () => idle(step));
          return;
        }
        gl.render(scene, camera);
      };
      idle(step);
    }, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [gl, scene, camera, delay]);

  return null;
}
