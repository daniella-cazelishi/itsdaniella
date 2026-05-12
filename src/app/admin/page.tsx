'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  ShieldCheck,
  Users,
  Activity,
  BarChart3,
  LogOut,
  ChevronLeft,
  Coffee,
  Globe
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsersData, setAllUsersData] = useState<any[]>([]);

  const ADMIN_EMAIL = "daniellamariemorilla3@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u && u.email === ADMIN_EMAIL) {
        setUser(u);
        setIsAdmin(true);
        fetchAdminDashboard();
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchAdminDashboard = async () => {
    const q = query(collection(db, 'coffee_users'), limit(50));
    const querySnapshot = await getDocs(q);
    const users: any[] = [];
    querySnapshot.forEach((doc) => users.push(doc.data()));
    setAllUsersData(users);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0c0605] flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-[#0c0605] flex flex-col items-center justify-center p-8 text-center space-y-6">
         <h1 className="text-4xl font-serif italic text-primary">Access Denied.</h1>
         <p className="text-primary/40 uppercase tracking-widest text-[10px]">This roastery is reserved for authorized curators only.</p>
         <Link href="/" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Go Back Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0605] text-primary font-sans p-8 sm:p-20 overflow-x-hidden">
      
      {/* HUD Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-8 flex justify-between items-center pointer-events-none">
         <Link href="/" className="pointer-events-auto flex items-center gap-4 bg-white/5 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/10 hover:bg-white/10 transition-all">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">To Journal</span>
         </Link>
         <div className="bg-white/5 backdrop-blur-3xl px-8 py-3 rounded-full border border-white/10 pointer-events-auto flex items-center gap-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Command Center</span>
         </div>
         <button onClick={() => auth.signOut()} className="pointer-events-auto p-4 bg-white/5 border border-white/10 rounded-full hover:bg-red-500/20 transition-all">
            <LogOut className="w-4 h-4 opacity-40" />
         </button>
      </nav>

      <main className="max-w-7xl mx-auto pt-32 space-y-20">
         
         {/* Hero Header */}
         <header className="space-y-4">
            <h1 className="text-6xl font-serif italic drop-shadow-[0_0_30px_rgba(251,204,225,0.2)]">Audience Insights.</h1>
            <p className="text-[10px] uppercase tracking-[0.5em] opacity-40 font-bold">The Global Coffee Network Overview</p>
         </header>

         {/* Stats Cards */}
         <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-12 rounded-[4rem] border border-white/10 space-y-4 shadow-2xl relative overflow-hidden group">
               <Users className="w-10 h-10 text-primary opacity-20 group-hover:scale-110 transition-transform" />
               <h4 className="text-6xl font-serif tracking-tighter">{allUsersData.length}</h4>
               <p className="text-[11px] uppercase tracking-[0.3em] opacity-40 font-bold">Total Curators</p>
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                  <Globe className="w-24 h-24" />
               </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 p-12 rounded-[4rem] border border-white/10 space-y-4 shadow-2xl relative overflow-hidden group">
               <Activity className="w-10 h-10 text-primary opacity-20 group-hover:scale-110 transition-transform" />
               <h4 className="text-6xl font-serif tracking-tighter">{allUsersData.reduce((acc, u) => acc + (u.tried?.length || 0), 0)}</h4>
               <p className="text-[11px] uppercase tracking-[0.3em] opacity-40 font-bold">Brews Documented</p>
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                  <Coffee className="w-24 h-24" />
               </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 p-12 rounded-[4rem] border border-white/10 space-y-4 shadow-2xl group">
               <BarChart3 className="w-10 h-10 text-primary opacity-20 group-hover:scale-110 transition-transform" />
               <h4 className="text-6xl font-serif tracking-tighter">Live</h4>
               <p className="text-[11px] uppercase tracking-[0.3em] opacity-40 font-bold">Cloud Synced</p>
            </motion.div>
         </section>

         {/* User List */}
         <section className="space-y-12">
            <h3 className="text-3xl font-serif italic flex items-center gap-4">
               The Curator List
               <span className="h-[1px] flex-1 bg-white/10" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {allUsersData.map((u, i) => (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={i} className="bg-white/5 p-8 rounded-[3rem] border border-white/5 hover:border-primary/20 transition-all shadow-xl group">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <div className="text-xl font-serif">@{u.username?.split(' ')[0] || "Curator"}</div>
                           <div className="text-[10px] opacity-30 tracking-widest">{u.email}</div>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-black transition-all">
                           {u.tried?.length || 0}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between text-[8px] uppercase tracking-widest opacity-40 font-bold">
                           <span>Brews: {u.tried?.length || 0}</span>
                           <span>Curiosity: {u.bucket?.length || 0}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((u.tried?.length || 0) * 10, 100)}%` }} className="h-full bg-primary" />
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </section>
      </main>

      <footer className="mt-40 opacity-10 text-center space-y-4">
         <div className="text-[9px] uppercase tracking-[1em] font-bold">sipwithdaniella.control</div>
      </footer>
    </div>
  );
}
