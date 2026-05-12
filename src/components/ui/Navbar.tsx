'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: 'circOut' }}
      className="fixed top-0 left-0 w-full z-50 px-10 py-8 flex justify-between items-center mix-blend-difference"
    >
      <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
        itsdaniella<span className="text-primary">.</span>
      </Link>
      
      <div className="hidden md:flex gap-10 items-center">
        {['About', 'Projects', 'Skills', 'Contact'].map((item) => (
          <Link 
            key={item} 
            href={`#${item.toLowerCase()}`}
            className="text-sm uppercase tracking-widest text-white/70 hover:text-white transition-colors"
          >
            {item}
          </Link>
        ))}
        <button className="px-6 py-2 glass rounded-full text-sm font-medium text-white hover:bg-white/20 transition-colors">
          Resume
        </button>
      </div>
    </motion.nav>
  );
}
