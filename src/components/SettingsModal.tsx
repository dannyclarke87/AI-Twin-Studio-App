import React, { useState, useEffect } from 'react';
import { Key, X } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [falKey, setFalKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const gk = localStorage.getItem('app_gemini_key');
    const fk = localStorage.getItem('app_fal_key');
    if (gk) setGeminiKey(gk);
    if (fk) setFalKey(fk);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('app_gemini_key', geminiKey);
    localStorage.setItem('app_fal_key', falKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="w-full max-w-[400px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-[#dcfb80]">
              <Key size={24} />
            </div>
            <h2 className="text-2xl font-semibold">API Credentials</h2>
          </div>
          
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            AI Twin Studio uses a Bring-Your-Own-Key (BYOK) model. Your credentials never leave your browser and are stored securely in local storage.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.05em] text-zinc-400 mb-1.5">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#dcfb80] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-[0.05em] text-zinc-400 mb-1.5">
                Fal.AI Key
              </label>
              <input
                type="password"
                placeholder="key-..."
                value={falKey}
                onChange={(e) => setFalKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#dcfb80] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#dcfb80] text-black font-semibold py-3 flex items-center justify-center gap-2 rounded-md mt-2 hover:opacity-90 transition-opacity"
            >
              {isSaved ? (
                <>Saved Successfully ✓</>
              ) : (
                <>Save Credentials</>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
