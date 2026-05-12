'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 1000);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[10000] bg-background flex flex-col items-center justify-center p-6"
        >
          <div className="flex flex-col items-center gap-12 w-full max-w-xs">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center"
            >
              <h1 className="text-3xl font-bold tracking-tighter mb-2">itsdaniella<span className="text-primary">.</span></h1>
              <p className="text-[10px] uppercase tracking-[0.5em] opacity-40">Interactive Portfolio</p>
            </motion.div>

            <div className="w-full h-[1px] bg-primary/10 relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_rgba(255,192,203,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between w-full text-[10px] uppercase tracking-widest font-mono opacity-40">
              <span>Initializing...</span>
              <span>{Math.floor(progress)}%</span>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-20 text-[8px] uppercase tracking-[0.3em] opacity-20 text-center"
          >
            Optimized for High Fidelity Environments
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
