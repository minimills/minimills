import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './marketing.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Belfast Mini Mills — From Fleece to Finished Yarn',
  description:
    'The only manufacturer offering a complete wool processing ecosystem — from raw fleece to finished yarn. Drum carders, picker machines, spinners and more, with on-site installation and training.',
  keywords: ['wool processing', 'drum carder', 'mini mill', 'fiber processing', 'Belfast Mini Mills'],
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} antialiased`} style={{ background: '#F5F2EC', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
