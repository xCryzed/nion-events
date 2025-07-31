import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-image.jpg';

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
          <h1 className="text-display mb-6 animate-fade-in-up">
            Außergewöhnliche{' '}
            <span className="text-gradient">Events</span>{' '}
            perfekt inszeniert
          </h1>

          {/* Subheading */}
          <p className="text-body-large text-muted-foreground mb-8 max-w-2xl animate-fade-in-up">
            Von der ersten Idee bis zur erfolgreichen Umsetzung – NION Eventmanagement 
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
            >
              <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              Portfolio ansehen
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 animate-scale-in">
            {[
              { number: '500+', label: 'Erfolgreiche Events' },
              { number: '50+', label: 'Zufriedene Kunden' },
              { number: '10+', label: 'Jahre Erfahrung' },
              { number: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;