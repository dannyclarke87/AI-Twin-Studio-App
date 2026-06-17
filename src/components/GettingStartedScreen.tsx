import React, { useState } from 'react';
import { LayoutGrid, PlayCircle, Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface GettingStartedScreenProps {
  onBackToDashboard: () => void;
}

const VIDEOS = [
  {
    id: 'intro',
    title: 'Platform Overview',
    description: 'A complete walkthrough of the AI Twin Studio platform, showing you how to navigate apps, find your favorites, and manage your account.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // placeholder
  },
  {
    id: 'setup',
    title: 'Initial Setup',
    description: 'Learn how to set up your primary settings, integrate your basic details, and get ready to run your first applet.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'advanced',
    title: 'Advanced Features',
    description: 'Take your experience to the next level by utilizing our advanced AI tools and premium features available in the catalog.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
];

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    question: 'How do I access my favorite apps?',
    answer: 'You can favorite any app by clicking the star icon on its card. Once favorited, you can quickly access it by clicking the "Favorites" filter in the sidebar of your main dashboard.'
  },
  {
    question: 'Can I request a new tool or feature?',
    answer: 'Absolutely. We are constantly updating our platform. You can reach out to our support team with your ideas, and they might just make it into the next update.'
  },
  {
    question: 'Have you added your API Key?',
    answer: 'No. Follow the steps shown in the AI Twin Studio portal.'
  },
  {
    question: 'Is your Gemini API Key on the free tier?',
    answer: 'Yes. We recommend you add your card details to Gemini\'s API Studio to unlock the pro tiers of image and video generation.'
  },
  {
    question: 'The Apps are not working?',
    answer: (
      <div className="space-y-4">
        <p>
          Have you checked the Gemini API Status? At times, due to the popularity of Google's Gemini Studio, there may be limits placed on how many images and videos can be created by a User to prevent spam usage.
        </p>
        <p>
          Or, in rare cases (typically due to software updates) Google may experience intermittent issues. Please check the Gemini API Status. If showing red or orange, we recommend waiting a few hours before using the AI Twin Studio app.
        </p>
        <p>
          Check here:{' '}
          <a
            href="https://aistudio.google.com/status"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#dcfb80] hover:underline inline-flex items-center gap-1 font-medium transition-colors"
          >
            https://aistudio.google.com/status
          </a>
        </p>
      </div>
    )
  }
];

export function GettingStartedScreen({ onBackToDashboard }: GettingStartedScreenProps) {
  const [activeVideoId, setActiveVideoId] = useState(VIDEOS[0].id);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const activeVideo = VIDEOS.find(v => v.id === activeVideoId) || VIDEOS[0];

  return (
    <div className="h-[100dvh] bg-zinc-950 flex font-sans text-zinc-100 overflow-hidden">
      {/* Sidebar - Video Menu */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-700 flex-shrink-0 flex flex-col p-6 overflow-y-auto hidden md:flex">
        <div className="text-xl font-extrabold tracking-tight text-[#dcfb80] mb-8 uppercase leading-none">
          Training Portal
        </div>
        
        <button
          onClick={onBackToDashboard}
          className="mb-8 w-full flex items-center gap-3 p-3 rounded-md text-sm font-medium bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
        >
          <LayoutGrid size={18} />
          <span>Dashboard</span>
        </button>

        <div className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">
          Modules
        </div>

        <nav className="flex-1 space-y-2">
          {VIDEOS.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideoId(video.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-md text-sm font-medium transition-colors text-left ${
                activeVideoId === video.id
                  ? 'bg-zinc-800 text-[#dcfb80]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <PlayCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{video.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="md:hidden p-4 border-b border-zinc-800 flex items-center gap-4 bg-zinc-950">
           <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 p-2 rounded-md text-sm font-medium bg-zinc-800 text-white"
           >
             <LayoutGrid size={16} />
             <span>Dashboard</span>
           </button>
           <select 
             value={activeVideoId}
             onChange={(e) => setActiveVideoId(e.target.value)}
             className="flex-1 bg-zinc-800 border-none text-sm text-white rounded p-2 outline-none"
           >
             {VIDEOS.map(v => (
               <option key={v.id} value={v.id}>{v.title}</option>
             ))}
           </select>
        </div>

        <div className="max-w-4xl mx-auto p-6 md:p-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{activeVideo.title}</h1>
            <p className="text-zinc-400 text-lg leading-relaxed">{activeVideo.description}</p>
          </header>

          {/* Video Container */}
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center mb-16 shadow-2xl">
            {/* Real placeholder for actual video embed */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
               <PlayCircle size={48} className="mb-4 opacity-50" />
               <p className="text-sm font-medium uppercase tracking-widest">Video Container</p>
               <p className="text-xs mt-2 opacity-75">(Replace with real embed code)</p>
            </div>
            {/* Replace this div with a real iframe once you have video URLs */}
            {/* <iframe src={activeVideo.url} className="w-full h-full border-none" allowFullScreen></iframe> */}
          </div>

          <hr className="border-zinc-800 mb-16" />

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-5 flex items-center justify-between hover:bg-zinc-800/50 transition-colors focus:outline-none"
                    >
                      <span className="font-semibold text-zinc-100">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp size={20} className="text-zinc-500" />
                      ) : (
                        <ChevronDown size={20} className="text-zinc-500" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-5 text-zinc-400 leading-relaxed border-t border-zinc-800">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
