'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, ArrowRight } from 'lucide-react';

const WoolScene = dynamic(() => import('./WoolScene').then(m => ({ default: m.WoolScene })), {
  ssr: false,
  loading: () => null,
});

const STAGES = [
  { label: 'Raw Fleece',       progress: 0,    color: '#C4862B' },
  { label: 'Carding',          progress: 0.33, color: '#8a9bb5' },
  { label: 'Drafting',         progress: 0.66, color: '#5472c4' },
  { label: 'Finished Yarn',    progress: 1,    color: '#2C4577' },
];

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const total = heroRef.current.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / total));
      setScrollProgress(progress);
      const stageIndex = Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length));
      setActiveStage(stageIndex);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToNext = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className="relative" style={{ height: '400vh' }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden hero-gradient">
        {/* 3D Canvas */}
        <div className="canvas-container z-0">
          <WoolScene scrollProgress={scrollProgress} />
        </div>

        {/* Subtle grain overlay */}
        <div className="noise-overlay" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Main headline — top half */}
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="max-w-4xl mx-auto text-center">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-300/30 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-wool-500 animate-pulse" />
                <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">
                  Belfast, Northern Ireland
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-brand-900 leading-[1.05] tracking-tight animate-fade-up" style={{ animationDelay: '0.2s' }}>
                From Fleece to{' '}
                <br className="hidden md:block" />
                <span className="shimmer-text">Finished Yarn</span>
              </h1>

              {/* Sub-headline */}
              <p className="mt-6 text-lg md:text-xl text-brand-700/80 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.35s' }}>
                The world&rsquo;s only complete wool processing ecosystem — every machine you need,
                made by one team, installed by us, with on-site training included.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.5s' }}>
                <button
                  onClick={() => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all duration-200 hover:shadow-xl hover:shadow-brand-500/30"
                >
                  Explore Machines
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.querySelector('#why-us')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-7 py-3.5 rounded-full border border-brand-300 text-brand-600 font-semibold text-sm hover:bg-brand-50 transition-all duration-200"
                >
                  Why Belfast Mini Mills
                </button>
              </div>
            </div>
          </div>

          {/* Stage progress — bottom strip */}
          <div className="pb-12 px-6 animate-fade-up" style={{ animationDelay: '0.7s' }}>
            {/* Scroll label */}
            <p className="text-center text-xs text-brand-400 tracking-widest uppercase mb-6">
              Scroll to see the journey
            </p>

            {/* Stage pills */}
            <div className="flex items-center justify-center gap-0 max-w-lg mx-auto">
              {STAGES.map((stage, i) => (
                <div key={stage.label} className="flex items-center flex-1">
                  {/* Node */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className="w-3 h-3 rounded-full border-2 transition-all duration-500"
                      style={{
                        borderColor: i <= activeStage ? stage.color : '#cbd5e1',
                        background: i <= activeStage ? stage.color : 'transparent',
                        transform: i === activeStage ? 'scale(1.4)' : 'scale(1)',
                        boxShadow: i === activeStage ? `0 0 12px ${stage.color}60` : 'none',
                      }}
                    />
                    <span
                      className="text-[10px] font-medium whitespace-nowrap transition-colors duration-500"
                      style={{ color: i <= activeStage ? '#2C4577' : '#94a3b8' }}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {/* Connector */}
                  {i < STAGES.length - 1 && (
                    <div className="h-px w-full -mt-4 relative overflow-hidden" style={{ background: '#e2e8f0' }}>
                      <div
                        className="absolute inset-y-0 left-0 bg-brand-400 transition-all duration-700"
                        style={{ width: i < activeStage ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 scroll-indicator cursor-pointer"
            onClick={scrollToNext}
            style={{ opacity: scrollProgress > 0.05 ? 0 : 1, transition: 'opacity 0.3s' }}
          >
            <ChevronDown size={28} className="text-brand-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
