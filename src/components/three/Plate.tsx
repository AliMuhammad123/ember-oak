"use client";

import { forwardRef, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";

export const FOOD_RADIUS = 1.06;

/** Porcelain plate profile (radius, height) revolved around Y. */
function makePlateGeometry() {
  const profile: [number, number][] = [
    [0, -0.02], [0.85, -0.02], [0.9, 0], [1.3, 0.04], [1.6, 0.15], [1.66, 0.19],
    [1.62, 0.205], [1.5, 0.175], [1.25, 0.09], [1.05, 0.06], [0, 0.06],
  ];
  return new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 128);
}

/** A gently domed disc with planar UVs, so a top-down photo reads as food with some volume. */
function makeFoodGeometry() {
  const g = new THREE.RingGeometry(0, FOOD_RADIUS, 128, 32);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i)) / FOOD_RADIUS;
    pos.setZ(i, 0.13 * Math.pow(Math.max(0, 1 - r * r), 0.7));
  }
  g.rotateX(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/** Radial alpha mask so the food edge melts into the plate instead of looking like a sticker. */
export function makeEdgeMask() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.86, "#fff");
  g.addColorStop(1, "#000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/** Crop a square photo in towards its centre. */
export function prepareFoodTexture(t: THREE.Texture, zoom: number) {
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.repeat.set(1 / zoom, 1 / zoom);
  t.offset.set((1 - 1 / zoom) / 2, (1 - 1 / zoom) / 2);
  t.needsUpdate = true;
}

type PlateProps = ThreeElements["group"] & {
  /** Top-down food photo laid in the well; omit when a 3D dish model sits on the plate. */
  texture?: THREE.Texture;
  zoom?: number;
  foodMaterialRef?: React.Ref<THREE.MeshStandardMaterial>;
};

export const Plate = forwardRef<THREE.Group, PlateProps>(function Plate(
  { texture, zoom, foodMaterialRef, ...props },
  ref,
) {
  const plateGeo = useMemo(makePlateGeometry, []);
  const foodGeo = useMemo(makeFoodGeometry, []);
  const mask = useMemo(makeEdgeMask, []);

  useLayoutEffect(() => {
    if (texture) prepareFoodTexture(texture, zoom ?? 1);
  }, [texture, zoom]);

  return (
    <group ref={ref} {...props}>
      <mesh geometry={plateGeo} receiveShadow>
        <meshPhysicalMaterial
          color="#f2ede6"
          roughness={0.32}
          clearcoat={1}
          clearcoatRoughness={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Gold rim */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.615, 0.012, 12, 160]} />
        <meshStandardMaterial color="#d9a854" metalness={1} roughness={0.22} />
      </mesh>
      {texture && (
        <mesh geometry={foodGeo} position={[0, 0.062, 0]}>
          <meshStandardMaterial
            ref={foodMaterialRef}
            map={texture}
            alphaMap={mask}
            transparent
            roughness={0.55}
          />
        </mesh>
      )}
      {props.children}
    </group>
  );
});
