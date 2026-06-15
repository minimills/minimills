'use client';

import { useReveal } from './useReveal';
import { ArrowRight, Phone } from 'lucide-react';

export function CtaBanner() {
  const { ref, visible } = useReveal(0.2);

  return (
    <section className="py-20 overflow-hidden wool-gradient relative">
      {/* Decorative ring */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />

      <div
        ref={ref}
        className={`max-w-4xl mx-auto px-6 lg:px-8 text-center transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
          Ready to Build Your{' '}
          <br className="hidden md:block" />
          Fiber Processing Line?
        </h2>
        <p className="text-white/65 text-lg mb-10 max-w-xl mx-auto">
          Tell us about your operation — fiber type, volume, space, budget — and we&rsquo;ll design the exact
          lineup that takes you from raw fleece to finished yarn.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-brand-600 font-semibold text-sm hover:bg-white/90 transition-all duration-200 hover:shadow-xl"
          >
            Get a Custom Quote
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="tel:+441234567890"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-200"
          >
            <Phone size={15} />
            Call Us
          </a>
        </div>
      </div>
    </section>
  );
}
