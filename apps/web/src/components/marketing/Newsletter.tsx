'use client';

import { useState } from 'react';
import { useReveal } from './useReveal';
import { Send, CheckCircle } from 'lucide-react';

export function Newsletter() {
  const { ref, visible } = useReveal(0.2);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // replace with actual API call
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-parchment">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wool-100 mb-6">
              <span className="text-xs font-semibold tracking-widest uppercase text-wool-600">Stay Informed</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-brand-900 mb-5 leading-tight">
              Get Industry Insights &{' '}
              <span className="text-brand-500">New Machine Alerts</span>
            </h2>
            <p className="text-brand-600/70 text-lg leading-relaxed mb-8">
              Join hundreds of fiber farmers and mill operators who receive our newsletter — practical
              processing tips, new machine launches, and industry news. No spam, ever.
            </p>

            {/* Features list */}
            <ul className="space-y-3">
              {[
                'New machine announcements',
                'Processing tips & best practices',
                'Pricing updates and promotions',
                'Customer success stories',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-brand-700/80 text-sm">
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-brand-500/5 border border-brand-100/60">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-brand-500 mx-auto mb-4" />
                <h3 className="font-display text-2xl font-bold text-brand-900 mb-2">You&rsquo;re in!</h3>
                <p className="text-brand-600/70">
                  Welcome to the Belfast Mini Mills community. We&rsquo;ll be in touch with the good stuff.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl font-bold text-brand-900 mb-1">Subscribe to Updates</h3>
                <p className="text-brand-500/60 text-sm mb-8">Free. Unsubscribe anytime.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-parchment/60 text-brand-900 text-sm placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@yourfarm.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-parchment/60 text-brand-900 text-sm placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
                      I am a... <span className="text-brand-300 font-normal normal-case">(optional)</span>
                    </label>
                    <select className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-parchment/60 text-brand-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition">
                      <option value="">Select your role</option>
                      <option>Hobby fiber farmer</option>
                      <option>Small commercial producer</option>
                      <option>Large commercial mill</option>
                      <option>Fiber artist</option>
                      <option>Retailer / distributor</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={15} />
                        Subscribe
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-brand-400 mt-5">
                  By subscribing you agree to our privacy policy. We never sell your data.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
