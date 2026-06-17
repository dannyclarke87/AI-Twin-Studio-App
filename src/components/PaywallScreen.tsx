import React from 'react';
import { Lock, Check, Sparkles, LogOut } from 'lucide-react';

interface PaywallScreenProps {
  onUpgrade: (tier: 'starter' | 'pro' | 'elite') => void;
  onLogout: () => void;
}

export function PaywallScreen({ onUpgrade, onLogout }: PaywallScreenProps) {
  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 md:px-8 font-sans text-zinc-100 flex flex-col justify-center items-center">
      
      {/* Header and Title */}
      <div className="text-center max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-xs text-[#dcfb80] mb-4">
          <Lock className="w-3 h-3" />
          <span>Membership Access Required</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Choose Your Creative Tier
        </h1>
        <p className="text-sm md:text-base text-zinc-400">
          Unlock the full suite of AI Twin Studio tools. Choose the plan that fits your production size.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl items-stretch mb-12">
        
        {/* Starter Plan */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col hover:border-zinc-700 transition-all">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-zinc-300 mb-1">Starter</h3>
            <p className="text-xs text-zinc-500 min-h-[32px]">Perfect for individuals starting their AI content journey.</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-extrabold">£1</span>
              <span className="text-zinc-500 text-xs font-semibold">one-time</span>
            </div>
          </div>

          <button
            onClick={() => onUpgrade('starter')}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-semibold py-3 rounded-lg mb-8 transition-all border border-zinc-700"
          >
            Get Starter Access
          </button>

          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Includes 5 core apps:</h4>
            {[
              "Pro Studio",
              "Hyper Realism",
              "Baddie Studio",
              "Meme Studio",
              "UGC Studio"
            ].map((app) => (
              <div key={app} className="flex gap-2.5 items-start text-sm text-zinc-300">
                <Check className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                <span>{app}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Plan (Highlighted) */}
        <div className="bg-zinc-900 border-2 border-[#dcfb80] rounded-2xl p-6 md:p-8 flex flex-col relative shadow-[0_0_40px_rgba(220,251,128,0.08)] transform md:-translate-y-2">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#dcfb80] text-zinc-950 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-current" />
            Most Popular
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-1">Pro</h3>
            <p className="text-xs text-zinc-400 min-h-[32px]">Essential toolbox for full-time content developers.</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-extrabold text-[#dcfb80]">£2</span>
              <span className="text-zinc-500 text-xs font-semibold">one-time</span>
            </div>
          </div>

          <button
            onClick={() => onUpgrade('pro')}
            className="w-full bg-[#dcfb80] hover:opacity-90 text-zinc-950 text-sm font-bold py-3 rounded-lg mb-8 transition-all shadow-md"
          >
            Get Pro Access
          </button>

          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#dcfb80] mb-2">Everything in Starter plus:</h4>
            {[
              "Studio Dashboard",
              "Podcast Studio",
              "Campaign Builder",
              "Talking Head Studio",
              "Whiteboard Studio",
              "Headshot Studio",
              "AI Upscaler & Wall Text",
              "Pet, Family & Duo Studios",
              "Viral Fan Cam, Prompt Library",
              "Thumbnail Studio"
            ].map((feature) => (
              <div key={feature} className="flex gap-2.5 items-start text-sm text-zinc-100">
                <Check className="w-4 h-4 text-[#dcfb80] mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Elite Plan */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col hover:border-zinc-700 transition-all">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-zinc-300 mb-1">Elite</h3>
            <p className="text-xs text-zinc-500 min-h-[32px]">Full creative agency access. Zero boundaries.</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-extrabold">£197</span>
              <span className="text-zinc-500 text-xs font-semibold">one-time</span>
            </div>
          </div>

          <button
            onClick={() => onUpgrade('elite')}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-semibold py-3 rounded-lg mb-8 transition-all border border-zinc-700"
          >
            Get Elite Access
          </button>

          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">All Access Pass:</h4>
            {[
              "All Starter & Pro Studios",
              "VSL B-Roll Studio",
              "POV Video Studio",
              "Voice Cloning (ElevenLabs)",
              "Content Optimization Engines",
              "Script Writer psychological triggers",
              "Affiliate Studio (AI Influencers)",
              "Carousel & Text Image Studios"
            ].map((feature) => (
              <div key={feature} className="flex gap-2.5 items-start text-sm text-zinc-300">
                <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer controls */}
      <div className="text-center max-w-md">
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-transparent border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-lg transition-all"
        >
          <LogOut size={14} />
          <span>Exit Account & Log Out</span>
        </button>
      </div>

    </div>
  );
}
