import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import DJServices from '@/components/DJServices';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <DJServices />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
};

export default Index;
