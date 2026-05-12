'use client';

import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => {
    if (typeof window !== 'undefined') {
      const a = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); // Placeholder for Ambient Café Sound
      a.loop = true;
      return a;
    }
    return null;
  });

  const toggle = () => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.log("Audio play blocked by browser. Click anywhere first."));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      onClick={toggle}
      className="fixed bottom-32 right-12 z-50 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/30 transition-colors group pointer-events-auto"
    >
      {isPlaying ? (
        <Volume2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
      ) : (
        <VolumeX className="w-4 h-4 text-primary/40 group-hover:scale-110 transition-transform" />
      )}
      <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-lg text-primary text-[8px] uppercase tracking-widest px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
        {isPlaying ? 'Mute Café Ambiance' : 'Play Café Ambiance'}
      </span>
    </motion.button>
  );
}
