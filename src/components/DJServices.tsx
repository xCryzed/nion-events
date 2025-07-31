import { Music, Headphones, Mic, Volume2, Users, Award, Play, Pause } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import djHero from '@/assets/dj-hero.jpg';

const DJServices = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioWave, setAudioWave] = useState(Array(20).fill(0));

  // Audio wave animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setAudioWave(prev => prev.map(() => Math.random() * 100));
      }
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const djServices = [
    {
      icon: Music,
      title: 'Hochzeiten',
      description: 'Romantische Atmosphäre für den schönsten Tag im Leben',
      details: ['Zeremonie & Empfang', 'Dinner & Party', 'Persönliche Musikwünsche']
    },
    {
      icon: Users,
      title: 'Corporate Events',
      description: 'Professionelle Beschallung für Firmenveranstaltungen',
      details: ['Galas & Awards', 'Produktpräsentationen', 'Networking Events']
    },
    {
      icon: Award,
      title: 'Abibälle',
      description: 'Unvergessliche Partys für den Schulabschluss',
      details: ['Dance Floor Hits', 'Generationsübergreifend', 'Interaktive Shows']
    },
    {
      icon: Headphones,
      title: 'Private Feiern',
      description: 'Geburtstage und besondere Anlässe perfekt vertont',
      details: ['Alle Altersgruppen', 'Individuelle Playlists', 'Stimmungsvolle Atmosphäre']
    },
  ];

  const expertise = [
    { label: 'Club-Erfahrung', value: '6+ Jahre' },
    { label: 'Events gespielt', value: '200+' },
    { label: 'Musikbibliothek', value: '10.000+ Tracks' },
    { label: 'Verfügbarkeit', value: '365 Tage' },
  ];

  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src={djHero} 
          alt="Professional DJ Setup" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      {/* Audio Wave Visualization */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary opacity-30">
        <div className="flex items-end h-full gap-1 px-4">
          {audioWave.map((height, index) => (
            <div
              key={index}
              className="bg-gradient-to-t from-primary to-accent transition-all duration-150"
              style={{
                height: `${isPlaying ? height : 20}%`,
                width: '4px',
                borderRadius: '2px 2px 0 0'
              }}
            />
          ))}
        </div>
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full glass-card mb-6 animate-fade-in">
            <Volume2 className="w-5 h-5 mr-3 text-primary animate-glow-pulse" />
            <span className="font-medium">Professionelle DJ-Services</span>
          </div>

          <h2 className="text-display mb-6">
            Musik, die <span className="text-gradient">bewegt</span>
          </h2>
          
          <p className="text-body-large text-muted-foreground mb-8">
            Mit über 6 Jahren Club-Erfahrung und modernster Technik sorge ich für die 
            perfekte musikalische Untermalung Ihres Events. Von intimen Hochzeiten bis 
            zu großen Corporate Events – jede Veranstaltung wird zum unvergesslichen Erlebnis.
          </p>

          {/* Play Button Demo */}
          <div className="flex justify-center mb-12">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-hero group relative overflow-hidden"
            >
              {isPlaying ? (
                <Pause className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
              {isPlaying ? 'Pause Demo' : 'Demo anhören'}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </div>
        </div>

        {/* Expertise Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {expertise.map((stat, index) => (
            <div 
              key={index} 
              className="glass-card p-6 text-center hover-lift group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl font-bold text-gradient mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* DJ Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {djServices.map((service, index) => (
            <div 
              key={index} 
              className="glass-card p-8 hover-lift group relative overflow-hidden"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                {/* Icon with Pulse Effect */}
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300 relative">
                  <service.icon className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-glow-pulse opacity-0 group-hover:opacity-100" />
                </div>

                <h3 className="text-title mb-4 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-body text-muted-foreground mb-6">
                  {service.description}
                </p>

                {/* Service Details */}
                <ul className="space-y-3">
                  {service.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gradient-primary rounded-full mr-3 group-hover:shadow-glow transition-all" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Equipment & Features */}
        <div className="glass-card p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-title mb-4 text-gradient">
                Professionelle Ausstattung
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  'Pioneer DJ Equipment',
                  'JBL Sound System',
                  'LED Light Show',
                  'Wireless Mikrofone',
                  'Fog Machine',
                  'Backup Equipment',
                  'Musikwunsch-App',
                  'Live Mixing'
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Mic className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <h4 className="text-xl font-semibold mb-4">
                Bereit für Ihr Event?
              </h4>
              <p className="text-muted-foreground mb-6">
                Kontaktieren Sie mich für ein unverbindliches Angebot
              </p>
              <Button className="btn-hero">
                DJ buchen
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DJServices;