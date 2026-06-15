'use client';

import { useReveal } from './useReveal';
import { Package, Wrench, GraduationCap, Globe } from 'lucide-react';

const REASONS = [
  {
    icon: Package,
    title: 'Complete Ecosystem',
    highlight: 'Every machine. One supplier.',
    description:
      'From picker to spinner, every step of the wool processing journey has a Belfast Mini Mills machine engineered for it. Stop juggling incompatible equipment from five different suppliers.',
    color: '#2C4577',
  },
  {
    icon: Wrench,
    title: 'On-Site Installation',
    highlight: 'We come to you.',
    description:
      'Our team travels to your farm or studio to install and calibrate every machine. No freight damage surprises, no guesswork assembly — your line is production-ready from day one.',
    color: '#C4862B',
  },
  {
    icon: GraduationCap,
    title: 'Expert Training',
    highlight: 'Learn from the makers.',
    description:
      'Who better to teach you to operate a Belfast Mini Mills machine than the engineers who designed it? On-site training is included with every purchase — your team learns the right way.',
    color: '#3d5fa0',
  },
  {
    icon: Globe,
    title: 'Global Support',
    highlight: 'We\'re here after the sale.',
    description:
      'With customers in over 40 countries, our support network spans time zones. Parts, diagnostics, and expert guidance are always within reach — no matter where your mill is.',
    color: '#a96d1c',
  },
];

export function WhyUs() {
  const { ref, visible } = useReveal(0.1);

  return (
    <section id="why-us" className="py-24 lg:py-32 dark-section relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-wool-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 mb-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-wool-300">Why Choose Us</span>
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            Built Different.{' '}
            <span className="text-wool-400">Sold Different.</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Every competitor makes one or two machines. We make the whole line — and we stand behind it.
          </p>
        </div>

        {/* Cards */}
        <div ref={ref} className="grid md:grid-cols-2 gap-6">
          {REASONS.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="group relative rounded-2xl bg-white/5 border border-white/10 p-8 hover:bg-white/8 transition-all duration-300 overflow-hidden"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.7s ease ${i * 0.15}s, transform 0.7s ease ${i * 0.15}s`,
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top left, ${reason.color}12, transparent 60%)` }}
                />

                <div className="flex gap-5 relative z-10">
                  {/* Icon */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${reason.color}20` }}
                  >
                    <Icon size={22} style={{ color: reason.color }} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: reason.color }}>
                      {reason.highlight}
                    </p>
                    <h3 className="font-display text-xl font-bold text-white mb-3">{reason.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-wool-500 text-white font-semibold text-sm hover:bg-wool-600 transition-all duration-200 hover:shadow-xl hover:shadow-wool-500/20"
          >
            Talk to Our Team
          </button>
        </div>
      </div>
    </section>
  );
}
