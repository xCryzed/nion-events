import { Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import abiomed from '@/assets/logos/abiomed-logo.svg';
import jnj from '@/assets/logos/jnj-logo.svg';
import hammer from '@/assets/logos/hammer-logo.svg';
import nox from '@/assets/logos/nox-logo.svg';
import apollo from '@/assets/logos/apollo-logo.svg';
import himmerich from '@/assets/logos/himmerich-logo.svg'
import dasLiebig from '@/assets/logos/das-liebig-logo.png';
import joy from '@/assets/logos/joy-logo.svg'
import rent2night from '@/assets/logos/rent2night-logo.svg'

const Testimonials = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shuffledPartners, setShuffledPartners] = useState<typeof partners>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('testimonials');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      name: 'Nele Frohn',
      content: 'Einfach 5/5, denn besser geht es kaum. Unkomplizierte Kommunikation vor der Party und nette gemeinsame Planung. Auch der Auf- und Abbau klappt super. Um halb zehn ging’s los auf der Tanzfläche und bis drei Uhr wurde durch getanzt. Alle Gäste inklusive mir sind und waren begeistert. Tausend Dank, immer wieder würde ich euch buchen 🫶🏻',
      rating: 5
    },
    {
      name: 'Jörg Schreiber',
      content: 'Nino hat den 18. Geburtstag unserer Tochter zu einem unvergesslichen Event werden lassen. Alle waren total begeistert und wir haben bis in die frühen Morgenstunden durchgetanzt. Einfach mega. Vielen lieben Dank, Nino.',
      rating: 5
    },
    {
      name: 'Silvia K',
      content: 'Sehr nett und organisiert. Planung ohne Probleme und preis Leistungsverhältnis ist super. Der Abend war mega, die Musik hat perfekt gestimmt! Kann ich nur weiterempfehlen.',
      rating: 5
    },
  ];

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.map(part => part.charAt(0)).join('').toUpperCase();
  };

  const partners = [
    { name: 'Abiomed Europe GmbH', logo: abiomed, website: 'https://www.abiomed.com/de-de' },
    { name: 'Johnson & Johnson', logo: jnj, website: 'https://www.jnj.com' },
    { name: 'Hammer GmbH & Co. KG', logo: hammer, website: 'https://www.hammer-ac.de/' },
    { name: 'NOX Aachen', logo: nox, website: 'https://www.nox.ac/' },
    { name: 'Apollo Aachen', logo: apollo, website: 'https://apollo-aachen.de/' },
    { name: 'Diskothek Himmerich', logo: himmerich, website: 'https://www.himmerich.de' },
    { name: 'DAS LIEBIG', logo: dasLiebig, website: 'https://www.dasliebig.de' },
    { name: 'JOY event & media GmbH & Co. KG', logo: joy, website: 'https://www.joy-event-media.de/' },
    { name: 'Rent2Night Eventmanagement', logo: rent2night, website: 'https://rent2night.de/' }
  ];

  const shuffleArray = (array: typeof partners) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    setShuffledPartners(shuffleArray(partners));
  }, []);


  return (
    <section id="testimonials" className="section-padding">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-headline mb-6">
            Was unsere <span className="text-gradient">Kunden</span> sagen
          </h2>
          <p className="text-body-large text-muted-foreground">
            Überzeugen Sie sich selbst von der Qualität unserer Arbeit.
            Hier sind einige Stimmen unserer zufriedenen Kunden.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`glass-card p-8 hover-lift relative overflow-hidden group ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative z-10">
                {/* Author */}
                <div className="flex items-center mb-6">
                  <div className="relative mr-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300">
                      <span className="text-white font-semibold text-sm">
                        {getInitials(testimonial.name)}
                      </span>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    {/* Rating */}
                    <div className="flex items-center mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content with quote styling */}
                <div className="relative">
                  <Quote className="w-5 h-5 text-primary/30 absolute -top-2 -left-2" />
                  <p className="text-body text-muted-foreground italic group-hover:text-foreground transition-colors duration-300 pl-4">
                    {testimonial.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Google Review Section */}
        <div className="mb-20 max-w-2xl mx-auto">
          <div className="glass-card p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h3 className="text-title mb-4 text-foreground">
              Bewerten Sie unsere Arbeit
            </h3>

            {/* 5 Stars */}
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-accent mx-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>

            <p className="text-muted-foreground mb-6">
              Ihre Meinung ist uns wichtig. Teilen Sie Ihre Erfahrung mit anderen und helfen Sie uns dabei,
              noch bessere Events zu gestalten.
            </p>

            <Button
              onClick={() => window.open('https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID', '_blank')}
              className="btn-hero group"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Bei Google bewerten
            </Button>
          </div>
        </div>

        {/* Partners Section */}
        <div className="relative py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6 text-foreground">
              Vertrauen von <span className="text-gradient">führenden Unternehmen</span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Diese renommierten Unternehmen setzen auf unsere Expertise für ihre wichtigsten Events
            </p>
          </div>

          {/* Horizontal scrolling partners */}
          <div className="relative overflow-hidden py-12">
            <div className="flex animate-scroll-infinite">
              {/* Triple the array for seamless infinite scroll */}
              {[...shuffledPartners, ...shuffledPartners, ...shuffledPartners].map((partner, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 mx-6 group"
                >
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="w-56 h-40 flex items-center justify-center p-6 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 transition-all duration-500 hover:bg-background/80 group-hover:scale-110 hover:shadow-lg hover:shadow-primary/20">
                      <img
                        src={partner.logo}
                        alt={`${partner.name} Logo`}
                        className="max-w-full max-h-full object-contain transition-all duration-300"
                      />
                    </div>
                    <p className="text-center mt-4 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {partner.name}
                    </p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;