'use client';

import dynamic from 'next/dynamic';
import SceneUI from '@/components/3d/SceneUI';

const Scene = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative">
      <Scene />
      <div className="relative z-10 pointer-events-auto">
        <SceneUI />
      </div>
    </main>
  );
}
