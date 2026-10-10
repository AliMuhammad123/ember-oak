"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { MotionValue } from "motion/react";

function radialTexture(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Warm studio lighting built from light-formers, so no HDR file is downloaded. */
export function WarmLighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <spotLight position={[3, 6, 3]} angle={0.55} penumbra={1} intensity={70} color="#ffd9a0" />
      <pointLight position={[-3, 0.8, -2]} intensity={10} color="#ff4d1f" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffb366" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#ff6a3d" position={[4, 1, -3]} scale={2} />
      </Environment>
    </>
  );
}

function seedEmbers(count: number) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.4 + Math.random() * 2.6;
    positions.set([Math.cos(a) * r, -0.4 + Math.random() * 3.4, Math.sin(a) * r * 0.7], i * 3);
    speeds[i] = 0.25 + Math.random() * 0.55;
    seeds[i] = Math.random() * 100;
  }
  return { positions, speeds, seeds };
}

/** Glowing embers drifting up through the scene. */
export function Embers({
  count = 140,
  still = false,
  boost,
}: {
  count?: number;
  still?: boolean;
  /** 0–1 value (e.g. scroll progress) that makes the embers rise faster. */
  boost?: MotionValue<number>;
}) {
  const geo = useRef<THREE.BufferGeometry>(null);
  const data = useMemo(() => seedEmbers(count), [count]);
  const sprite = useMemo(
    () => radialTexture([[0, "rgba(255,240,200,1)"], [0.25, "rgba(255,150,60,0.9)"], [1, "rgba(255,80,20,0)"]]),
    [],
  );

  useFrame((state, delta) => {
    if (still || !geo.current) return;
    const p = geo.current.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    const speed = 1 + (boost?.get() ?? 0) * 2.5;
    for (let i = 0; i < count; i++) {
      let y = p.getY(i) + data.speeds[i] * delta * speed;
      let x = p.getX(i) + Math.sin(t * 0.9 + data.seeds[i]) * delta * 0.25;
      if (y > 3.2) {
        y = -0.4;
        x = (Math.random() - 0.5) * 4;
      }
      p.setXY(i, x, y);
    }
    p.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.075}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#ff9a4a"
      />
    </points>
  );
}

/** Soft steam wisps rising from the plate. */
export function Steam({ still = false }: { still?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const tex = useMemo(
    () => radialTexture([[0, "rgba(255,255,255,0.55)"], [0.5, "rgba(255,255,255,0.18)"], [1, "rgba(255,255,255,0)"]]),
    [],
  );
  const phases = useMemo(() => Array.from({ length: 9 }, (_, i) => i / 9), []);

  useFrame((state) => {
    if (!group.current) return;
    const t = still ? 0 : state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const s = child as THREE.Sprite;
      const p = (t * 0.11 + phases[i]) % 1;
      s.position.set(Math.sin(p * 3 + i * 1.7) * 0.3, 0.25 + p * 1.8, Math.cos(i * 2.3) * 0.2);
      s.scale.setScalar(0.6 + p * 1.6);
      (s.material as THREE.SpriteMaterial).opacity = Math.sin(p * Math.PI) * 0.13;
    });
  });

  return (
    <group ref={group}>
      {phases.map((p) => (
        <sprite key={p}>
          <spriteMaterial map={tex} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}
