import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function FloatingDiamond({ position, scale, speed, color }: {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.rotation.x = t * 0.3;
    meshRef.current.rotation.y = t * 0.5;
    meshRef.current.rotation.z = t * 0.2;
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

function FloatingRing({ position, scale, speed }: {
  position: [number, number, number];
  scale: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.rotation.x = Math.sin(t) * 0.5;
    meshRef.current.rotation.y = t * 0.4;
  });

  return (
    <Float speed={speed * 0.8} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusGeometry args={[1, 0.08, 16, 64]} />
        <meshStandardMaterial
          color="#c9a84c"
          metalness={1}
          roughness={0.05}
          emissive="#c9a84c"
          emissiveIntensity={0.1}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 600;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#c9a84c"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function CameraRig() {
  const { camera, mouse } = useThree();

  useFrame(() => {
    camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 1.0 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene() {
  const diamonds = useMemo(() => [
    { position: [-4, 2, -3] as [number, number, number], scale: 0.4, speed: 0.6, color: '#c9a84c' },
    { position: [4, -1, -4] as [number, number, number], scale: 0.6, speed: 0.4, color: '#d4b896' },
    { position: [-3, -2, -2] as [number, number, number], scale: 0.3, speed: 0.8, color: '#c9a84c' },
    { position: [3, 3, -5] as [number, number, number], scale: 0.5, speed: 0.5, color: '#e8d5b0' },
    { position: [0, -3, -3] as [number, number, number], scale: 0.35, speed: 0.7, color: '#c9a84c' },
    { position: [-5, 0, -6] as [number, number, number], scale: 0.45, speed: 0.45, color: '#d4b896' },
    { position: [5, 1, -4] as [number, number, number], scale: 0.25, speed: 0.9, color: '#c9a84c' },
  ], []);

  const rings = useMemo(() => [
    { position: [2, 2, -4] as [number, number, number], scale: 0.8, speed: 0.5 },
    { position: [-2, -1, -3] as [number, number, number], scale: 0.6, speed: 0.7 },
    { position: [0, 1, -6] as [number, number, number], scale: 1.2, speed: 0.3 },
  ], []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#c9a84c" />
      <pointLight position={[-5, -5, 3]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 0, 2]} intensity={0.5} color="#e8d5b0" />

      <Stars radius={80} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
      <ParticleField />

      {diamonds.map((d, i) => (
        <FloatingDiamond key={i} {...d} />
      ))}
      {rings.map((r, i) => (
        <FloatingRing key={i} {...r} />
      ))}

      <CameraRig />
    </>
  );
}

export default function ThreeDScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  );
}
