"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { Embers } from "./Atmosphere";

/** Full-screen procedural fire: a glowing charcoal bed with flames licking upwards. */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float x = uv.x * uAspect;

    // Flames: domain-warped noise scrolling upwards, strongest at the bottom.
    vec2 q = vec2(x * 2.4, uv.y * 2.2 - uTime * 1.35);
    float warp = fbm(q * 0.8 + vec2(0.0, uTime * 0.25));
    float n = fbm(q + warp * 1.6);
    float height = 0.36 * uIntensity;
    float flame = n * 1.15 - uv.y / max(height, 0.001) + 0.35;
    flame = clamp(flame, 0.0, 1.0) * smoothstep(0.0, 0.25, uIntensity);

    vec3 col = vec3(0.0);
    col = mix(col, vec3(0.55, 0.05, 0.0), smoothstep(0.02, 0.3, flame));
    col = mix(col, vec3(1.0, 0.38, 0.02), smoothstep(0.25, 0.6, flame));
    col = mix(col, vec3(1.0, 0.82, 0.45), smoothstep(0.6, 0.95, flame));
    float alpha = smoothstep(0.02, 0.35, flame);

    // Charcoal bed: dark lumps with pulsing orange cracks.
    float bed = smoothstep(0.17, 0.0, uv.y);
    float coal = fbm(vec2(x * 9.0, uv.y * 12.0));
    float cracks = pow(smoothstep(0.45, 0.85, fbm(vec2(x * 16.0, uv.y * 20.0) + uTime * 0.15)), 2.0);
    vec3 coalCol = mix(vec3(0.05, 0.035, 0.03), vec3(0.16, 0.12, 0.1), coal);
    coalCol += vec3(1.0, 0.35, 0.05) * cracks * (0.7 + 0.3 * sin(uTime * 2.0 + x * 7.0)) * uIntensity;
    col = mix(col, coalCol + col * 0.6, bed);
    alpha = max(alpha, bed * smoothstep(0.0, 0.3, uIntensity));

    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

type Uniforms = Record<string, THREE.IUniform>;
function setU(u: Uniforms, name: string, value: number) {
  u[name].value = value;
}

function FirePlane({ intensity }: { intensity: MotionValue<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uIntensity: { value: 1 }, uAspect: { value: 1 } }), []);

  useFrame((state) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    setU(u, "uTime", state.clock.elapsedTime);
    setU(u, "uIntensity", intensity.get());
    setU(u, "uAspect", state.size.width / state.size.height);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export default function FireCanvas({ intensity, active }: { intensity: MotionValue<number>; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: false, alpha: true }}
      frameloop={active ? "always" : "never"}
      aria-hidden
    >
      <FirePlane intensity={intensity} />
      <group position={[0, -2.6, 1]}>
        <Embers count={160} boost={intensity} />
      </group>
    </Canvas>
  );
}
