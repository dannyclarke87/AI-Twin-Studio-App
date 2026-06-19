import React, { useState } from 'react';
import { 
  Check, Sparkles, Lock, ArrowRight, ShieldCheck, 
  HelpCircle, Users, Layers, Video, Image as ImageIcon, 
  FileText, Volume2, ChevronDown, ChevronUp, Play, 
  ExternalLink, LogIn, LogOut, CheckCircle, Info, Star, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockApps } from '../data';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface SalesPageProps {
  onUpgrade: (tier: 'starter' | 'pro' | 'elite') => void;
  onLogin: (email: string) => void;
  isLoggedIn: boolean;
  currentUserEmail: string | null;
  currentUserStatus: string;
  onLogout: () => void;
}

const testimonials = [
  {
    name: "Tina Engelmann",
    role: "C-Section Coach",
    stars: 5,
    heading: (
      <span>
        <span className="text-[#dcfb80]">"Within seconds,</span> you will have so many images!"
      </span>
    ),
    body: "I won't lie, I thought this was going to be too difficult but how wrong was I. You just have to click the buttons and bingo it's done. Also, it felt so much fun and if you're anything like me full of excuses not to post. It's going to make life so much easier.",
    avatar: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6994c665d614c9db80014621.png",
    videoThumb: "",
    // Paste direct .mp4 link, YouTube/Vimeo embed URL, or local path like "/videos/tina.mp4" here:
    videoUrl: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/699207b06bac2474e9995966.mp4",
  },
  {
    name: "Becky Kennedy",
    role: "Entrepreneur",
    stars: 5,
    heading: (
      <span>
        "I can create so many images <span className="text-[#dcfb80]">without spending hours!"</span>
      </span>
    ),
    body: "Why do I love AI Twin Studio. Simple really, it's so easy to use. I can create so many images without having to spend hours and hours trying to create images for my social media. This is going to be an absolute game-changer for me!",
    avatar: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6994c66522723504a16be359.png",
    videoThumb: "",
    videoUrl: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/69930aff28abf94eb6c39e62.mp4",
  },
  {
    name: "Kerry Ellis",
    role: "Kerry Ellis Travel",
    stars: 5,
    heading: (
      <span>
        "My friends thought they were <span className="text-[#dcfb80]">real</span> photos of me"
      </span>
    ),
    body: "I've tried loads of tools and AI Twin Studio is the very best. The photos are hyper realistic which I think is amazing. It's like having a photographer with you. You can look confident, caring, like you're talking to someone. So many options",
    avatar: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6994c665d614c956bc014622.png",
    videoThumb: "",
    videoUrl: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/699351bb3b3cc9825fefface.mp4",
  },
  {
    name: "Brandon Harbaugh",
    role: "Beast Mode Travelling",
    stars: 5,
    heading: (
      <span>
        "Now I can take <span className="text-[#dcfb80]">20-30 professional</span> photos in seconds"
      </span>
    ),
    body: "AI Twin Studio the new state of the art AI. You add 3 images, outfits and then get a professional photoshoot image. This is a total game-changer. I cannot believe how easy and simple this is.",
    avatar: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6994c66554da04cdeb91fe0e.png",
    videoThumb: "",
    videoUrl: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6993536c1eb3cf00e1cf1a3d.mp4",
  },
  {
    name: "Jo Shelton",
    role: "She Takes Action",
    stars: 5,
    heading: (
      <span>
        "The <span className="text-[#dcfb80]">best AI images I have ever seen.</span> I am so impressed!"
      </span>
    ),
    body: "Honestly, I am absolutely blown away. The moment form i started using it I'm been blown away. The app is simple, intuitive, you don't need to be techy. It just works. The real wow factor for me is the quality of the images.",
    avatar: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6994c6651ecd71d1855c40a8.png",
    videoThumb: "",
    videoUrl: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/69949a5a3a96e52f1f142324.mp4",
  },
  {
    name: "Ian Wright",
    role: "The Social Ninja Ltd",
    stars: 5,
    heading: (
      <span>
        "<span className="text-[#dcfb80]">Create your AI Twin</span> really fast with AI Twin Studio"
      </span>
    ),
    body: "This app is phenomenal. If you're looking to create fast avatars of yourself, that are very realistic that can change your outfits, locations, etc. This app is well worth investing in!",
    avatar: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6994c66522723564256be35a.png",
    videoThumb: "",
    videoUrl: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6994c2c46bac240b7e11660f.mp4",
  },
  {
    name: "Bhavna Radia",
    role: "Money Saving Divorce",
    stars: 5,
    heading: (
      <span>
        "The images <span className="text-[#dcfb80]">are true to life</span> and look exactly like me!"
      </span>
    ),
    body: "The images AI Twin Studio has created are amazing. They are true to life and realistic. It's great to use my existing photos and have a tool that can give me brilliant branding shots without actually leaving home. The app creates great consistency of images.",
    avatar: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6994c7b11ecd71823a5c87c4.png",
    videoThumb: "",
    videoUrl: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/699705af2a2f154e5debc696.mp4",
  },
  {
    name: "Carly Myers",
    role: "Made For More",
    stars: 5,
    heading: (
      <span>
        "My husband thought I'd <span className="text-[#dcfb80]">been on a real photoshoot!</span>"
      </span>
    ),
    body: "I'm just obsessed. In just a few minutes i had made 80 photos of myself to put on my socials. When I saw the first output i was just blown away. It looked exactly like me. i've never been able to get an AI Twin actually look like me, but this is exactly the same as me!",
    avatar: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/699710a34c2502241585fbfd.jpg",
    videoThumb: "",
    videoUrl: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/69970f4a2a2f1592b4ed0d39.mp4",
  },
  {
    name: "Michelle Veasy",
    role: "Digital Marketer",
    stars: 5,
    heading: (
      <span>
        "For someone <span className="text-[#dcfb80]">not confident on camera</span> this is ideal for me"
      </span>
    ),
    body: "The software is really easy to use and comes with it's own Custom GPT thats helps you to create whatever images you want. I cannot wait to add Elevenlabs and use my voice and scripts to create video content. Great job Danny and the team!",
    avatar: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6998adfa5ba498f4a80927c9.jpg",
    videoThumb: "",
    videoUrl: "https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6998ab1563ae758090313359.mp4",
  }
];

export function SalesPage({ 
  onUpgrade, 
  onLogin, 
  isLoggedIn, 
  currentUserEmail, 
  currentUserStatus,
  onLogout 
}: SalesPageProps) {
  
  // App directory filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'starter' | 'pro' | 'elite'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // UI states
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signup' | 'signin'; selectedTier?: 'starter' | 'pro' | 'elite' }>({
    isOpen: false,
    mode: 'signup'
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [demoActive, setDemoActive] = useState(false);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Active playing testimonial video state
  const [playingVideoIdx, setPlayingVideoIdx] = useState<number | null>(null);

  // Categories extracted from mockApps
  const categories = ['all', 'Images', 'Video', 'Text', 'Voice', 'Memes'];

  // FAQ Items
  const faqItems = [
    {
      q: "What is AI Twin Studio?",
      a: "AI Twin Studio is a unified suite of next-generation content creators, cloning engines, and psychological scriptwriter modules. Instead of paying multiple separate complex SaaS subscriptions, we package over 24+ specific, fully fine-tuned generation models for images, talking head videos, memes, podcasts, and cloned voice overs in one single, beautifully simple workspace."
    },
    {
      q: "How does the lifetime / one-time pricing work?",
      a: "No monthly subscriptions or token maintenance fees! You pay once for your selected access tier (Starter $27, Pro $97, or Elite $197), which grants you lifetime access to those specific applications inside your dashboard. This is designed to completely remove subscription fatigue for modern digital creators and agencies."
    },
    {
      q: "How does the pro-rated upgrade pricing work?",
      a: "We believe in zero penalty for starting small. If you purchase the Starter tier today at $27 and decide to upgrade to Pro later, our systems automatically deduct your $27 payment—allowing you to unlock Pro for just $70. If you are on Pro and wish to upgrade to Elite, you only pay the $100 difference. You can upgrade smoothly straight from your workspace dashboard!"
    },
    {
      q: "Can I Bring My Own Keys (BYOK)?",
      a: "Absolutely! AI Twin Studio supports Bring Your Own Key (BYOK) for both AI generation and advanced workflows (such as Google Gemini, ElevenLabs, and more). Setting up your own API keys in your settings allows you to completely bypass any default account platform credits, query at pure wholesale developer rates, and scale your content generation infinitely without limitations. Doing so is entirely optional—you can always use our built-in credits straight out of the box!"
    },
    {
      q: "What are the limitations of each tier?",
      a: "Tiers represent which creative tools you can run. The Starter Pack unlocks our 5 core image and hyper-realism engines. The Pro Pack adds 10 professional-grade studios (Podcast, Talking Head, Up-scaler, Thumbnail builder, etc.). The Elite Pack is our unlimited master collection, granting all 24+ tools including VSL B-Roll generation, psychological triggers content creator, affiliate AI influencer manager, and voice cloning."
    }
  ];

  // Filter apps based on search + selected level + category
  const filteredApps = mockApps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Level matching
    const matchesLevel = selectedLevel === 'all' || app.level === selectedLevel;

    // Category matching (handles both array and string values gracefully)
    const matchesCategory = selectedCategory === 'all' || (
      Array.isArray(app.category) 
        ? app.category.some(c => c.toLowerCase() === selectedCategory.toLowerCase())
        : (app.category as string).toLowerCase() === selectedCategory.toLowerCase()
    );

    return matchesSearch && matchesLevel && matchesCategory;
  });

  // Handle CTA actions
  const handleCheckoutIntent = (tier: 'starter' | 'pro' | 'elite') => {
    if (isLoggedIn) {
      // Direct Stripe checkout redirection if user is already logged in
      onUpgrade(tier);
    } else {
      // Trigger checkout registration modal first to associate purchase with user ID
      setAuthError(null);
      setAuthModal({
        isOpen: true,
        mode: 'signup',
        selectedTier: tier
      });
    }
  };

  // Process Firebase registration / checkout combination
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Please fill in all details.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authModal.mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        if (result.user && result.user.email) {
          onLogin(result.user.email.toLowerCase().trim());
          setAuthModal(prev => ({ ...prev, isOpen: false }));
          // If checkout is selected, proceed immediately
          if (authModal.selectedTier) {
            onUpgrade(authModal.selectedTier);
          }
        }
      } else {
        const result = await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        if (result.user && result.user.email) {
          onLogin(result.user.email.toLowerCase().trim());
          setAuthModal(prev => ({ ...prev, isOpen: false }));
          if (authModal.selectedTier) {
            onUpgrade(authModal.selectedTier);
          }
        }
      }
    } catch (err: any) {
      console.error("Auth helper error:", err);
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email already exists. Click "Sign In" below to log in instead.';
      } else if (err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-[#dcfb80] selection:text-black overflow-x-hidden">
      
      {/* 1. TOP NAV BAR */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-zinc-900 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#dcfb80] to-emerald-500 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#030303] rounded-[6px] flex items-center justify-center font-bold text-xs text-[#dcfb80]">
                AI
              </div>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white block">AI TWIN STUDIO</span>
              <span className="text-[9px] font-semibold text-zinc-500 block -mt-1 uppercase tracking-widest">Client Suite</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#directory" className="hover:text-white transition-colors">App Directory</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing & Levels</a>
            <a href="#affiliate" className="hover:text-white transition-[#dcfb80] flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Partners
            </a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 hidden sm:inline-block max-w-[120px] truncate">
                  {currentUserEmail}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] text-[#dcfb80] uppercase tracking-wider font-semibold">
                  {currentUserStatus}
                </span>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 rounded-md hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors ml-1"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError(null);
                  setAuthModal({ isOpen: true, mode: 'signin' });
                }}
                className="flex items-center gap-1.5 text-xs text-black bg-[#dcfb80] hover:bg-opacity-95 font-bold px-4 py-2 rounded-full transition-all cursor-pointer shadow-[0_0_15px_rgba(220,251,128,0.15)]"
              >
                <LogIn size={13} />
                <span>Client Access</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO AREA */}
      <section className="relative pt-16 pb-20 px-4 md:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#030303] to-[#030303]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#dcfb80]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] md:text-xs text-[#dcfb80] mb-6 font-semibold tracking-wider uppercase">
            <Sparkles className="w-3" />
            <span>24+ Specialized Creative Applications</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]">
            Create Viral Content with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dcfb80] to-emerald-400">
              Your Complete AI Twin Studio
            </span>
          </h1>

          <p className="text-zinc-400 text-base md:text-lg max-w-3xl mx-auto mb-10 leading-relaxed">
            Eliminate complex subscription fees. Get instant, lifetime access to 24+ specialized, localized AI generation tools customized for your personal, family, or business brand.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#dcfb80] to-emerald-400 text-zinc-950 hover:scale-[1.02] transform transition-all font-extrabold rounded-xl shadow-[0_4px_25px_rgba(220,251,128,0.25)] flex items-center justify-center gap-2 text-base"
            >
              <span>Get Lifetime Access Now</span>
              <ArrowRight size={18} />
            </a>
            <a
              href="#directory"
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 hover:text-white font-bold rounded-xl transition-all border border-zinc-800 flex items-center justify-center gap-2 text-base"
            >
              <span>Explore the 24+ Studios</span>
            </a>
          </div>

          {/* Interactive Promo Widget / Video Frame */}
          <div className="w-full max-w-4xl mx-auto bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 shadow-2xl relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#dcfb80]/15 to-transparent pointer-events-none"></div>
            
            <div 
              className={`bg-[#030303] rounded-xl overflow-hidden aspect-[16/9] relative flex flex-col justify-center items-center group ${!demoActive ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (!demoActive) setDemoActive(true);
              }}
            >
              {demoActive ? (
                <div className="w-full h-full relative bg-black flex items-center justify-center">
                  <video 
                    src="https://assets.cdn.filesafe.space/3z2YfZikrqvBoykPWDU5/media/6a26e3ed19b4ff338be12328.mp4"
                    className="w-full h-full object-contain" 
                    controls 
                    autoPlay 
                    playsInline
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDemoActive(false);
                    }}
                    className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white hover:text-[#dcfb80] p-2 rounded-full transition-colors border border-zinc-800 cursor-pointer flex items-center justify-center shadow-lg"
                    title="Close Video"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  {/* Backdrop representative graphic */}
                  <img 
                    src="https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6a3243faad2dd4493c086f47.png" 
                    alt="AI Twin Studio Dashboard mockup" 
                    className="w-full h-full object-cover opacity-35 filter blur-[2px] scale-[1.03] transition-all group-hover:scale-100 group-hover:opacity-40"
                  />
                  
                  {/* Absolute positioning items */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  
                  <div className="absolute flex flex-col items-center gap-4 text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-[#dcfb80] hover:scale-110 active:scale-95 text-zinc-950 flex items-center justify-center shadow-lg transition-transform duration-300">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-tight">Watch the AI Twin Studio Demo</h4>
                      <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-md">
                        Take a 2-minute visual tour showing how our 24+ integrated content engines power unlimited organic viral traffic.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 3. TRUST & BENEFIT BADGES */}
      <section id="features" className="py-12 border-y border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#dcfb80] flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">One-Time Lifetime Access</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">No recurring monthly fees. Choose your level, buy once, and unlock creative engines forever.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#dcfb80] flex-shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">24+ Tailored Studios</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Specific engines targeting Baddies, Memes, Headshots, TikTok B-roll, and YouTube Thumbnails.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#dcfb80] flex-shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Prorated Upgrades</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Always pay the absolute price difference. Upgrade your creative tier later with zero penalties.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#dcfb80] flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">First Promoter Cookie Sync</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Referral cookies are tracked directly on our servers, ensuring pristine affiliate sync.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DETAILS OF THE 24+ APPS (INTERACTIVE CATALOGUE) */}
      <section id="directory" className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-[#dcfb80] uppercase tracking-wider mb-4">
              Interactive Library Explorer
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
              Discover Each AI Studio Engine
            </h2>
            <p className="text-sm md:text-base text-zinc-400">
              Browse the actual applications included in our payment packages. Toggle levels or utilize search below to filter the precise creative tool you need.
            </p>
          </div>

          {/* Filtering Workspace controls */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Search studio applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#dcfb80] transition-colors"
              />
            </div>

            {/* Level Selector Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950/80 border border-zinc-800 rounded-xl w-full md:w-auto overflow-x-auto">
              <button
                onClick={() => setSelectedLevel('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedLevel === 'all' ? 'bg-[#dcfb80] text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                All Levels
              </button>
              <button
                onClick={() => setSelectedLevel('starter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedLevel === 'starter' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Starter Level
              </button>
              <button
                onClick={() => setSelectedLevel('pro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedLevel === 'pro' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Pro Level
              </button>
              <button
                onClick={() => setSelectedLevel('elite')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedLevel === 'elite' ? 'bg-zinc-800 text_white border border-[#dcfb80]/20' : 'text-zinc-400 hover:text-white'}`}
              >
                Elite Level
              </button>
            </div>

            {/* Category Selector Tab */}
            <div className="flex flex-wrap gap-1.5 items-center w-full md:w-auto">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-1 hidden lg:inline">Filters:</span>
              <div className="flex flex-wrap gap-1 bg-zinc-950/40 p-1 rounded-lg border border-zinc-800/60 overflow-x-auto max-w-full">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap capitalize ${selectedCategory === cat ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Grid */}
          {filteredApps.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-500 text-sm">No applications found matching your criteria. Try adjustments to filters.</p>
              <button onClick={() => { setSearchTerm(''); setSelectedLevel('all'); setSelectedCategory('all'); }} className="mt-4 text-xs font-bold text-[#dcfb80] hover:underline">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app, idx) => {
                // Tier configuration colors
                const isElite = app.level === 'elite';
                const isPro = app.level === 'pro';
                
                return (
                  <div
                    key={app.id || idx}
                    className="group bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 relative shadow-md"
                  >
                    {/* Level Visual Badge Overlay */}
                    <div className="absolute top-2.5 right-2.5 z-15 flex items-center gap-1">
                      {isElite && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-[9px] text-indigo-300 font-bold uppercase tracking-wide">
                          Elite Class
                        </span>
                      )}
                      {isPro && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[9px] text-cyan-300 font-bold uppercase tracking-wide">
                          Pro Class
                        </span>
                      )}
                      {app.level === 'starter' && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[9px] text-zinc-300 font-bold uppercase tracking-wide">
                          Starter Class
                        </span>
                      )}
                    </div>

                    {/* Image / GIF container */}
                    <div className="aspect-[16/10] overflow-hidden bg-zinc-900 border-b border-zinc-900 relative">
                      {app.image ? (
                        <img
                          src={app.image}
                          alt={app.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                          <ImageIcon size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                    </div>

                    {/* Details content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title & Classification Tag */}
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="text-base font-bold text-white group-hover:text-[#dcfb80] transition-colors">
                            {app.title}
                          </h3>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded">
                            {Array.isArray(app.category) ? app.category[0] : app.category}
                          </span>
                        </div>
                        
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {app.description}
                        </p>
                      </div>

                      {/* Launch representation */}
                      <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                          Ready in your workspace
                        </span>
                        
                        <button
                          onClick={() => handleCheckoutIntent(app.level as 'starter' | 'pro' | 'elite')}
                          className="text-[10px] font-extrabold text-[#dcfb80] hover:text-white uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                        >
                          <span>Get Access</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 px-4 md:px-8 border-t border-zinc-900 bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4 animate-fade-in">
              <span className="text-[#dcfb80]">Real Reviews</span> From Real People.
            </h2>
            <p className="text-sm md:text-base text-zinc-400">
              These are just a few of the results and experiences shared by people who've used the AI Twin Studio™ to build their very own hyper-realistic AI Twin.
            </p>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {testimonials.map((item, idx) => (
              <div 
                key={idx}
                className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6 hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>

                  {/* Heading */}
                  <h4 className="text-base font-black text-white mb-3 leading-snug">
                    {item.heading}
                  </h4>

                  {/* Video/Image Still or Active Player */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 mb-4 group/video">
                    {playingVideoIdx === idx ? (
                      <div className="w-full h-full relative">
                        {item.videoUrl ? (
                          item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtu.be') || item.videoUrl.includes('vimeo.com') ? (
                            <iframe
                              src={
                                item.videoUrl.includes('youtube.com/embed') 
                                  ? item.videoUrl 
                                  : item.videoUrl.includes('watch?v=') 
                                  ? `https://www.youtube.com/embed/${item.videoUrl.split('v=')[1]?.split('&')[0]}`
                                  : item.videoUrl
                              }
                              title={item.name}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <video 
                              src={item.videoUrl} 
                              controls 
                              autoPlay 
                              playsInline 
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          // Developer Friendly setup tutorial helper overlay
                          <div className="absolute inset-0 bg-black/95 p-4 flex flex-col justify-between text-left">
                            <div>
                              <p className="text-[11px] font-bold text-[#dcfb80] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Sparkles size={11} /> Ready to Insert Video!
                              </p>
                              <p className="text-[10px] text-zinc-300 leading-normal">
                                Replace the placeholder for <strong>{item.name}</strong> by opening file <code className="text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded">src/components/SalesPage.tsx</code> and editing line <strong>{22 + idx * 10}</strong>:
                              </p>
                              <pre className="text-[9px] text-[#dcfb80] bg-black/60 p-2 rounded border border-zinc-800 font-mono mt-2 overflow-x-auto">
                                {`videoUrl: "https://yourcdn.com/video.mp4"`}
                              </pre>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayingVideoIdx(null);
                              }}
                              className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold rounded-lg border border-zinc-800 transition-colors uppercase tracking-wider"
                            >
                              Got it, close
                            </button>
                          </div>
                        )}
                        
                        {item.videoUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlayingVideoIdx(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/85 rounded-full text-zinc-400 hover:text-white transition-colors border border-white/10 z-10"
                            title="Close video"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div 
                        className="w-full h-full cursor-pointer relative"
                        onClick={() => setPlayingVideoIdx(idx)}
                      >
                        {item.videoThumb ? (
                          <img 
                            src={item.videoThumb} 
                            alt={item.name} 
                            className="w-full h-full object-cover opacity-60 group-hover/video:scale-[1.03] transition-transform duration-500"
                          />
                        ) : item.videoUrl ? (
                          <video 
                            src={item.videoUrl}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-60 group-hover/video:scale-[1.03] transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-900" />
                        )}
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white scale-100 group-hover/video:scale-105 active:scale-95 transition-all duration-300 shadow-xl">
                            <Play className="w-4 h-4 fill-current ml-0.5 text-[#dcfb80]" />
                          </div>
                        </div>
                        
                        {/* Enable sound badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 rounded-lg flex items-center gap-1.5 text-[10px] text-white font-bold border border-white/5 uppercase tracking-wider">
                          <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Enable sound</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body Text */}
                  <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6">
                    {item.body}
                  </p>
                </div>

                {/* Account Details */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-900/40">
                  <img 
                    src={item.avatar} 
                    alt={item.name} 
                    className="w-9 h-9 rounded-full object-cover border border-zinc-800"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.name}</h5>
                    <p className="text-[10px] text-zinc-500 font-semibold">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* High Impact Success Showcase Section (Kerry Ellis Photosheet results) */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-[32px] p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column Text block */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 rounded-full uppercase tracking-wider">
                  <CheckCircle size={12} />
                  <span>Verified Case Study</span>
                </div>
                
                <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-[1.15]">
                  "Feel like I've <span className="text-[#dcfb80]">saved loads of money</span> not going round the world with a photographer!"
                </h3>

                <div className="flex items-center gap-3">
                  <img 
                    src="https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/6994c665d614c956bc014622.png" 
                    alt="Kerry Ellis Avatar" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#dcfb80]/20"
                  />
                  <div>
                    <h4 className="font-extrabold text-white text-base">Kerry Ellis</h4>
                    <p className="text-xs text-zinc-400 font-medium">Kerry Ellis Travel Founder</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Verified Member
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Grid Collage */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Left big item */}
                  <div className="sm:col-span-8 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img 
                      src="https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/698e3ebca44964e01ab1a3d1.png" 
                      alt="AI Twin Courtyard Shoot" 
                      className="w-full h-full object-cover filter brightness-95 hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Right small item stacking */}
                  <div className="sm:col-span-4 flex flex-row sm:flex-col gap-4">
                    <div className="flex-1 sm:flex-none aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                      <img 
                        src="https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/698e3ebc211b6550c992f395.png" 
                        alt="AI Twin City Shoot" 
                        className="w-full h-full object-cover filter brightness-95 hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 sm:flex-none aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                      <img 
                        src="https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/698e3ebc24813cc72ea49f1b.png" 
                        alt="AI Twin Studio Shoot" 
                        className="w-full h-full object-cover filter brightness-95 hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 sm:flex-none aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                      <img 
                        src="https://assets.cdn.filesafe.space/M9NfAaqREboWyOX206Po/media/698e3ebc211b65e97392f394.png" 
                        alt="AI Twin Airport Lounge" 
                        className="w-full h-full object-cover filter brightness-95 hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. PRICING & LEVEL SELECTION CARDS */}
      <section id="pricing" className="py-20 px-4 md:px-8 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-zinc-900/40 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-[#dcfb80] uppercase tracking-wider mb-4">
              Membership Gateways
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
              Fair, Transparent Pricing
            </h2>
            <p className="text-sm md:text-base text-zinc-400">
              One purchase, lifetime ownership of your chosen creation systems. Prorated difference tracking is calculated instantly if you wish to upgrade levels later.
            </p>
          </div>

          {/* Core Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* TIER 1: STARTER */}
            <div className="bg-[#030303] border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all shadow-md">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Starter Pack</h3>
                    <p className="text-xs text-zinc-500 mt-1">Perfect gateway to content fine-tunes.</p>
                  </div>
                  <span className="text-[10px] bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider px-2 py-0.5 border border-zinc-800 rounded">
                    Level One
                  </span>
                </div>

                <div className="my-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl md:text-5xl font-black text-white">$27</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">one-time</span>
                  </div>
                  <p className="text-[10px] font-semibold text-zinc-500 mt-1">Unlock 5 core studio models</p>
                </div>

                <hr className="border-zinc-900 my-6" />

                <div className="space-y-3.5 mb-8 text-sm">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Included Applications ({mockApps.filter(a => a.level === 'starter').length}):</p>
                  
                  {mockApps.filter(a => a.level === 'starter').map((app, i) => (
                    <div key={app.id || i} className="flex gap-2.5 items-start text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-zinc-100">{app.title}</span>
                        <span className="text-[10px] text-zinc-500 line-clamp-1">{app.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleCheckoutIntent('starter')}
                  className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold text-sm rounded-xl border border-zinc-800 transition-all cursor-pointer text-center"
                >
                  Buy Starter Pack
                </button>
                <p className="text-center text-[10px] text-zinc-500 mt-3 font-medium">Includes lifetime access & free upgrades</p>
              </div>
            </div>

            {/* TIER 2: PRO */}
            <div className="bg-[#030303] border-2 border-[#dcfb80] rounded-3xl p-8 flex flex-col justify-between relative shadow-[0_0_50px_rgba(220,251,128,0.06)] transform lg:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#dcfb80] text-[#030303] text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                <span>MOST POPULAR VALUE</span>
              </div>

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Pro Studio</h3>
                    <p className="text-xs text-[#dcfb80] mt-1 font-semibold">Essential suite for full content agencies.</p>
                  </div>
                  <span className="text-[10px] bg-[#dcfb80]/10 text-[#dcfb80] font-bold uppercase tracking-wider px-2 py-0.5 border border-[#dcfb80]/20 rounded">
                    Level Two
                  </span>
                </div>

                <div className="my-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl md:text-5xl font-black text-[#dcfb80]">$97</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">one-time</span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#dcfb80] mt-1">Unlock 15 content & image studios</p>
                </div>

                <hr className="border-zinc-900 my-6" />

                <div className="space-y-4 mb-8 text-sm">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Everything in Starter click plus ({mockApps.filter(a => a.level === 'pro').length} custom systems):</p>
                  
                  {mockApps.filter(a => a.level === 'pro').slice(0, 6).map((app, i) => (
                    <div key={app.id || i} className="flex gap-2.5 items-start text-zinc-300">
                      <Check className="w-4 h-4 text-[#dcfb80] mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-zinc-100">{app.title}</span>
                        <span className="text-[10px] text-zinc-500 line-clamp-1">{app.description}</span>
                      </div>
                    </div>
                  ))}
                  {mockApps.filter(a => a.level === 'pro').length > 6 && (
                    <div className="flex gap-2.5 items-center text-zinc-500 pl-6 text-xs">
                      <span>+ {mockApps.filter(a => a.level === 'pro').length - 6} additional Pro custom systems</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleCheckoutIntent('pro')}
                  className="w-full py-4 px-4 bg-[#dcfb80] hover:bg-opacity-95 text-zinc-950 font-extrabold text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(220,251,128,0.2)] cursor-pointer text-center"
                >
                  Buy Pro Pack
                </button>
                <p className="text-center text-[10px] text-[#dcfb80] mt-3 font-semibold uppercase tracking-wider">★ Best Seller</p>
              </div>
            </div>

            {/* TIER 3: ELITE */}
            <div className="bg-[#030303] border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all shadow-md">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Elite Studio Pass</h3>
                    <p className="text-xs text-zinc-500 mt-1">Uncapped control. Zero limitations.</p>
                  </div>
                  <span className="text-[10px] bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider px-2 py-0.5 border border-zinc-800 rounded">
                    Level Three
                  </span>
                </div>

                <div className="my-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl md:text-5xl font-black text-white">$197</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">one-time</span>
                  </div>
                  <p className="text-[10px] font-semibold text-zinc-500 mt-1">Unlock all 24+ creator frameworks</p>
                </div>

                <hr className="border-zinc-900 my-6" />

                <div className="space-y-4 mb-8 text-sm">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Complete Master Collection ({mockApps.filter(a => a.level === 'elite').length} active models):</p>
                  
                  {mockApps.filter(a => a.level === 'elite').slice(0, 6).map((app, i) => (
                    <div key={app.id || i} className="flex gap-2.5 items-start text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-zinc-100">{app.title}</span>
                        <span className="text-[10px] text-zinc-500 line-clamp-1">{app.description}</span>
                      </div>
                    </div>
                  ))}
                  {mockApps.filter(a => a.level === 'elite').length > 6 && (
                    <div className="flex gap-2.5 items-center text-zinc-500 pl-6 text-xs">
                      <span>+ {mockApps.filter(a => a.level === 'elite').length - 6} advanced systems</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleCheckoutIntent('elite')}
                  className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold text-sm rounded-xl border border-zinc-800 transition-all cursor-pointer text-center"
                >
                  Buy Elite Suite
                </button>
                <p className="text-center text-[10px] text-zinc-500 mt-3 font-medium">All starter & pro applications included</p>
              </div>
            </div>

          </div>

          {/* Secure gateway note */}
          <div className="mt-12 text-center text-xs text-zinc-500 max-w-md mx-auto flex items-center justify-center gap-2">
            <ShieldCheck className="text-[#dcfb80] w-4 h-4 flex-shrink-0" />
            <span>Secure Checkout powered by Stripe. Prorated upgrades work dynamically if you upgrade in the future.</span>
          </div>

        </div>
      </section>

      {/* 6. PARTNERS & AFFILIATES DIVISION */}
      <section id="affiliate" className="py-20 px-4 md:px-8 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="max-w-md">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4">
                Partner Affiliate Program
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3">
                Do You Want to Earn Residual Commissions?
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6">
                Earn 50% recurring payouts by promoting AI Twin Studio. We utilize First Promoter for referral cookie attribution, tracking active clicks, leads, and paying clients smoothly.
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                <CheckCircle size={14} className="text-[#dcfb80]" />
                <span>Cookies persistence up to 60 days</span>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto text-center">
              <a
                href="https://aitwinstudio.firstpromoter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-[#dcfb80] text-black font-extrabold px-6 py-3.5 rounded-xl text-xs hover:opacity-95 transform hover:scale-[1.01] transition-all cursor-pointer shadow-lg w-full md:w-auto"
              >
                <span>Partner Portal Login</span>
                <ExternalLink size={14} />
              </a>
              <p className="text-[10px] text-zinc-500 mt-2">Powered by aitwinstudio.firstpromoter.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ DIVISION */}
      <section id="faq" className="py-20 px-4 md:px-8 border-t border-zinc-900 bg-[#030303]/40">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-white tracking-tight mb-3">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-400">Everything you need to know about AI Twin Studio, proration payments, and partners.</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-5 px-6 flex justify-between items-center text-left hover:bg-zinc-900/30 transition-all"
                  >
                    <span className="font-bold text-sm md:text-base text-zinc-200">{item.q}</span>
                    {isOpen ? <ChevronUp size={18} className="text-[#dcfb80]" /> : <ChevronDown size={18} className="text-zinc-500" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 text-xs md:text-sm text-zinc-400 border-t border-zinc-900/50 leading-relaxed bg-zinc-900/10">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-zinc-900 py-12 px-4 md:px-8 text-center bg-black/95">
        <p className="text-xs text-zinc-500 mb-2">© 2026 AI Twin Studio. All rights reserved.</p>
        <p className="text-[10px] text-zinc-600">Enterprise workspace infrastructure powered by Cloud Run and Google AI Studio.</p>
      </footer>

      {/* 9. ONBOARDING & SIGNUP AUTH MODAL */}
      <AnimatePresence>
        {authModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#dcfb80]/10 border border-[#dcfb80]/20 text-[#dcfb80] flex items-center justify-center mx-auto mb-3">
                  <Lock size={18} />
                </div>
                
                <h3 className="text-xl font-black text-white">
                  {authModal.mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                </h3>
                
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  {authModal.selectedTier 
                    ? `Set up your credentials to complete secure checkout for the ${authModal.selectedTier.charAt(0).toUpperCase() + authModal.selectedTier.slice(1)} Pack.` 
                    : 'Access your integrated AI Twin Studio channels.'}
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-[11px] text-red-400 flex items-start gap-2">
                  <Info size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#dcfb80] transition-colors placeholder-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#dcfb80] transition-colors"
                  />
                  {authModal.mode === 'signup' && (
                    <span className="text-[10px] text-zinc-500 block mt-1">Must be at least 6 characters.</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-[#dcfb80] hover:bg-opacity-95 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_15px_rgba(220,251,128,0.15)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <span>Creating Security Tunnel...</span>
                  ) : (
                    <>
                      <span>{authModal.mode === 'signup' ? 'Continue with Checkout' : 'Secure Log In'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <hr className="border-zinc-900 my-6" />

              <div className="text-center text-xs">
                {authModal.mode === 'signup' ? (
                  <p className="text-zinc-500">
                    Already have an account?{' '}
                    <button 
                      onClick={() => { setAuthError(null); setAuthModal(prev => ({ ...prev, mode: 'signin' })); }} 
                      className="text-[#dcfb80] font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p className="text-zinc-500">
                    Need an account?{' '}
                    <button 
                      onClick={() => { setAuthError(null); setAuthModal(prev => ({ ...prev, mode: 'signup' })); }} 
                      className="text-[#dcfb80] font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
                    >
                      Sign Up
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
