"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, useTexture } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import { heroShots } from "@/lib/dishes";
import { Embers, Steam, WarmLighting } from "./Atmosphere";

const DISSOLVE_SECONDS = 1.6;
const RIM_INNER = 0.5; // photo radius in plane units (plane is 1×1)
const RIM_OUTER = 0.6;

/**
 * Round "3D photo": each pixel shifts with the camera offset scaled by its depth, so near
 * food moves more than the background. A circular mask turns the square crop into a plate,
 * and changing dish dissolves nearest-first with a glowing ember front.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uImgA;
  uniform sampler2D uDepA;
  uniform sampler2D uImgB;
  uniform sampler2D uDepB;
  uniform vec2 uOffset;
  uniform float uMix;
  uniform float uZoom;
  uniform float uOpacity;
  varying vec2 vUv;

  vec4 layer(sampler2D img, sampler2D dep, vec2 uv) {
    float d = texture2D(dep, uv).r;
    vec2 p = uv + uOffset * (d - 0.45);
    d = texture2D(dep, p).r;
    p = uv + uOffset * (d - 0.45);
    return vec4(texture2D(img, p).rgb, d);
  }

  void main() {
    float r = length(vUv - 0.5);
    if (r > 0.5) discard;

    vec2 uv = (vUv - 0.5) / uZoom + 0.5;
    vec4 a = layer(uImgA, uDepA, uv);
    vec4 b = layer(uImgB, uDepB, uv);

    float grain = fract(sin(dot(floor(vUv * 300.0), vec2(12.9898, 78.233))) * 43758.5453);
    float edge = 1.0 - (b.a * 0.75 + grain * 0.25);
    float t = smoothstep(edge - 0.07, edge + 0.07, uMix * 1.2 - 0.1);
    vec3 col = mix(a.rgb, b.rgb, t);
    float front = (1.0 - abs(t * 2.0 - 1.0)) * step(0.001, uMix) * step(uMix, 0.999);
    col += vec3(1.0, 0.42, 0.1) * front * 0.7;

    // Shade towards the rim so the dish sits in the plate's well.
    col *= mix(1.0, 0.55, smoothstep(0.36, 0.5, r));
    float alpha = smoothstep(0.5, 0.485, r) * uOpacity;
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

type Uniforms = Record<string, THREE.IUniform>;

/** Imperative uniform writes, kept outside the component for the React compiler. */
function setU(u: Uniforms, name: string, value: unknown) {
  u[name].value = value;
}
function setLayer(u: Uniforms, which: "A" | "B", img: THREE.Texture, depth: THREE.Texture) {
  u[`uImg${which}`].value = img;
  u[`uDep${which}`].value = depth;
}

