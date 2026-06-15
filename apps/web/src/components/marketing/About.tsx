'use client';

import { useReveal } from './useReveal';

export function About() {
  const { ref, visible } = useReveal();

  return (
    <section id="about" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wool-100 mb-6">
              <span className="text-xs font-semibold tracking-widest uppercase text-wool-600">Our Story</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-brand-900 leading-tight mb-6">
              Built for Fiber Farmers,{' '}
              <span className="text-brand-500">By Fiber Experts</span>
            </h2>
            <p className="text-brand-700/80 text-lg leading-relaxed mb-5">
              Belfast Mini Mills was founded with a simple mission: give wool producers —
              from backyard hobbyists to commercial operations — every tool they need to
              turn raw fleece into finished yarn without juggling half a dozen different suppliers.
            </p>
            <p className="text-brand-700/80 text-lg leading-relaxed mb-8">
              Based in Belfast, Northern Ireland, we design and manufacture every machine in our
              lineup in-house. That means tighter tolerances, faster support, and a processing
              line where every component is engineered to work together from day one.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-brand-100">
              {[
                { value: '30+', label: 'Years Experience' },
                { value: '12', label: 'Machines in Line' },
                { value: '40+', label: 'Countries Served' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl font-bold text-brand-500">{stat.value}</div>
                  <div className="text-sm text-brand-500/70 mt-1 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual card stack */}
          <div className="relative h-96 lg:h-[480px]">
            {/* Card 1 — back */}
            <div className="absolute top-8 right-0 w-3/4 h-64 rounded-2xl bg-brand-500 opacity-20 rotate-3" />
            {/* Card 2 — mid */}
            <div className="absolute top-4 right-4 w-3/4 h-64 rounded-2xl bg-brand-400 opacity-30 -rotate-1" />
            {/* Card 3 — front: image placeholder with gradient */}
            <div className="absolute top-0 right-8 w-3/4 h-64 rounded-2xl overflow-hidden shadow-2xl">
              <div className="w-full h-full wool-gradient flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-5xl mb-3">🐑</div>
                  <p className="font-display text-xl font-bold">Raw to Refined</p>
                  <p className="text-white/60 text-sm mt-1">Belfast, Northern Ireland</p>
                </div>
              </div>
            </div>
            {/* Bottom card: fact */}
            <div className="absolute bottom-0 left-0 right-8 rounded-2xl bg-white shadow-xl border border-brand-100 p-5">
              <p className="text-sm font-medium text-brand-500/60 uppercase tracking-wider mb-1">Key Differentiator</p>
              <p className="text-brand-900 font-semibold text-base leading-snug">
                The only manufacturer in the world offering a complete, end-to-end wool processing ecosystem under one roof.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
