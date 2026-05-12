'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export default function CinematicOverlays() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      {/* Cinematic Letterboxing */}
      <div className="fixed top-0 left-0 w-full h-[5vh] bg-black z-[100] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-full h-[5vh] bg-black z-[100] pointer-events-none" />
      
      {/* Video Style Timeline Progress */}
      <div className="fixed bottom-[5.5vh] left-10 right-10 h-[2px] bg-white/10 z-[101] pointer-events-none">
         <motion.div 
           className="h-full bg-primary shadow-[0_0_10px_#ffc0cb]"
           style={{ scaleX, originX: 0 }}
         />
         <div className="absolute top-[-10px] left-0 text-[8px] font-mono text-primary/50 uppercase tracking-widest">
            00:00:00
         </div>
         <div className="absolute top-[-10px] right-0 text-[8px] font-mono text-primary/50 uppercase tracking-widest">
            00:01:00
         </div>
      </div>

      {/* Camera Info HUD (Minimalist) */}
      <div className="fixed top-[7vh] right-10 text-[10px] font-mono text-primary/60 uppercase tracking-[0.2em] z-[101] pointer-events-none text-right">
         <div>ISO 800</div>
         <div>f/2.8</div>
         <div>1/60</div>
      </div>
    </>
  );
}
