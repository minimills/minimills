'use client';

import { useReveal } from './useReveal';
import { ArrowRight } from 'lucide-react';

const MACHINES = [
  {
    id: 'picker',
    name: 'Fiber Picker',
    tagline: 'The starting point.',
    description: 'Opens and cleans raw fleece, removing debris and separating locks for downstream processing.',
    specs: [
      { label: 'Capacity', value: '15–30 lb/hr' },
      { label: 'Power', value: '1.5 HP' },
      { label: 'Footprint', value: '48" × 24"' },
    ],
    badge: 'Step 1',
    color: '#C4862B',
  },
  {
    id: 'washer',
    name: 'Wool Washer',
    tagline: 'Gentle. Thorough.',
    description: 'Temperature-controlled washing system removes lanolin and VM while preserving fiber staple length.',
    specs: [
      { label: 'Tank Size', value: '50 gal' },
      { label: 'Throughput', value: '20 lb/cycle' },
      { label: 'Heat', value: 'Electric / Gas' },
    ],
    badge: 'Step 2',
    color: '#5ba3c9',
  },
  {
    id: 'dryer',
    name: 'Fiber Dryer',
    tagline: 'Even heat, every time.',
    description: 'Tumble-dry system with precision temperature control ensures uniform moisture for perfect carding.',
    specs: [
      { label: 'Capacity', value: '25 lb/cycle' },
      { label: 'Dry Time', value: '30–45 min' },
      { label: 'Power', value: '240V 30A' },
    ],
    badge: 'Step 3',
    color: '#8a9bb5',
  },
  {
    id: 'carder',
    name: 'Drum Carder',
    tagline: 'The heart of the mill.',
    description: 'Industrial-grade carding drums align and blend fibers into beautiful, consistent batts and rovings.',
    specs: [
      { label: 'Drum Width', value: '24" / 36" / 48"' },
      { label: 'Output', value: '20–50 lb/hr' },
      { label: 'Speeds', value: 'Variable' },
    ],
    badge: 'Step 4',
    color: '#3d5fa0',
  },
  {
    id: 'draw-frame',
    name: 'Draw Frame',
    tagline: 'Consistency at scale.',
    description: 'Combines and drafts multiple rovings into a uniform, well-oriented sliver ready for spinning.',
    specs: [
      { label: 'Ends', value: '6 / 8 ends' },
      { label: 'Output', value: '15–30 lb/hr' },
      { label: 'Draft', value: '5× – 10×' },
    ],
    badge: 'Step 5',
    color: '#2C4577',
  },
  {
    id: 'spinner',
    name: 'Ring Spinner',
    tagline: 'The final form.',
    description: 'Precision spinning frames transform rovings into yarn — any weight, any twist, any ply configuration.',
    specs: [
      { label: 'Spindles', value: '24 / 48 / 96' },
      { label: 'Output', value: '10–40 lb/hr' },
      { label: 'Yarn Wt.', value: 'Lace to Bulky' },
    ],
    badge: 'Step 6',
    color: '#1a2d52',
  },
];

export function ProductLine() {
  const { ref, visible } = useReveal(0.05);

  return (
    <section id="products" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 mb-6">
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">The Machines</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-brand-900 leading-tight">
              Every Machine You Need.{' '}
              <br className="hidden lg:block" />
              <span className="text-brand-500">Nothing You Don&rsquo;t.</span>
            </h2>
          </div>
          <a
            href="/products"
            className="flex-shrink-0 group inline-flex items-center gap-2 text-brand-500 font-semibold text-sm hover:text-brand-700 transition-colors"
          >
            View full catalog
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Cards grid */}
        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MACHINES.map((machine, i) => (
            <div
              key={machine.id}
              className="group relative rounded-2xl border border-brand-100 bg-white overflow-hidden card-hover cursor-pointer"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.7s ease ${i * 0.08}s, transform 0.7s ease ${i * 0.08}s`,
              }}
            >
              {/* Color header bar */}
              <div
                className="h-1.5 w-full"
                style={{ background: machine.color }}
              />

              {/* Visual placeholder */}
              <div
                className="relative h-44 flex items-center justify-center overflow-hidden"
                style={{ background: `${machine.color}08` }}
              >
                {/* Placeholder geometric machine shape */}
                <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
                  <rect x="15" y="30" width="70" height="45" rx="4" fill={machine.color} opacity="0.15" stroke={machine.color} strokeWidth="1.5" />
                  <rect x="25" y="20" width="50" height="15" rx="3" fill={machine.color} opacity="0.2" stroke={machine.color} strokeWidth="1.5" />
                  <circle cx="35" cy="75" r="8" fill={machine.color} opacity="0.15" stroke={machine.color} strokeWidth="1.5" />
                  <circle cx="65" cy="75" r="8" fill={machine.color} opacity="0.15" stroke={machine.color} strokeWidth="1.5" />
                  <rect x="40" y="38" width="20" height="12" rx="2" fill={machine.color} opacity="0.3" />
                  <line x1="50" y1="20" x2="50" y2="8" stroke={machine.color} strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="50" cy="6" r="3" fill={machine.color} opacity="0.5" />
                </svg>

                {/* Badge */}
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: machine.color, color: '#fff' }}
                >
                  {machine.badge}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: machine.color }}>
                  {machine.tagline}
                </p>
                <h3 className="font-display text-xl font-bold text-brand-900 mb-2">{machine.name}</h3>
                <p className="text-brand-600/70 text-sm leading-relaxed mb-5">{machine.description}</p>

                {/* Specs */}
                <div className="space-y-2 pt-4 border-t border-brand-100">
                  {machine.specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between items-center">
                      <span className="text-xs text-brand-400">{spec.label}</span>
                      <span className="text-xs font-semibold text-brand-700">{spec.value}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
                  style={{ background: `${machine.color}15`, color: machine.color }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
