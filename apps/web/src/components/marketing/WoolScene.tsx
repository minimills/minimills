'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface FiberParticlesProps {
  scrollProgress: number;
}

function FiberParticles({ scrollProgress }: FiberParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000;

  // Stage positions: raw wool (chaotic cloud) → processed (flowing strands) → finished yarn (tight helix)
  const [rawPositions, processedPositions, yarnPositions] = useMemo(() => {
    const raw = new Float32Array(count * 3);
    const proc = new Float32Array(count * 3);
    const yarn = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Raw: chaotic wool clump
      const r = 2.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      raw[i3]     = r * Math.sin(phi) * Math.cos(theta);
      raw[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      raw[i3 + 2] = r * Math.cos(phi) * 0.5;

      // Processed: flat disc with radial fibers
      const angle = (i / count) * Math.PI * 2 * 8;
      const radius = 0.5 + (i / count) * 2.8;
      proc[i3]     = Math.cos(angle) * radius;
      proc[i3 + 1] = (Math.random() - 0.5) * 0.3;
      proc[i3 + 2] = Math.sin(angle) * radius;

      // Yarn: tight double helix
      const t = (i / count) * Math.PI * 2 * 12;
      const r2 = 0.4 + Math.cos(t * 0.1) * 0.1;
      yarn[i3]     = Math.cos(t) * r2;
      yarn[i3 + 1] = (t / (Math.PI * 24)) * 8 - 4;
      yarn[i3 + 2] = Math.sin(t) * r2;
    }
    return [raw, proc, yarn];
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    // Interpolate between stages based on scrollProgress
    const p = scrollProgress;
    const t1 = Math.min(p * 2, 1);         // raw → processed (0→0.5)
    const t2 = Math.max((p - 0.5) * 2, 0); // processed → yarn (0.5→1)

    const src = t2 > 0 ? processedPositions : rawPositions;
    const dst = t2 > 0 ? yarnPositions : processedPositions;
    const t   = t2 > 0 ? t2 : t1;

    for (let i = 0; i < count * 3; i++) {
      positions[i] = lerp(src[i], dst[i], t);
    }

    const geo = pointsRef.current.geometry;
    (geo.attributes.position as THREE.BufferAttribute).array.set(positions);
    geo.attributes.position.needsUpdate = true;

    // Gentle rotation
    pointsRef.current.rotation.y += delta * 0.15;
  });

  return (
    <Points ref={pointsRef} positions={rawPositions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={scrollProgress < 0.5 ? '#C4862B' : '#2C4577'}
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
      />
    </Points>
  );
}

function AmbientRing({ scrollProgress }: FiberParticlesProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.3;
    meshRef.current.rotation.z += delta * 0.2;
    meshRef.current.scale.setScalar(1 + scrollProgress * 0.5);
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[3.5, 0.015, 8, 120]} />
      <meshBasicMaterial color="#2C4577" opacity={0.15} transparent />
    </mesh>
  );
}

function Scene({ scrollProgress }: FiberParticlesProps) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 8);
  }, [camera]);

  useFrame(() => {
    // Gentle camera drift
    (camera as THREE.PerspectiveCamera).position.y = lerp(
      (camera as THREE.PerspectiveCamera).position.y,
      scrollProgress * -1.5,
      0.02
    );
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#C4862B" />
      <pointLight position={[-5, -5, 3]} intensity={0.5} color="#2C4577" />
      <FiberParticles scrollProgress={scrollProgress} />
      <AmbientRing scrollProgress={scrollProgress} />
    </>
  );
}

interface WoolSceneProps {
  scrollProgress: number;
}

export function WoolScene({ scrollProgress }: WoolSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <Scene scrollProgress={scrollProgress} />
    </Canvas>
  );
}
