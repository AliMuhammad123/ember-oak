"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useTexture } from "@react-three/drei";
import { RotateCcw, RotateCw } from "lucide-react";
import type { Dish } from "@/lib/dishes";
import { Plate } from "./Plate";
import { Embers, Steam, WarmLighting } from "./Atmosphere";

/** Ref for a group that the rotate buttons turn in 45° steps (keyboard alternative to dragging). */
function useTurnsRef(turns: number) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const target = turns * (Math.PI / 4);
    g.rotation.y += (target - g.rotation.y) * (1 - Math.exp(-delta * 6));
  });
  return group;
}

/** Top-down photo laid in the plate's well. */
function PhotoPlate({ dish, turns, onReady }: { dish: Dish; turns: number; onReady: () => void }) {
  const texture = useTexture(dish.plate!.src);
  const group = useTurnsRef(turns);
  useEffect(onReady, [onReady]);
  return <Plate ref={group} texture={texture} zoom={dish.plate!.zoom} />;
}

export default function PlateViewer({ dish, still }: { dish: Dish; still: boolean }) {
  const [turns, setTurns] = useState(0);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);

  return (
    <div className="relative h-full w-full">
      <Canvas
        // Only re-measure on resize: re-measuring on scroll reconfigures the renderer mid-scroll.
        resize={{ scroll: false }}
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 3.3, 4.7], fov: 36 }}
        frameloop={still ? "demand" : "always"}
        className="cursor-grab active:cursor-grabbing"
        aria-label={`3D view of ${dish.name}. Drag to rotate, or use the rotate buttons.`}
        role="img"
      >
        <WarmLighting />
        <directionalLight position={[2.5, 5, 2]} intensity={1.6} color="#ffe2b8" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
        <Suspense fallback={null}>
          <PhotoPlate dish={dish} turns={turns} onReady={markReady} />
        </Suspense>
        <Steam still={still} />
        <Embers count={50} still={still} />
        <ContactShadows position={[0, -0.03, 0]} opacity={0.75} scale={6} blur={2.2} far={1.5} />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          minPolarAngle={0.15}
          maxPolarAngle={1.3}
          autoRotate={!still}
          autoRotateSpeed={0.7}
        />
      </Canvas>

      {!ready && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-stone">
          Plating your dish…
        </p>
      )}

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setTurns((t) => t - 1)}
          aria-label="Rotate dish left"
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-line bg-ink/80 text-cream backdrop-blur transition-colors hover:border-gold hover:text-gold"
        >
          <RotateCcw aria-hidden className="size-4" />
        </button>
        <span className="rounded-full bg-ink/70 px-3 py-1 text-xs text-stone backdrop-blur">Drag to rotate</span>
        <button
          type="button"
          onClick={() => setTurns((t) => t + 1)}
          aria-label="Rotate dish right"
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-line bg-ink/80 text-cream backdrop-blur transition-colors hover:border-gold hover:text-gold"
        >
          <RotateCw aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
