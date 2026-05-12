'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function CameraHUD() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour12: false }));
    };
    const interval = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] p-10 flex flex-col justify-between">
      {/* HUD Corners */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-primary/40" />
      <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-primary/40" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-primary/40" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-primary/40" />

      {/* Top HUD */}
      <div className="flex justify-between items-start text-[10px] uppercase tracking-[0.3em] font-mono text-primary font-bold">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>REC</span>
          </div>
          <span>STBY</span>
        </div>
        <div className="text-right">
          <div>4K 60FPS</div>
          <div className="opacity-60">ISO 400</div>
        </div>
      </div>

      {/* Middle HUD (Optional Crosshair) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-20">
         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary" />
         <div className="absolute top-0 left-1/2 w-[1px] h-full bg-primary" />
      </div>

      {/* Bottom HUD */}
      <div className="flex justify-between items-end text-[10px] uppercase tracking-[0.3em] font-mono text-primary font-bold">
        <div className="flex flex-col gap-1">
          <span>{time}</span>
          <span className="opacity-60">MAY 12 2026</span>
        </div>
        <div className="text-right flex flex-col gap-1">
          <div className="flex items-center justify-end gap-2">
            <div className="w-12 h-3 border border-primary/30 p-[1px]">
              <div className="w-3/4 h-full bg-primary/60" />
            </div>
            <span>BATT 75%</span>
          </div>
          <span className="opacity-60 italic text-[8px]">PRO-RES 422 HQ</span>
        </div>
      </div>

      {/* Scanline Overlay */}
      <div className="fixed inset-0 scanlines opacity-30 mix-blend-overlay" />
    </div>
  );
}