function makeShadow() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 40, 128, 128, 128);
  g.addColorStop(0, "rgba(0,0,0,0.85)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function RoundPlate({
  index,
  still,
  scroll,
  entryDelay,
}: {
  index: number;
  still: boolean;
  scroll?: MotionValue<number>;
  entryDelay: number;
}) {
  const images = useTexture(heroShots.map((s) => s.src));
  const depths = useTexture(heroShots.map((s) => s.depth));
  const shadow = useMemo(() => makeShadow(), []);
  const plate = useRef<THREE.Group>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const viewport = useThree((s) => s.viewport);
  const invalidate = useThree((s) => s.invalidate);
  const [initial] = useState(index);
  const anim = useRef({ shown: initial, target: initial, t: 1, ox: 0, oy: 0, offset: new THREE.Vector2() });

  const uniforms = useMemo(
    () => ({
      uImgA: { value: null as THREE.Texture | null },
      uDepA: { value: null as THREE.Texture | null },
      uImgB: { value: null as THREE.Texture | null },
      uDepB: { value: null as THREE.Texture | null },
      uOffset: { value: new THREE.Vector2() },
      uMix: { value: 0 },
      uZoom: { value: 1.04 },
      uOpacity: { value: 0 },
    }),
    [],
  );

  useLayoutEffect(() => {
    images.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    });
    const u = mat.current?.uniforms;
    if (!u) return;
    setLayer(u, "A", images[anim.current.shown], depths[anim.current.shown]);
    setLayer(u, "B", images[anim.current.shown], depths[anim.current.shown]);
  }, [images, depths]);

  // Reduced motion renders on demand: swap instantly.
  useEffect(() => {
    const u = mat.current?.uniforms;
    if (!still || !u) return;
    setLayer(u, "A", images[index], depths[index]);
    setLayer(u, "B", images[index], depths[index]);
    setU(u, "uMix", 0);
    setU(u, "uOpacity", 1);
    anim.current.shown = anim.current.target = index;
    invalidate();
  }, [still, index, images, depths, invalidate]);

  useFrame((state, delta) => {
    const a = anim.current;
    const u = mat.current?.uniforms;
    const g = plate.current;
    if (!u || !g) return;

    if (index !== a.target) {
      setLayer(u, "A", images[a.shown], depths[a.shown]);
      setLayer(u, "B", images[index], depths[index]);
      a.target = index;
      a.t = 0;
    }
    if (a.t < 1) {
      a.t = Math.min(1, a.t + delta / DISSOLVE_SECONDS);
      setU(u, "uMix", a.t);
      if (a.t === 1) {
        a.shown = a.target;
        setLayer(u, "A", images[a.shown], depths[a.shown]);
        setU(u, "uMix", 0);
      }
    }

    const time = state.clock.elapsedTime;
    const raw = still ? 1 : Math.min(1, Math.max(0, (time - entryDelay) / 1.8));
    const enter = 1 + 2.2 * Math.pow(raw - 1, 3) + 1.2 * Math.pow(raw - 1, 2); // ease-out-back
    const s = still ? 0 : (scroll?.get() ?? 0);
    const k = 1 - Math.exp(-delta * 2.5);

    // Depth parallax inside the photo.
    const tx = still ? 0 : state.pointer.x * 0.05 + Math.sin(time * 0.31) * 0.02;
    const ty = still ? 0 : state.pointer.y * 0.035 + Math.cos(time * 0.23) * 0.014;
    a.ox += (tx - a.ox) * k;
    a.oy += (ty - a.oy) * k;
    setU(u, "uOffset", a.offset.set(a.ox, a.oy));
    setU(u, "uZoom", 1.04 + s * 0.15 + (still ? 0 : Math.sin(time * 0.4) * 0.01));
    setU(u, "uOpacity", Math.min(1, raw * 1.5));

    // The plate itself tilts in 3D towards the mouse and away as you scroll.
    g.rotation.x += ((still ? 0 : -state.pointer.y * 0.22) + s * 0.6 - g.rotation.x) * k;
    g.rotation.y += ((still ? 0 : state.pointer.x * 0.28) - g.rotation.y) * k;
    g.rotation.z = (1 - enter) * -1.2;
    g.position.y = (still ? 0 : Math.sin(time * 0.9) * 0.04) + s * 0.25;
    g.scale.setScalar(0.6 + 0.4 * enter);
  });

  // Fit the whole plate (including rim) inside the canvas.
  const size = (Math.min(viewport.width, viewport.height) / (RIM_OUTER * 2)) * 0.94;

  return (
    <group ref={plate} scale={0.6}>
      <group scale={size}>
        {/* Soft shadow beneath the plate */}
        <mesh position={[0.03, -0.05, -0.08]}>
          <planeGeometry args={[1.6, 1.6]} />
          <meshBasicMaterial map={shadow} transparent depthWrite={false} />
        </mesh>
        {/* Dark ceramic rim */}
        <mesh position={[0, 0, -0.005]}>
          <ringGeometry args={[RIM_INNER - 0.01, RIM_OUTER, 128]} />
          <meshPhysicalMaterial color="#1b1714" roughness={0.35} clearcoat={1} clearcoatRoughness={0.15} />
        </mesh>
        {/* Gold rim edges */}
        <mesh>
          <torusGeometry args={[RIM_OUTER, 0.006, 12, 160]} />
          <meshStandardMaterial color="#d9a854" metalness={1} roughness={0.25} />
        </mesh>
        <mesh>
          <torusGeometry args={[RIM_INNER + 0.002, 0.003, 10, 160]} />
          <meshStandardMaterial color="#b88a3e" metalness={1} roughness={0.35} />
        </mesh>
        {/* The real dish photograph */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export default function HeroScene({
  index,
  active,
  still,
  scroll,
  entryDelay = 0,
}: {
  index: number;
  active: boolean;
  still: boolean;
  scroll?: MotionValue<number>;
  entryDelay?: number;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={active ? (still ? "demand" : "always") : "never"}
      aria-hidden
    >
      <WarmLighting />
      <Suspense fallback={null}>
        <RoundPlate index={index} still={still} scroll={scroll} entryDelay={entryDelay} />
      </Suspense>
      {/* Embers and steam float in front of the plate for extra depth. */}
      <group position={[0, -2, 1]}>
        <Embers still={still} boost={scroll} count={110} />
      </group>
      <group position={[0, -0.5, 1.2]}>
        <Steam still={still} />
      </group>
      <Sparkles count={40} scale={[7, 3.5, 2]} position={[0, 0, 1.2]} size={2} speed={still ? 0 : 0.3} color="#e8c27a" opacity={0.6} />
    </Canvas>
  );
}
