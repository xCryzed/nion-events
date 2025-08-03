import { ArrowRight, Play, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-image.jpg';

const calculateDynamicStats = () => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const now = new Date();
  const daysSinceStartOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const weeksSinceStartOfYear = Math.floor(daysSinceStartOfYear / 7);

  const successfulEvents = 500 + Math.floor(daysSinceStartOfYear * 0.5);
  const clients = 80 + weeksSinceStartOfYear;
  const yearsExperience = new Date().getFullYear() - 2019;

  return {
    events: `${successfulEvents}+`,
    clients: `${clients}+`,
    years: `${yearsExperience}+`,
    support: '24/7'
  };
};

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="NION Eventmanagement - Professionelle Events"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full mr-3 animate-glow-pulse"></span>
            <span className="text-sm font-medium">Ihr Partner für unvergessliche Events</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up">
            <span className="block sm:inline">Außergewöhnliche{' '}</span>
            <span className="text-gradient block sm:inline">Events{' '}</span>
            <span className="block sm:inline">perfekt inszeniert</span>
          </h1>

          {/* Subheading */}
          <p className="text-body-large text-muted-foreground mb-8 max-w-2xl animate-fade-in-up">
            Von der ersten Idee bis zur erfolgreichen Umsetzung – NION Events
            verwandelt Ihre Vision in ein unvergessliches Erlebnis. Professionell,
            kreativ und mit Leidenschaft für Details.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up">
            <Button className="btn-hero group">
              Projekt starten
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="group bg-transparent border-border/50 hover:bg-card/50 backdrop-blur-sm"
              onClick={() => window.location.href = '/portfolio'}
            >
              <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              Portfolio ansehen
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 animate-scale-in">
            {(() => {
              const stats = calculateDynamicStats();
              return [
                { number: stats.events, label: 'Erfolgreiche Events' },
                { number: stats.clients, label: 'Zufriedene Kunden' },
                { number: stats.years, label: 'Jahre Erfahrung' },
                { number: stats.support, label: 'Support' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gradient mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center cursor-pointer group" onClick={() => {
          document.getElementById('unternehmen')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex justify-center group-hover:border-primary transition-colors">
            <div className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2 group-hover:bg-primary transition-colors animate-pulse"></div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground/50 mt-2 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </section>
  );
};

export default Hero;