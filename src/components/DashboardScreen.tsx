import React, { useState, useEffect } from 'react';
import { AppItem, Category } from '../types';
import { mockApps } from '../data';
import { Search, Star, LogOut, Settings as SettingsIcon, LayoutGrid, ArrowUpRight, Shield } from 'lucide-react';

interface DashboardScreenProps {
  onLogout: () => void;
  onOpenSettings: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

const CATEGORIES: Category[] = ['All', 'Video', 'Images', 'LinkedIn', 'Memes'];

export function DashboardScreen({ onLogout, onOpenSettings, isAdmin, onOpenAdmin }: DashboardScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sidebarFilter, setSidebarFilter] = useState<'All Apps' | 'Favorites'>('All Apps');

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

  const filteredApps = mockApps.filter(app => {
    // 1. Sidebar Filter
    if (sidebarFilter === 'Favorites' && !favorites.includes(app.id)) return false;
    // 2. Category Pill Filter
    if (activeCategory !== 'All' && app.category !== activeCategory) return false;
    // 3. Search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!app.title.toLowerCase().includes(q) && !app.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="h-[100dvh] bg-zinc-950 flex font-sans text-zinc-100 overflow-hidden">
      
      {/* Sidebar - Fixed on desktop */}
      <aside className="w-60 bg-zinc-900 border-r border-zinc-700 flex-shrink-0 flex flex-col p-6 z-10 hidden md:flex">
        <div className="text-xl font-extrabold tracking-tight text-[#dcfb80] mb-12 uppercase leading-none">
          AI Twin Studio
        </div>
        
        <nav className="flex-1 space-y-1">
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
        <div className="px-6 py-4 border-b border-zinc-700 bg-zinc-950 flex items-center md:hidden flex-shrink-0">
          <div className="text-lg font-extrabold tracking-tight text-[#dcfb80] uppercase leading-none flex-1">
            AI Twin Studio
          </div>
          <button onClick={onOpenSettings} className="text-zinc-400"><SettingsIcon size={20}/></button>
          {isAdmin && (
            <button onClick={onOpenAdmin} className="text-zinc-400 ml-4 hover:text-purple-400">
              <Shield size={20}/>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="py-4 px-6 md:px-8 border-b border-zinc-700 bg-zinc-950 flex-shrink-0">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg flex items-center px-4 w-full md:max-w-[400px]">
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
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
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
                return (
                  <div 
                    key={app.id} 
                    className="group bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden hover:border-[#dcfb80] transition-all duration-200 hover:-translate-y-1 flex flex-col cursor-pointer"
                  >
                    
                    {/* Image Area */}
                    <div className="aspect-video bg-gradient-to-tr from-zinc-900 to-zinc-800 relative w-full overflow-hidden">
                      {app.image && (
                        <img 
                          src={app.image} 
                          alt={app.title} 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300" 
                        />
                      )}
                      <button 
                        onClick={(e) => toggleFavorite(app.id, e)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center transition-colors z-10 hover:bg-black/60 ${isFav ? 'text-[#dcfb80]' : 'text-white hover:text-[#dcfb80]'}`}
                      >
                        <Star size={16} className={isFav ? 'fill-current text-[#dcfb80]' : 'text-white group-hover:text-[#dcfb80]'} />
                      </button>
                    </div>

                    <div className="p-4 flex-1">
                      <h3 className="text-base font-semibold text-zinc-100 mb-1">
                        {app.title}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    <div className="p-3 px-4 border-t border-zinc-700">
                      <a 
                        href={app.link || '#'}
                        target={app.link ? "_blank" : "_self"}
                        rel="noreferrer"
                        className="w-full text-xs uppercase tracking-tight font-bold text-zinc-400 flex items-center justify-between group-hover:text-[#dcfb80] transition-colors"
                      >
                        Launch in Studio 
                        <ArrowUpRight size={16} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 p-2 flex justify-around">
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
