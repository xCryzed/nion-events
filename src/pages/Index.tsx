import { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import WhatsAppButton from '@/components/WhatsAppButton';
import Team from "@/components/Team.tsx";
import FAQ from '@/components/FAQ';

const Index = () => {
  useEffect(() => {
    document.title = 'DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events';
  }, []);
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Testimonials />
        <Contact />
        <Team />
        <FAQ />
      </main>
      <Footer />
      <CookieBanner />
      <WhatsAppButton />
    </div>
  );
};

export default Index;