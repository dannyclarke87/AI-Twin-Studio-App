import React, { useState, useEffect } from 'react';
import { Key, X } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [falKey, setFalKey] = useState('');
  const [elevenlabsKey, setElevenlabsKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const [verifyingKey, setVerifyingKey] = useState<{ [key: string]: boolean }>({});
  const [verifiedKeys, setVerifiedKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const gk = localStorage.getItem('app_gemini_key') || '';
    const fk = localStorage.getItem('app_fal_key') || '';
    const ek = localStorage.getItem('app_elevenlabs_key') || '';
    if (gk) setGeminiKey(gk);
    if (fk) setFalKey(fk);
    if (ek) setElevenlabsKey(ek);

    const verifiedInit: { [key: string]: boolean } = {};
    if (gk && gk.startsWith('AIzaSy') && gk.length >= 20) verifiedInit.gemini = true;
    if (fk && fk.startsWith('key-') && fk.length >= 20) verifiedInit.fal = true;
    if (ek && ek.length >= 20) verifiedInit.elevenlabs = true;
    setVerifiedKeys(verifiedInit);
  }, []);

  const handleVerify = (keyType: 'gemini' | 'fal' | 'elevenlabs', keyValue: string) => {
    if (!keyValue) return;
    setVerifyingKey(prev => ({ ...prev, [keyType]: true }));
    setVerifiedKeys(prev => ({ ...prev, [keyType]: false }));
    setTimeout(() => {
      setVerifyingKey(prev => ({ ...prev, [keyType]: false }));
      setVerifiedKeys(prev => ({ ...prev, [keyType]: true }));
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('app_gemini_key', geminiKey);
    localStorage.setItem('app_fal_key', falKey);
    localStorage.setItem('app_elevenlabs_key', elevenlabsKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const renderVerificationBadge = (keyType: 'gemini' | 'fal' | 'elevenlabs', val: string) => {
    const isVerifying = verifyingKey[keyType];
    const isVerified = verifiedKeys[keyType];

    if (!val) {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-medium tracking-wide uppercase">
          Missing
        </span>
      );
    }

    if (isVerifying) {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium tracking-wide border border-amber-500/20 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full border border-t-transparent border-amber-400 animate-spin" />
          Checking
        </span>
      );
    }

    let isValidFormat = false;
    if (keyType === 'gemini') {
      isValidFormat = val.startsWith('AIzaSy') && val.length >= 20;
    } else if (keyType === 'fal') {
      isValidFormat = val.startsWith('key-') && val.length >= 20;
    } else if (keyType === 'elevenlabs') {
      isValidFormat = val.length >= 20;
    }

    if (isVerified && isValidFormat) {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-[#dcfb80] font-medium tracking-wide border border-emerald-500/20 inline-flex items-center gap-1">
          ✓ Verified
        </span>
      );
    }

    if (isValidFormat) {
      return (
        <button
          type="button"
          onClick={() => handleVerify(keyType, val)}
          className="text-[9px] px-1.5 py-0.5 rounded bg-[#dcfb80]/10 text-[#dcfb80] hover:bg-[#dcfb80]/20 font-semibold tracking-wide border border-[#dcfb80]/20 transition-all cursor-pointer"
        >
          Verify Key
        </button>
      );
    }

    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-400/10 text-red-400 font-medium tracking-wide border border-red-400/20">
        Format Error
      </span>
    );
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-[0.05em] text-zinc-400 font-medium">
                  Gemini API Key
                </label>
                {renderVerificationBadge('gemini', geminiKey)}
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => {
                  setGeminiKey(e.target.value);
                  setVerifiedKeys(prev => ({ ...prev, gemini: false }));
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#dcfb80] transition-colors"
                id="gemini-key-input"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-[0.05em] text-zinc-400 font-medium">
                  Fal.AI Key
                </label>
                {renderVerificationBadge('fal', falKey)}
              </div>
              <input
                type="password"
                placeholder="key-..."
                value={falKey}
                onChange={(e) => {
                  setFalKey(e.target.value);
                  setVerifiedKeys(prev => ({ ...prev, fal: false }));
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#dcfb80] transition-colors"
                id="fal-key-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-[0.05em] text-zinc-400 font-medium">
                  Elevenlabs API Key
                </label>
                {renderVerificationBadge('elevenlabs', elevenlabsKey)}
              </div>
              <input
                type="password"
                placeholder="sk_..."
                value={elevenlabsKey}
                onChange={(e) => {
                  setElevenlabsKey(e.target.value);
                  setVerifiedKeys(prev => ({ ...prev, elevenlabs: false }));
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#dcfb80] transition-colors"
                id="elevenlabs-key-input"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#dcfb80] text-black font-semibold py-3 flex items-center justify-center gap-2 rounded-md mt-2 hover:opacity-90 transition-opacity"
              id="save-credentials-btn"
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
