import { Navbar } from '@/components/marketing/Navbar';
import { Hero } from '@/components/marketing/Hero';
import { About } from '@/components/marketing/About';
import { ProcessSection } from '@/components/marketing/ProcessSection';
import { WhyUs } from '@/components/marketing/WhyUs';
import { ProductLine } from '@/components/marketing/ProductLine';
import { CtaBanner } from '@/components/marketing/CtaBanner';
import { Newsletter } from '@/components/marketing/Newsletter';
import { Footer } from '@/components/marketing/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <ProcessSection />
        <WhyUs />
        <ProductLine />
        <CtaBanner />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
