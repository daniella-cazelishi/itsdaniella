'use client';

import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { Suspense, useState, useEffect } from 'react';
import Scene3D from '@/components/3d/Scene3D';
import * as THREE from 'three';
import { useLenis } from 'lenis/react';

export default function Scene() {
  const [fov, setFov] = useState(35);

  useEffect(() => {
    const handleResize = () => {
      setFov(window.innerWidth < 768 ? 50 : 35);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene3D />
          
          <EffectComposer enableNormalPass={false}>
            <Bloom 
              luminanceThreshold={0.5} 
              mipmapBlur 
              intensity={1.5} 
              radius={0.4} 
            />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={0.5} />
            <ChromaticAberration offset={new THREE.Vector2(0.004, 0.004)} />
          </EffectComposer>
          
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
