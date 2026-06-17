import React, { useState, useEffect } from 'react';
import { AppItem, Category, AuthState } from '../types';
import { mockApps } from '../data';
import { 
  Search, 
  Star, 
  LogOut, 
  Settings as SettingsIcon, 
  LayoutGrid, 
  ArrowUpRight, 
  Shield, 
  BookOpen, 
  Lock, 
  Crown, 
  Sparkles, 
  X, 
  ChevronRight,
  Check,
  Users
} from 'lucide-react';

interface DashboardScreenProps {
  onLogout: () => void;
  onOpenSettings: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onGettingStarted?: () => void;
  userStatus: AuthState;
  onUpgrade: (tier: 'starter' | 'pro' | 'elite') => void;
}

const CATEGORIES: Category[] = ['All', 'Video', 'Images', 'LinkedIn', 'Memes', 'Voice', 'Text'];

export function DashboardScreen({ 
  onLogout, 
  onOpenSettings, 
  isAdmin, 
  onOpenAdmin, 
  onGettingStarted, 
  userStatus, 
  onUpgrade 
}: DashboardScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sidebarFilter, setSidebarFilter] = useState<'All Apps' | 'Favorites'>('All Apps');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Load favorites from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('app_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  // Save favorites to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('app_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const isAppUnlocked = (appLevel: 'starter' | 'pro' | 'elite') => {
    if (userStatus === 'admin' || userStatus === 'legacy' || userStatus === 'paid' || userStatus === 'elite') {
      return true;
    }
    if (userStatus === 'pro') {
      return appLevel === 'starter' || appLevel === 'pro';
    }
    if (userStatus === 'starter') {
      return appLevel === 'starter';
    }
    return false;
  };

  const filteredApps = mockApps.filter(app => {
    // 1. Sidebar Filter
    if (sidebarFilter === 'Favorites' && !favorites.includes(app.id)) return false;
    // 2. Category Pill Filter
    if (activeCategory !== 'All') {
      if (Array.isArray(app.category)) {
        if (!app.category.includes(activeCategory as Exclude<Category, 'All'>)) return false;
      } else {
        if (app.category !== activeCategory) return false;
      }
    }
    // 3. Search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!app.title.toLowerCase().includes(q) && !app.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const getTierDisplay = (status: AuthState) => {
    switch (status) {
      case 'starter': return { label: 'Starter', color: 'text-zinc-400 border-zinc-700 bg-zinc-900' };
      case 'pro': return { label: 'Pro', color: 'text-[#dcfb80] border-[#dcfb80]/20 bg-[#dcfb80]/10' };
      case 'elite': return { label: 'Elite', color: 'text-purple-400 border-purple-500/20 bg-purple-500/10' };
      case 'paid': return { label: 'Elite', color: 'text-purple-400 border-purple-200/20 bg-purple-500/10' };
      case 'admin': return { label: 'Admin', color: 'text-red-400 border-red-500/20 bg-red-500/10' };
      case 'legacy': return { label: 'Legacy', color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10' };
      default: return { label: 'Unpaid', color: 'text-red-400 border-red-500/20 bg-red-400/10' };
    }
  };

  const activeLevelInfo = getTierDisplay(userStatus);
  const showGlobalUpgradeButton = userStatus === 'starter' || userStatus === 'pro' || userStatus === 'unpaid';

  return (
    <div className="h-[100dvh] bg-zinc-950 flex font-sans text-zinc-100 overflow-hidden">
      
      {/* Sidebar - Fixed on desktop */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex-shrink-0 flex flex-col p-6 z-10 hidden md:flex">
        <div className="text-xl font-extrabold tracking-tight text-[#dcfb80] mb-8 uppercase leading-none">
          AI Twin Studio
        </div>

        {/* Current Active Plan Widget */}
        <div className="mb-8 p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
            <Crown size={12} className="text-yellow-400" />
            Your Account Plan
          </div>
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${activeLevelInfo.color}`}>
              {activeLevelInfo.label}
            </span>
            {showGlobalUpgradeButton && (
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="text-[11px] font-bold text-[#dcfb80] hover:underline flex items-center gap-0.5"
              >
                Upgrade <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <button
            onClick={onGettingStarted}
            className={`w-full flex items-center gap-3 p-2.5 rounded-md text-sm font-medium text-zinc-400 hover:text-[#dcfb80] transition-colors`}
          >
            <BookOpen size={18} />
            <span>Getting Started</span>
          </button>
          
          <button
            onClick={() => setSidebarFilter('All Apps')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-md text-sm font-medium transition-colors ${
              sidebarFilter === 'All Apps'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-[#dcfb80]'
            }`}
          >
            <LayoutGrid size={18} />
            <span>All Apps</span>
          </button>
          
          <button
            onClick={() => setSidebarFilter('Favorites')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-md text-sm font-medium transition-colors ${
              sidebarFilter === 'Favorites'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-[#dcfb80]'
            }`}
          >
            <Star size={18} className={sidebarFilter === 'Favorites' ? 'fill-current text-[#dcfb80]' : ''} />
            <span>Favorites</span>
          </button>
          
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-3 p-2.5 rounded-md text-sm font-medium text-zinc-400 hover:text-[#dcfb80] transition-colors`}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>

          <a
            href="https://aitwinstudio.firstpromoter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-2.5 rounded-md text-sm font-medium text-zinc-400 hover:text-[#dcfb80] transition-colors"
          >
            <span className="flex items-center gap-3">
              <Users size={18} />
              <span>Affiliate</span>
            </span>
            <ArrowUpRight size={14} className="opacity-60" />
          </a>
          
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className={`w-full flex items-center gap-3 p-2.5 rounded-md text-sm font-medium text-zinc-400 hover:text-purple-400 transition-colors mt-4`}
            >
              <Shield size={18} />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-2.5 rounded-md text-sm font-medium text-[#ff6b6b] hover:bg-zinc-800 transition-colors"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        
        {/* Top Bar for Mobile */}
        <div className="px-6 py-4 border-b border-zinc-850 bg-zinc-950 flex items-center md:hidden flex-shrink-0 gap-3">
          <div className="text-lg font-extrabold tracking-tight text-[#dcfb80] uppercase leading-none">
            AI Twin
          </div>
          
          {/* Mobile Badge & Upgrade */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${activeLevelInfo.color}`}>
              {activeLevelInfo.label}
            </span>
            {showGlobalUpgradeButton && (
              <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="bg-[#dcfb80] text-[#121212] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide"
              >
                Upgrade
              </button>
            )}
          </div>

          <button onClick={onOpenSettings} className="text-zinc-400"><SettingsIcon size={20}/></button>
          {isAdmin && (
            <button onClick={onOpenAdmin} className="text-zinc-400 hover:text-purple-400">
              <Shield size={20}/>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="py-4 px-6 md:px-8 border-b border-zinc-800 bg-zinc-950 flex-shrink-0">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex items-center px-4 w-full md:max-w-[400px]">
            <Search className="text-zinc-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Search AI tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0 text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="py-4 px-6 md:px-8 bg-zinc-950 flex gap-2 flex-shrink-0 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                activeCategory === category
                  ? 'bg-[#dcfb80] text-black border border-[#dcfb80]'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-850 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Dashboard Canvas Grid */}
        <div className="flex-1 p-6 md:px-8 overflow-y-auto align-content-start">
          {filteredApps.length === 0 ? (
            <div className="text-center text-zinc-500 mt-20">
              <p className="text-sm">No apps found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
              {filteredApps.map(app => {
                const isFav = favorites.includes(app.id);
                const unlocked = isAppUnlocked(app.level);

                return (
                  <div 
                    key={app.id} 
                    onClick={() => {
                      if (!unlocked) {
                        setIsUpgradeModalOpen(true);
                      }
                    }}
                    className={`group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-[#dcfb80] transition-all duration-200 hover:-translate-y-1 flex flex-col cursor-pointer shrink-0 ${
                      !unlocked ? 'opacity-85 hover:opacity-100' : ''
                    }`}
                  >
                    
                    {/* Image Area */}
                    <div className="aspect-video bg-gradient-to-tr from-zinc-900 to-zinc-800 relative w-full overflow-hidden">
                      {app.image && (
                        <img 
                          src={app.image} 
                          alt={app.title} 
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            unlocked 
                              ? 'opacity-60 group-hover:opacity-100' 
                              : 'opacity-25 hover:opacity-40 blur-[1px]'
                          }`} 
                        />
                      )}

                      {/* Floating Lock Badge */}
                      {!unlocked && (
                        <div className="absolute top-3 left-3 bg-zinc-950/90 border border-zinc-800 text-yellow-400 font-extrabold uppercase tracking-wider text-[9px] px-2 py-1 rounded flex items-center gap-1.5 shadow-md">
                          <Lock size={10} strokeWidth={2.5} />
                          <span>{app.level.toUpperCase()} ONLY</span>
                        </div>
                      )}

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (unlocked) toggleFavorite(app.id, e);
                        }}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center transition-colors z-10 hover:bg-black/60 ${isFav ? 'text-[#dcfb80]' : 'text-white hover:text-[#dcfb80]'}`}
                      >
                        <Star size={16} className={isFav ? 'fill-current text-[#dcfb80]' : 'text-white group-hover:text-[#dcfb80]'} />
                      </button>
                    </div>

                    <div className="p-4 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="text-base font-semibold text-zinc-100">
                          {app.title}
                        </h3>
                        {!unlocked && <Lock size={12} className="text-zinc-500" />}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    <div className="p-3 px-4 border-t border-zinc-800 bg-zinc-900/50">
                      {unlocked ? (
                        <a 
                          href={app.link || '#'}
                          target={app.link ? "_blank" : "_self"}
                          rel="noreferrer"
                          className="w-full text-xs uppercase tracking-tight font-bold text-zinc-400 flex items-center justify-between group-hover:text-[#dcfb80] transition-colors"
                        >
                          Launch in Studio 
                          <ArrowUpRight size={16} />
                        </a>
                      ) : (
                        <button
                          onClick={() => setIsUpgradeModalOpen(true)}
                          className="w-full text-xs uppercase tracking-tight font-bold text-zinc-500 hover:text-zinc-300 flex items-center justify-between transition-colors text-left"
                        >
                          <span className="flex items-center gap-1">
                            Upgrade to Unlock
                          </span>
                          <Lock size={14} className="text-yellow-400" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Dynamic Pro-Rata Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-[#dcfb80] w-5 h-5 fill-current" />
                  Upgrade Creative Workspace
                </h3>
                <p className="text-xs text-zinc-400">Current plan: <span className="text-zinc-200 capitalize font-semibold">{userStatus}</span></p>
              </div>
              <button 
                onClick={() => setIsUpgradeModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-1 max-h-[80vh] overflow-y-auto">
              
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400 leading-relaxed">
                🎉 <span className="font-semibold text-zinc-100">Pro-Rata Guarantee:</span> We automatically deduct 100% of your pre-existing plan payment of <span className="text-zinc-200 font-bold">${userStatus === 'starter' ? '27' : userStatus === 'pro' ? '97' : '0'}</span>! You cover only the difference.
              </div>

              <div className="space-y-4">
                
                {/* Option 1: Pro Upgrade Option (Available only if on starter) */}
                {userStatus === 'starter' && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-[#dcfb80] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">Pro Plan Upgrade</span>
                        <span className="bg-[#dcfb80]/10 text-[#dcfb80]/90 border border-[#dcfb80]/20 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Pro-Rated</span>
                      </div>
                      <p className="text-xs text-zinc-400">Get 14 premium studios including Studio Dashboard, Podcast, Campaign Builder, & Talking Heads.</p>
                      <p className="text-[10px] text-zinc-500 font-medium">Standard Price: $97 | Starter Credit: -$27 applied</p>
                    </div>
                    <div className="text-right sm:border-l border-zinc-800 sm:pl-5 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-1.5 flex-shrink-0">
                      <div>
                        <span className="text-2xl font-extrabold text-[#dcfb80]">$70</span>
                        <span className="text-[10px] text-zinc-500 font-semibold block">upgrade total</span>
                      </div>
                      <button
                        onClick={() => {
                          onUpgrade('pro');
                          setIsUpgradeModalOpen(false);
                        }}
                        className="bg-[#dcfb80] hover:opacity-90 text-zinc-950 text-xs font-extrabold px-4 py-2 rounded-lg transition"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Option 2: Elite Upgrade (Available to starter and pro) */}
                {(userStatus === 'starter' || userStatus === 'pro') && (
                  <div className="bg-zinc-950 border-2 border-purple-500/30 rounded-xl p-5 hover:border-purple-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative shadow-[0_0_20px_rgba(168,85,247,0.05)]">
                    <div className="absolute -top-2.5 right-4 bg-purple-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Full Access
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base text-purple-300">Elite Plan All-Access</span>
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Pro-Rated</span>
                      </div>
                      <p className="text-xs text-zinc-400">Unlock absolute full access to every existing and future creative engine in the Studio library.</p>
                      <p className="text-[10px] text-zinc-500 font-medium">Standard Price: $197 | {userStatus === 'starter' ? 'Starter Credit: -$27' : 'Pro Credit: -$97'} applied</p>
                    </div>
                    <div className="text-right sm:border-l border-zinc-800 sm:pl-5 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-1.5 flex-shrink-0">
                      <div>
                        <span className="text-2xl font-extrabold text-purple-400">
                          {userStatus === 'starter' ? '$170' : '$100'}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-semibold block">upgrade total</span>
                      </div>
                      <button
                        onClick={() => {
                          onUpgrade('elite');
                          setIsUpgradeModalOpen(false);
                        }}
                        className="bg-purple-500 hover:bg-purple-400 text-white text-xs font-extrabold px-4 py-2 rounded-lg transition"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Option 3: Full purchase of any packages if status is not paid yet (redundant but fallback) */}
                {userStatus === 'unpaid' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
                      <div>
                        <div className="font-bold text-zinc-100">Starter Plan</div>
                        <div className="text-xs text-[#dcfb80] font-extrabold">$27 one-time</div>
                      </div>
                      <button onClick={() => onUpgrade('starter')} className="bg-[#dcfb80] text-zinc-950 hover:opacity-90 font-bold px-4 py-2 rounded-lg text-xs transition">Select</button>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
                      <div>
                        <div className="font-bold text-zinc-100">Pro Plan</div>
                        <div className="text-xs text-[#dcfb80] font-extrabold">$97 one-time</div>
                      </div>
                      <button onClick={() => onUpgrade('pro')} className="bg-[#dcfb80] text-zinc-950 hover:opacity-90 font-bold px-4 py-2 rounded-lg text-xs transition">Select</button>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-950 p-4 border border-zinc-850 rounded-xl">
                      <div>
                        <div className="font-bold text-zinc-100">Elite Plan</div>
                        <div className="text-xs text-purple-400 font-extrabold">$197 one-time</div>
                      </div>
                      <button onClick={() => onUpgrade('elite')} className="bg-purple-500 text-white hover:bg-purple-400 font-bold px-4 py-2 rounded-lg text-xs transition">Select</button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-end">
              <button 
                onClick={() => setIsUpgradeModalOpen(false)}
                className="bg-zinc-850 hover:bg-zinc-800 hover:text-white text-zinc-300 font-bold text-xs px-5 py-2.5 rounded-lg transition"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-2 flex justify-around">
          <button
            onClick={onGettingStarted}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-md text-xs font-medium text-zinc-400 hover:text-[#dcfb80] transition-colors`}
          >
            <BookOpen size={20} />
            <span>Guide</span>
          </button>

          <button
            onClick={() => setSidebarFilter('All Apps')}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-md text-xs font-medium transition-colors ${
              sidebarFilter === 'All Apps'
                ? 'text-[#dcfb80]'
                : 'text-zinc-400 hover:text-[#dcfb80]'
            }`}
          >
            <LayoutGrid size={20} />
            <span>Apps</span>
          </button>
          
          <button
            onClick={() => setSidebarFilter('Favorites')}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-md text-xs font-medium transition-colors ${
              sidebarFilter === 'Favorites'
                ? 'text-[#dcfb80]'
                : 'text-zinc-400 hover:text-[#dcfb80]'
            }`}
          >
            <Star size={20} className={sidebarFilter === 'Favorites' ? 'fill-current text-[#dcfb80]' : ''} />
            <span>Favorites</span>
          </button>

          <a
            href="https://aitwinstudio.firstpromoter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center gap-1 p-2 rounded-md text-xs font-medium text-zinc-400 hover:text-[#dcfb80] transition-colors"
          >
            <Users size={20} />
            <span>Affiliate</span>
          </a>

          <button
            onClick={onLogout}
            className="flex-1 flex flex-col items-center gap-1 p-2 rounded-md text-xs font-medium text-[#ff6b6b] hover:bg-zinc-800 transition-colors"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
      </nav>

    </div>
  );
}
