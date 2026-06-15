import React from 'react';
import { Lock } from 'lucide-react';

interface PaywallScreenProps {
  onUpgrade: () => void;
  onLogout: () => void;
}

export function PaywallScreen({ onUpgrade, onLogout }: PaywallScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <div className="w-full max-w-[400px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8 text-center flex flex-col items-center">
        
        <Lock className="w-12 h-12 mb-4 text-[#dcfb80]" strokeWidth={1.5} />

        <h2 className="text-2xl font-semibold mb-2">Premium Studio Locked</h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Account created successfully. Subscribe to unlock the AI Twin Studio tools.
        </p>

        <button
          onClick={onUpgrade}
          className="w-full bg-[#dcfb80] text-black text-base font-semibold py-3 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-3"
        >
          Upgrade via Stripe
        </button>

        <button
          onClick={onLogout}
          className="w-full bg-transparent border border-zinc-700 text-zinc-100 text-sm font-semibold py-3 rounded-md hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
