'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  Text, 
  Sparkles, 
  Environment, 
  MeshTransmissionMaterial, 
  MeshDistortMaterial,
  useTexture, 
  CameraShake,
} from '@react-three/drei';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useLenis } from 'lenis/react';

function LiquidHeart({ position, scale = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
    meshRef.current.position.y += Math.sin(t * 2) * 0.005;
  });

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0, -1, -2, -1, -2, 1);
    s.bezierCurveTo(-2, 3, 0, 4, 0, 6);
    s.bezierCurveTo(0, 4, 2, 3, 2, 1);
    s.bezierCurveTo(2, -1, 0, -1, 0, 0);
    return s;
  }, []);

  return (
    <Float speed={5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={[Math.PI, 0, 0]}>
        <extrudeGeometry args={[shape, { depth: 1, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5 }]} />
        <MeshTransmissionMaterial 
           backside
           samples={16}
           thickness={2}
           roughness={0}
           transmission={1}
           ior={1.2}
           chromaticAberration={0.05}
           anisotropy={1}
           distortion={0.5}
           distortionScale={0.5}
           temporalDistortion={0.1}
           color="#f8c8dc" 
        />
      </mesh>
    </Float>
  );
}

function FloatingCoffeeBean({ position, delay = 0 }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + delay;
    meshRef.current.position.y += Math.sin(t) * 0.01;
    meshRef.current.rotation.set(t * 0.5, t * 0.3, t * 0.2);
  });

  return (
    <mesh ref={meshRef} position={position} scale={0.4}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#6f4e37" roughness={0.4} metalness={0.2} />
      <mesh position={[0, 0, 0.9]} scale={[0.1, 0.8, 0.1]}>
        <boxGeometry />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
    </mesh>
  );
}

export default function Scene3D() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const { viewport, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null!);

  useLenis(({ progress }) => {
    setScrollProgress(progress);
  });

  useFrame((state) => {
    const offset = scrollProgress;
    
    // CINEMATIC COQUETTE JOURNEY
    const targetPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();
    let bank = 0;

    if (offset < 0.2) {
      const t = offset / 0.2;
      targetPos.set(Math.sin(t * 1.5) * 8, 4, 12 - t * 8);
      targetLookAt.set(0, 0, 0);
    } else if (offset < 0.4) {
      const t = (offset - 0.2) / 0.2;
      targetPos.set(-12, -25 - t * 10, 18);
      targetLookAt.set(5, -35, 0);
      bank = -0.3;
    } else if (offset < 0.7) {
      const t = (offset - 0.4) / 0.3;
      targetPos.set(15 * Math.cos(t * Math.PI), -85 - t * 30, 20);
      targetLookAt.set(0, -105, -5);
      bank = 0.2;
    } else {
      const t = (offset - 0.7) / 0.3;
      targetPos.set(0, -145 - t * 40, 25);
      targetLookAt.set(0, -185, -20);
    }

    state.camera.position.lerp(targetPos, 0.04);
    camera.lookAt(targetLookAt);
    state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, bank + (state.mouse.x * 0.1), 0.05);

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.mouse.x * 0.1, 0.05);
    }
  });

  return (
    <>
      <Environment preset="night" />
      <fog attach="fog" args={['#120908', 10, 60]} />
      <color attach="background" args={['#120908']} />

      <group ref={groupRef}>
        <Sparkles count={800} scale={50} size={3} speed={0.6} color="#f8c8dc" />
        
        {/* HERO: LIQUID HEART + BOLD TYPOGRAPHY */}
        <group position={[0, 0, 0]}>
          <LiquidHeart position={[0, -2, -5]} scale={1.5} />
          <Text
            fontSize={viewport.width / 6}
            color="#fbcce1"
            font="https://fonts.gstatic.com/s/philosopher/v19/v17VN2Sb6958GZ596i6LSe9V.ttf"
            textAlign="center"
            position={[0, 0, 2]}
          >
            sipwithdaniella
            <meshStandardMaterial emissive="#fbcce1" emissiveIntensity={5} toneMapped={false} />
          </Text>
        </group>

        {/* SECTION: COFFEE ZEN */}
        <group position={[0, -35, 0]}>
           {[...Array(20)].map((_, i) => (
             <FloatingCoffeeBean key={i} position={[Math.sin(i) * 15, Math.cos(i) * 10 - (i * 2), Math.sin(i * 2) * 8]} delay={i} />
           ))}
           <Text
              fontSize={4}
              color="#2d1b1a"
              font="https://fonts.gstatic.com/s/philosopher/v19/v17VN2Sb6958GZ596i6LSe9V.ttf"
              textAlign="center"
           >
              COFFEE & CODE
              <MeshTransmissionMaterial thickness={1} ior={1.2} color="#f8c8dc" />
           </Text>
        </group>

        {/* SECTION: THE ROASTS (PROJECTS) */}
        <group position={[0, -105, 0]}>
           {[...Array(6)].map((_, i) => (
             <group key={i} position={[(i % 2 ? 1 : -1) * 12, -(i * 15), 0]}>
                <mesh>
                   <torusKnotGeometry args={[4, 1, 128, 32]} />
                   <MeshTransmissionMaterial backside thickness={2} roughness={0.1} color="#f8c8dc" transmission={1} />
                </mesh>
                <Text position={[0, 0, 5]} fontSize={1.5} color="#6f4e37" font="https://fonts.gstatic.com/s/philosopher/v19/v17VN2Sb6958GZ596i6LSe9V.ttf">
                   SHOT {i+1}
                </Text>
             </group>
           ))}
        </group>

        {/* FINAL: COQUETTE INFINITY */}
        <group position={[0, -185, -20]}>
           <mesh scale={50}>
             <sphereGeometry args={[1, 64, 64]} />
             <MeshDistortMaterial speed={2} distort={0.4} color="#f8c8dc" emissive="#f8c8dc" emissiveIntensity={0.2} transparent opacity={0.5} />
           </mesh>
           <Text fontSize={3} color="#2d1b1a" position={[0, 0, 10]} font="https://fonts.gstatic.com/s/philosopher/v19/v17VN2Sb6958GZ596i6LSe9V.ttf">
              SWEET GOODBYES
           </Text>
        </group>
      </group>

      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#fff5f0" />
    </>
  );
}
