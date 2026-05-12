'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Coffee, 
  MapPin, 
  CloudSync, 
  Droplet, 
  ShieldCheck, 
  Zap,
  LogIn,
  Compass,
  Bookmark,
  LogOut,
  Globe,
  Sparkles,
  Award,
  Mail,
  Lock,
  User as UserIcon,
  Apple,
  ArrowRight,
  Plus,
  Key,
  Share2,
  Camera,
  CupSoda,
  Flame,
  Wind,
  Moon,
  Sun,
  Palette,
  Star,
  Image as ImageIcon,
  ChevronDown,
  Upload,
  X,
  Download,
  Check,
  Maximize2,
  Loader2
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithPopup, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import Link from 'next/link';

// Custom 3D-styled Instagram Icon (SVG)
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function SceneUI() {
  const [phase, setPhase] = useState<'intro' | 'auth' | 'welcome' | 'main'>('intro');
  const [authMode, setAuthMode] = useState<'options' | 'email' | 'signup' | 'admin_secret'>('options');
  const [activeTab, setActiveTab] = useState<'savored' | 'curious' | 'community'>('savored');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [triedList, setTriedList] = useState<any[]>([]);
  const [bucketList, setBucketList] = useState<any[]>([]);
  const [communityBrews, setCommunityBrews] = useState<any[]>([]);
  
  const [triedLimit, setTriedLimit] = useState(6);
  const [bucketLimit, setBucketLimit] = useState(6);

  const [newEntry, setNewEntry] = useState({ name: '', place: '', notes: '', rating: 5, image: null as string | null });
  const [newCurious, setNewCurious] = useState({ name: '', place: '', notes: '', image: null as string | null });
  const [sharingItem, setSharingItem] = useState<any>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [aiMood, setAiMood] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const curiousFileInputRef = useRef<HTMLInputElement>(null);

  const ADMIN_EMAIL = "daniellamariemorilla3@gmail.com";
  const SECRET_ADMIN_PASS = "123456";

  useEffect(() => {
    const timer = setTimeout(() => {
      onAuthStateChanged(auth, (u) => {
        if (u) {
          setUser(u);
          loadUserData(u);
          setPhase('main');
        } else {
          setPhase('auth');
        }
        setLoading(false);
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'tried' | 'bucket') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'tried') setNewEntry({ ...newEntry, image: base64String });
        else setNewCurious({ ...newCurious, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialLogin = async (providerType: 'google' | 'apple') => {
    const provider = providerType === 'google' ? new GoogleAuthProvider() : new OAuthProvider('apple.com');
    try {
      const result = await signInWithPopup(auth, provider);
      handlePostAuth(result.user);
    } catch (error: any) { setAuthError(error.message); }
  };

  const handleEmailAuth = async () => {
    try {
      setLoading(true);
      if (authMode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        handlePostAuth(result.user);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        handlePostAuth(result.user);
      }
    } catch (error: any) { 
      setAuthError(error.message);
      setLoading(false);
    }
  };

  const handleAdminSecretAuth = () => {
    if (adminKey === SECRET_ADMIN_PASS) {
      window.location.href = '/admin';
    } else {
      setAuthError("Invalid Secret Key");
    }
  };

  const handlePostAuth = async (u: User) => {
    try {
      setUser(u);
      await loadUserData(u);
      setPhase('welcome');
      setTimeout(() => setPhase('main'), 3000);
    } catch (error: any) {
      console.error("Post auth failed", error);
      setAuthError(error.message);
      setLoading(false);
    }
  };

  const loadUserData = async (u: User) => {
    try {
      const userRef = doc(db, 'coffee_users', u.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTriedList((data.tried || []).sort((a: any, b: any) => b.id - a.id));
        setBucketList((data.bucket || []).sort((a: any, b: any) => b.id - a.id));
      } else {
        await setDoc(userRef, { username: u.displayName || "Curator", email: u.email, tried: [], bucket: [] });
      }
      fetchCommunityBrews();
    } catch (error: any) {
      console.error("Load user data failed", error);
      // Even if database fails, we proceed to main to show the UI
      setPhase('main');
    }
  };

  const fetchCommunityBrews = async () => {
    const q = query(collection(db, 'coffee_users'), limit(20));
    const querySnapshot = await getDocs(q);
    const brews: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.tried && data.tried.length > 0) {
        brews.push({ ...data.tried[data.tried.length - 1], user: data.username });
      }
    });
    setCommunityBrews(brews);
  };

  const addEntry = async (type: 'tried' | 'bucket') => {
    const entryData = type === 'tried' ? newEntry : { ...newCurious, rating: 0 };
    if (!entryData.name || !entryData.place || !user) return;
    const entry = { ...entryData, id: Date.now(), date: new Date().toLocaleDateString() };
    const newList = [entry, ...(type === 'tried' ? triedList : bucketList)];
    if (type === 'tried') { setTriedList(newList); setNewEntry({ name: '', place: '', notes: '', rating: 5, image: null }); }
    else { setBucketList(newList); setNewCurious({ name: '', place: '', notes: '', image: null }); }
    const userRef = doc(db, 'coffee_users', user.uid);
    await setDoc(userRef, { [type]: newList, lastActive: new Date() }, { merge: true });
    if (type === 'tried') fetchCommunityBrews();
  };

  const getDrinkAesthetic = (item: any) => {
    if (item.image) return { icon: <Camera className="w-12 h-12" />, color: 'from-black/40 to-transparent', image: item.image };
    const n = item.name.toLowerCase();
    const seed = item.id % 5;
    let img = `https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600&sig=${seed}`;
    let icon = <Coffee className="w-12 h-12" />;
    let color = "from-orange-500/40 to-pink-500/40";
    if (n.includes('latte')) { img = `https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600&sig=${seed}`; icon = <Coffee className="w-12 h-12" />; }
    else if (n.includes('matcha')) { img = `https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80&w=600&sig=${seed}`; icon = <Palette className="w-12 h-12" />; color = "from-green-500/40 to-emerald-500/40"; }
    else if (n.includes('cold') || n.includes('ice')) { img = `https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600&sig=${seed}`; icon = <Wind className="w-12 h-12" />; color = "from-blue-500/40 to-cyan-500/40"; }
    else if (n.includes('espresso')) { img = `https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=600&sig=${seed}`; icon = <Zap className="w-12 h-12" />; color = "from-red-500/40 to-orange-500/40"; }
    return { icon, color, image: img };
  };

  const generateAiMood = () => {
    const moods = ["Sophisticated Espresso Energy", "Creamy Latte Comfort", "Cold Brew Productivity", "Matcha Spirit"];
    setAiMood(moods[Math.floor(Math.random() * moods.length)]);
  };

  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!sharingItem) return;
    setSharing(true);
    try {
      const node = document.querySelector('.share-card') as HTMLElement;
      if (!node) throw new Error("Card not found");

      // Generate high-quality image from the card
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0c0605'
      });

      // Convert dataUrl to a File object
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `sip-${sharingItem.id}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'SipWithDaniella',
          text: `Brewed a memory: ${sharingItem.name} @itsdaniella`
        });
      } else {
        // Fallback: Download the image if sharing files isn't supported
        const link = document.createElement('a');
        link.download = `sip-${sharingItem.id}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') console.error("Share failed", error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="relative z-10 w-full min-h-screen text-primary font-sans overflow-x-hidden selection:bg-primary selection:text-black">
      
      {/* SHARE PREVIEW MODAL */}
      <AnimatePresence>
        {sharingItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[8000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full flex flex-col items-center gap-6">
               
               {/* PREMIUM STORY CARD - ONE-LINE LAYOUT */}
               <div className="relative w-full aspect-[9/16] bg-[#0c0605] rounded-[3.5rem] overflow-hidden shadow-[0_0_120px_rgba(251,204,225,0.15)] border border-white/10 group share-card">
                  
                  <div className="absolute inset-0 bg-black" />
                  <img src={getDrinkAesthetic(sharingItem).image} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl scale-125" />
                  
                  <div className="absolute inset-0 flex items-center justify-center p-8 pb-56 pt-28">
                     <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-black/20">
                        <img src={getDrinkAesthetic(sharingItem).image} className="w-full h-full object-contain" />
                     </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95" />
                  
                  <div className="absolute top-12 left-0 w-full px-10 flex justify-between items-start">
                     <div>
                        <h2 className="text-2xl font-serif italic text-white tracking-tighter">sipwithdaniella.</h2>
                        <p className="text-[7px] uppercase tracking-[0.5em] text-white/40 font-bold mt-1">Brew Archive • v1.0</p>
                     </div>
                     <div className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                        <Coffee className="w-5 h-5 text-primary" />
                     </div>
                  </div>

                  {/* HORIZONTAL / ONE-LINE CONTENT LAYOUT */}
                  <div className="absolute bottom-12 left-0 w-full px-10 space-y-6">
                     
                     <div className="space-y-4">
                        {/* THE ONE LINE: NAME, PLACE, RATING */}
                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-white/10 pb-4">
                           <h3 className="text-4xl font-serif italic text-white tracking-tighter shrink-0">{sharingItem.name}</h3>
                           <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px]">
                              <MapPin className="w-3 h-3" /> {sharingItem.place}
                           </div>
                           <div className="flex gap-0.5 ml-auto">
                              {[...Array(5)].map((_, i) => (
                                 <Star key={i} className={`w-3 h-3 ${i < (sharingItem.rating || 5) ? 'text-primary' : 'text-white/10'}`} fill={i < (sharingItem.rating || 5) ? "currentColor" : "none"} />
                              ))}
                           </div>
                        </div>

                        {/* NOTES IN ONE CLEAN LINE (MAX 2) */}
                        <p className="text-[11px] italic text-white/60 font-serif leading-relaxed line-clamp-2">
                           "{sharingItem.notes || 'Another chapter in my coffee journey.'}"
                        </p>
                     </div>

                     <div className="pt-4 flex items-end justify-between border-t border-white/5 opacity-40">
                        <div className="space-y-0.5">
                           <p className="text-[5px] uppercase tracking-widest font-bold">Recorded On</p>
                           <span className="text-[9px] uppercase tracking-widest font-bold">{sharingItem.date}</span>
                        </div>
                        <div className="text-right">
                           <p className="text-[5px] uppercase tracking-widest font-bold">Curated By</p>
                           <span className="text-[9px] text-primary uppercase tracking-widest font-bold">@{user?.displayName?.split(' ')[0] || "Curator"}</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-3 w-full">
                  <button onClick={() => setSharingItem(null)} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold uppercase text-[10px] tracking-widest text-white/40">Close</button>
                  <button onClick={handleShare} disabled={sharing} className="flex-[2] py-4 rounded-2xl bg-primary text-black font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-white transition-all disabled:opacity-50">
                     {sharing ? (
                        <>
                           <Loader2 className="w-4 h-4 animate-spin" /> Generating Card...
                        </>
                     ) : (
                        <>
                           <InstagramIcon className="w-4 h-4" /> Share Story
                        </>
                     )}
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 1. CINEMATIC INTRO */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-[#0c0605] flex items-center justify-center">
            <motion.div initial={{ opacity: 0, letterSpacing: '1em' }} animate={{ opacity: 1, letterSpacing: '0.1em' }} transition={{ duration: 2 }} className="text-center space-y-6">
               <h1 className="text-7xl font-serif italic drop-shadow-[0_0_30px_rgba(251,204,225,0.3)]">sipwithdaniella.</h1>
               <p className="text-[9px] tracking-[0.8em] uppercase opacity-30 font-bold italic">The Digital Journal</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. ADVANCED AUTHENTICATION */}
      <AnimatePresence>
        {phase === 'auth' && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[5000] bg-[#0c0605] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <div className="max-w-xl w-full text-center space-y-8 bg-white/5 p-10 sm:p-16 rounded-[4rem] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
               <div className="space-y-4">
                  <h2 className="text-5xl font-serif italic tracking-tight">The Roastery.</h2>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold italic">Secure Your Coffee Legacy</p>
                  {authError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-3">
                       <ShieldCheck className="w-4 h-4 shrink-0" />
                       <span className="text-left">{authError}</span>
                       <button onClick={() => setAuthError("")} className="ml-auto opacity-50 hover:opacity-100"><X className="w-3 h-3" /></button>
                    </motion.div>
                  )}
               </div>
               <AnimatePresence mode="wait">
                  {authMode === 'options' ? (
                    <motion.div key="options" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="space-y-4">
                       <button onClick={() => handleSocialLogin('google')} className="w-full bg-white text-black py-5 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-primary transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] group">
                          <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" /> GOOGLE SESSION
                       </button>
                       <button onClick={() => setAuthMode('signup')} className="w-full bg-primary/10 border border-primary/20 text-primary py-5 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-primary/20 transition-all shadow-xl group">
                          <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" /> CREATE AN ACCOUNT
                       </button>
                       <div className="pt-8 flex flex-col gap-4">
                          <button onClick={() => setAuthMode('email')} className="text-[10px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all font-bold hover:text-primary">Sign In to Existing Profile</button>
                          <button onClick={() => setAuthMode('admin_secret')} className="text-[9px] uppercase tracking-widest opacity-5 hover:opacity-100 transition-opacity font-bold mt-4 italic">Authorized Curator Entrance</button>
                       </div>
                    </motion.div>
                  ) : authMode === 'admin_secret' ? (
                    <motion.div key="admin-secret" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
                       <div className="bg-primary/10 p-8 rounded-3xl border border-primary/20">
                          <Key className="w-8 h-8 text-primary mx-auto mb-4" />
                          <h3 className="text-xl font-serif italic mb-6">Secret Admin Access</h3>
                          <input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Enter Key" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none text-center tracking-[1em] font-bold" />
                          <button onClick={handleAdminSecretAuth} className="w-full bg-primary text-black py-4 rounded-xl mt-6 font-bold uppercase tracking-widest">Unlock</button>
                       </div>
                       <button onClick={() => setAuthMode('options')} className="text-[10px] opacity-40">Cancel</button>
                    </motion.div>
                  ) : (
                    <motion.div key="email-form" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                       {authMode === 'signup' && (
                          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-primary/40" />
                       )}
                       <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-primary/40" />
                       <div className="relative">
                          <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password" className="w-full bg-white/5 border border-white/5 p-5 pr-14 rounded-2xl outline-none focus:border-primary/40 transition-all" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-6 top-1/2 -translate-y-1/2 transition-all ${showPassword ? 'text-primary' : 'text-white/20'}`}>
                             <Coffee className="w-5 h-5" />
                          </button>
                       </div>
                       <button onClick={handleEmailAuth} className="w-full relative group overflow-hidden bg-primary text-black py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-[0_20px_40px_rgba(251,204,225,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <span className="relative flex items-center justify-center gap-2">
                             {authMode === 'signup' ? "Create Profile" : "Sign In"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                       </button>
                       <button onClick={() => setAuthMode('options')} className="text-[10px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 hover:text-primary transition-all font-bold">Go Back</button>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. CINEMATIC WELCOME */}
      <AnimatePresence>
        {phase === 'welcome' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[7000] bg-[#0c0605] flex items-center justify-center">
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }} className="text-center space-y-4">
                <p className="text-[10px] uppercase tracking-[0.5em] opacity-40 font-bold animate-pulse text-primary italic">Syncing Your Palette...</p>
                <h2 className="text-6xl font-serif italic">Welcome, {user?.displayName?.split(' ')[0] || "Curator"}.</h2>
                <div className="h-[1px] w-12 bg-primary mx-auto mt-8" />
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. MAIN DASHBOARD */}
      <AnimatePresence>
      {phase === 'main' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex flex-col items-center">
          
          <nav className="fixed top-0 left-0 w-full z-[100] p-8 flex justify-between items-center pointer-events-none">
             <div className="pointer-events-auto">
                <h2 className="text-2xl font-serif italic tracking-tighter">sipwithdaniella.</h2>
                <div className="flex items-center gap-2 opacity-40">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <p className="text-[8px] uppercase tracking-widest font-bold">Cloud Live</p>
                </div>
             </div>
             <div className="flex gap-1.5 p-1.5 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 pointer-events-auto shadow-2xl">
                <button onClick={() => setActiveTab('savored')} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'savored' ? 'bg-primary text-black' : 'hover:bg-white/10'}`}>Savored</button>
                <button onClick={() => setActiveTab('curious')} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'curious' ? 'bg-primary text-black' : 'hover:bg-white/10'}`}>Curious</button>
                <button onClick={() => setActiveTab('community')} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'community' ? 'bg-primary text-black' : 'hover:bg-white/10'}`}>Community</button>
             </div>
             <button onClick={() => auth.signOut().then(() => { setPhase('auth'); setAuthMode('options'); })} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 transition-all pointer-events-auto group">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">Sign Out</span>
                <LogOut className="w-4 h-4 opacity-40 group-hover:opacity-100" />
             </button>
          </nav>

          <main className="w-full max-w-7xl px-8 pt-40 pb-20 space-y-24">
             <section className="flex flex-col items-center gap-12 text-center">
                <div className="space-y-4">
                   <p className="text-[10px] uppercase tracking-[0.5em] opacity-40 font-bold italic">Curated by {user?.displayName || "Curator"}</p>
                   <h1 className="text-8xl font-serif italic leading-none drop-shadow-[0_0_50px_rgba(251,204,225,0.2)] tracking-tighter">The Brew<br/>Chronicles.</h1>
                </div>
                <button onClick={generateAiMood} className="bg-white/5 border border-white/10 px-10 py-5 rounded-full backdrop-blur-3xl hover:bg-primary hover:text-black transition-all flex items-center gap-3 group pointer-events-auto shadow-2xl">
                   <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{aiMood ? "Mood Analyzed" : "Analyze My Coffee Mood"}</span>
                </button>
             </section>

             <div className="min-h-[50vh] pointer-events-auto">
                <AnimatePresence mode="wait">
                   {activeTab === 'savored' && (
                     <motion.div key="savored" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col lg:flex-row gap-12">
                        
                        <div className="w-full lg:w-[350px] space-y-6">
                           <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl sticky top-40">
                              <h3 className="text-2xl font-serif italic">Log a Memory</h3>
                              
                              <div onClick={() => fileInputRef.current?.click()} className="w-full h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden relative">
                                {newEntry.image ? (
                                  <>
                                    <img src={newEntry.image} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                    <button onClick={(e) => { e.stopPropagation(); setNewEntry({...newEntry, image: null}); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-500 transition-colors z-10"><X className="w-3 h-3" /></button>
                                  </>
                                ) : (
                                  <>
                                    <Camera className="w-8 h-8 opacity-20 group-hover:opacity-100 transition-all text-primary" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100">Add Drink Photo</span>
                                  </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'tried')} />
                              </div>

                              <div className="space-y-3">
                                 <input value={newEntry.name} onChange={(e) => setNewEntry({...newEntry, name: e.target.value})} placeholder="Drink Name..." className="w-full bg-white/5 border border-white/5 p-4 rounded-xl outline-none focus:border-primary/40 text-sm" />
                                 <input value={newEntry.place} onChange={(e) => setNewEntry({...newEntry, place: e.target.value})} placeholder="Location..." className="w-full bg-white/5 border border-white/5 p-4 rounded-xl outline-none focus:border-primary/40 text-sm" />
                                 <textarea value={newEntry.notes} onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})} placeholder="Notes..." className="w-full bg-white/5 border border-white/5 p-4 rounded-xl outline-none focus:border-primary/40 h-24 resize-none text-sm font-serif italic" />
                              </div>
                              <div className="space-y-2">
                                 <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    {[1,2,3,4,5].map(r => (
                                       <button key={r} onClick={() => setNewEntry({...newEntry, rating: r})} className={`p-1 transition-all ${newEntry.rating >= r ? 'text-primary scale-110' : 'text-white/10'}`}>
                                          <Star className="w-4 h-4" fill={newEntry.rating >= r ? "currentColor" : "none"} />
                                       </button>
                                    ))}
                                 </div>
                              </div>
                              <button onClick={() => addEntry('tried')} className="w-full bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-xl">
                                 <Plus className="w-4 h-4" /> Save to Archive
                              </button>
                           </div>
                        </div>

                        <div className="flex-1 space-y-12">
                           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                              {triedList.slice(0, triedLimit).map((item) => {
                                const aesthetic = getDrinkAesthetic(item);
                                return (
                                <motion.div layout key={item.id} className="bg-white/5 p-5 rounded-[2.5rem] border border-white/10 space-y-4 hover:border-primary/40 transition-all group relative overflow-hidden shadow-xl flex flex-col h-fit">
                                   <div className="w-full h-72 bg-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden border border-white/5 group-hover:scale-[1.02] transition-transform duration-500">
                                      <img src={aesthetic.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all grayscale group-hover:grayscale-0 duration-700" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                      <div className="absolute top-4 right-4 flex gap-0.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                         {[...Array(item.rating || 5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 text-primary" fill="currentColor" />)}
                                      </div>
                                   </div>
                                   <div className="space-y-3 px-1">
                                      <div className="flex justify-between items-start">
                                         <div className="flex-1">
                                            <h4 className="text-xl font-serif leading-tight">{item.name}</h4>
                                            <p className="text-[10px] text-primary/60 flex items-center gap-1 uppercase tracking-widest font-bold mt-1"><MapPin className="w-2.5 h-2.5" /> {item.place}</p>
                                         </div>
                                         <button onClick={() => setSharingItem(item)} className="p-3 rounded-2xl bg-primary text-black hover:bg-white transition-all shadow-lg flex items-center gap-2 group/btn">
                                            <InstagramIcon className="w-4 h-4" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Share Story</span>
                                         </button>
                                      </div>
                                      {item.notes && <p className="text-[10px] italic text-primary/40 font-serif border-t border-white/5 pt-2 line-clamp-2">"{item.notes}"</p>}
                                      <div className="text-[8px] uppercase tracking-widest opacity-20 font-bold text-right pt-1">{item.date}</div>
                                   </div>
                                </motion.div>
                                );
                              })}
                           </div>
                           {triedList.length > triedLimit && (
                              <button onClick={() => setTriedLimit(triedLimit + 6)} className="w-full py-8 flex flex-col items-center gap-2 group hover:text-primary transition-all">
                                 <ChevronDown className="w-6 h-6 group-hover:translate-y-2 transition-transform" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Load More Chronicles</span>
                              </button>
                           )}
                        </div>
                     </motion.div>
                   )}

                   {activeTab === 'curious' && (
                     <motion.div key="curious" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col lg:flex-row gap-12">
                        <div className="w-full lg:w-[350px] space-y-6">
                           <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl sticky top-40">
                              <h3 className="text-2xl font-serif italic">Bucket List</h3>
                              <div onClick={() => curiousFileInputRef.current?.click()} className="w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative">
                                {newCurious.image ? (
                                  <img src={newCurious.image} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                                ) : (
                                  <>
                                    <ImageIcon className="w-6 h-6 opacity-20 group-hover:opacity-100" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Target Reference</span>
                                  </>
                                )}
                                <input ref={curiousFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'bucket')} />
                              </div>
                              <div className="space-y-3">
                                 <input value={newCurious.name} onChange={(e) => setNewCurious({...newCurious, name: e.target.value})} placeholder="Dream Drink..." className="w-full bg-white/5 border border-white/5 p-4 rounded-xl outline-none focus:border-primary/40 text-sm" />
                                 <input value={newCurious.place} onChange={(e) => setNewCurious({...newCurious, place: e.target.value})} placeholder="Cafe Target..." className="w-full bg-white/5 border border-white/5 p-4 rounded-xl outline-none focus:border-primary/40 text-sm" />
                                 <textarea value={newCurious.notes} onChange={(e) => setNewCurious({...newCurious, notes: e.target.value})} placeholder="Notes..." className="w-full bg-white/5 border border-white/5 p-4 rounded-xl outline-none focus:border-primary/40 h-24 resize-none text-sm font-serif italic" />
                              </div>
                              <button onClick={() => addEntry('bucket')} className="w-full bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-xl hover:bg-white transition-all">
                                 <Bookmark className="w-4 h-4" /> Save for Later
                              </button>
                           </div>
                        </div>
                        <div className="flex-1 space-y-12">
                           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                              {bucketList.slice(0, bucketLimit).map((item) => {
                                const aesthetic = getDrinkAesthetic(item);
                                return (
                                <motion.div layout key={item.id} className="bg-white/5 p-5 rounded-[2.5rem] border border-white/10 space-y-4 hover:border-primary/40 transition-all group relative overflow-hidden shadow-xl flex flex-col h-fit grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                                   <div className="w-full h-48 bg-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden border border-white/5">
                                      <img src={aesthetic.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                                      <div className="relative text-white/40 group-hover:text-primary transition-all">{aesthetic.icon}</div>
                                   </div>
                                   <div className="space-y-3 px-1">
                                      <h4 className="text-xl font-serif leading-tight">{item.name}</h4>
                                      <p className="text-[10px] text-primary/60 flex items-center gap-1 uppercase tracking-widest font-bold mt-1 opacity-40"><MapPin className="w-2.5 h-2.5" /> {item.place}</p>
                                      <div className="text-[8px] uppercase tracking-widest opacity-20 font-bold text-right pt-1">Added {item.date}</div>
                                   </div>
                                </motion.div>
                                );
                              })}
                           </div>
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </main>

          <footer className="w-full p-20 flex flex-col items-center gap-12 pointer-events-auto">
             <div className="flex gap-12 items-center">
                <a href="https://www.instagram.com/itsdnllmr/" target="_blank" rel="noopener noreferrer" className="group relative flex flex-col items-center gap-3 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl hover:bg-primary/20 hover:border-primary/40 transition-all shadow-xl">
                   <InstagramIcon className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(251,204,225,0.6)] group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30 group-hover:opacity-100 transition-opacity">@itsdnllmr</span>
                </a>
             </div>
             <p className="text-[9px] uppercase tracking-[0.8em] opacity-10 font-bold">sipwithdaniella.journal • 2026</p>
          </footer>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
