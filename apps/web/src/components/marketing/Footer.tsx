import { Logo } from './Logo';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-950 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo variant="light" size="sm" />
            <p className="mt-4 text-white/45 text-sm leading-relaxed">
              The complete wool processing ecosystem. From raw fleece to finished yarn — designed, built, and supported by Belfast Mini Mills.
            </p>
          </div>

          {/* Machines */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">Machines</h4>
            <ul className="space-y-3">
              {['Fiber Picker', 'Wool Washer', 'Fiber Dryer', 'Drum Carder', 'Draw Frame', 'Ring Spinner'].map((m) => (
                <li key={m}>
                  <a href="/products" className="text-sm text-white/60 hover:text-white transition-colors">{m}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Our Process', 'On-Site Installation', 'Training Programs', 'Support', 'Contact'].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-wool-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/60 leading-relaxed">Belfast, Northern Ireland<br />United Kingdom</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-wool-400 flex-shrink-0" />
                <a href="tel:+441234567890" className="text-sm text-white/60 hover:text-white transition-colors">+44 (0) 123 456 7890</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-wool-400 flex-shrink-0" />
                <a href="mailto:info@minimills.net" className="text-sm text-white/60 hover:text-white transition-colors">info@minimills.net</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            &copy; {year} Belfast Mini Mills. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Use', 'Cookie Policy'].map((l) => (
              <a key={l} href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
