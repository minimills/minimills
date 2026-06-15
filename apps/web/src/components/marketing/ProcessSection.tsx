'use client';

import { useReveal } from './useReveal';

const STEPS = [
  {
    step: '01',
    name: 'Picking',
    machine: 'Picker / Opener',
    description:
      'Raw fleece is opened, cleaned, and separated. Locks of wool are pulled apart to remove debris and create a light, airy mass ready for further processing.',
    color: '#C4862B',
  },
  {
    step: '02',
    name: 'Washing',
    machine: 'Wool Washer',
    description:
      'Gentle yet thorough washing removes lanolin and remaining vegetable matter while preserving fiber integrity. Temperature and pH are carefully controlled.',
    color: '#a96d1c',
  },
  {
    step: '03',
    name: 'Drying',
    machine: 'Fiber Dryer',
    description:
      'Uniform drying prevents felting and fiber damage. Our dryers maintain consistent heat distribution for perfectly prepared wool every time.',
    color: '#8a9bb5',
  },
  {
    step: '04',
    name: 'Carding',
    machine: 'Drum Carder',
    description:
      'The heart of the process — teeth-covered drums align, blend, and open fibers into a uniform batt or roving, ready for spinning or felting.',
    color: '#5472c4',
  },
  {
    step: '05',
    name: 'Drawing',
    machine: 'Draw Frame',
    description:
      'Multiple rovings are combined and drafted to create a more uniform, stronger sliver with consistent fiber orientation throughout its length.',
    color: '#3d5fa0',
  },
  {
    step: '06',
    name: 'Spinning',
    machine: 'Ring Spinner',
    description:
      'Fibers are twisted into yarn with precise tension control. Speed, twist, and ply options allow for any yarn weight from lace to bulky.',
    color: '#2C4577',
  },
];

export function ProcessSection() {
  const { ref, visible } = useReveal(0.1);

  return (
    <section id="process" className="py-24 lg:py-32 bg-parchment">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 mb-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">The Journey</span>
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-brand-900 mb-4">
            Six Steps. One Ecosystem.
          </h2>
          <p className="text-brand-600/70 text-lg max-w-2xl mx-auto">
            Each machine in our lineup is engineered specifically for its stage in the process —
            and to hand off perfectly to the next.
          </p>
        </div>

        {/* Steps grid */}
        <div
          ref={ref}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger"
          style={{ ['--stagger-delay' as string]: '0.1s' }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.step}
              className="relative bg-white rounded-2xl p-7 border border-brand-100/60 card-hover group overflow-hidden"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
              }}
            >
              {/* Step number — large background */}
              <span className="absolute -top-4 -right-2 font-display text-8xl font-bold text-brand-100/40 select-none pointer-events-none">
                {step.step}
              </span>

              {/* Color dot */}
              <div
                className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center"
                style={{ background: `${step.color}18`, border: `1.5px solid ${step.color}30` }}
              >
                <div className="w-3.5 h-3.5 rounded-full" style={{ background: step.color }} />
              </div>

              <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: step.color }}>
                {step.machine}
              </p>
              <h3 className="font-display text-xl font-bold text-brand-900 mb-3">{step.name}</h3>
              <p className="text-brand-600/70 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
