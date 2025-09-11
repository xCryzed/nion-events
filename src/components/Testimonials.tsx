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
import joy from '@/assets/logos/joy-logo.svg';
import rent2night from '@/assets/logos/rent2night-logo.svg';
import relay from '@/assets/logos/relay-logo.png';
import ranek from '@/assets/logos/rane-k-logo.webp';
import adesso from '@/assets/logos/adesso-logo.svg';

const Testimonials = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shuffledPartners, setShuffledPartners] = useState<typeof partners>([]);

  const events = [
    {
      id: 1,
      title: "Abiomed AAM 2025",
      description: "Bei der Abiomed AAM Veranstaltung in Kopenhagen, ausgerichtet in der renommierten Location Wallmans Salonger, übernahmen wir die musikalische Betreuung sowie die Aftershow-Party und sorgten für ein unvergessliches Finale. Im Mittelpunkt des Abends stand der Zusammenschluss von Abiomed und Johnson & Johnson, begleitet von eindrucksvollen Showelementen und der Würdigung zahlreicher Mitarbeiterbeförderungen. Gemeinsam mit internationalen Gästen und Mitarbeiter:innen entstand so ein Event von außergewöhnlicher Strahlkraft.",
      date: "Februar 2025",
      attendees: "500+",
      location: "Wallmans Salonger, Kopenhagen",
      videoId: "Stc0eMLuQQg",
      category: "Corporate Event"
    },
    {
      id: 2,
      title: "Abiomed Neujahrsparty 2025",
      description: "Die Neujahrsparty 2025 von Abiomed | Johnson & Johnson fand erneut im DAS LIEBIG in Aachen statt und stand unter dem Motto Around The World. Unser Team stellte abwechslungsreiche Spielstationen bereit – inspiriert von Formaten wie Das Duell um die Welt – bei denen die Mitarbeiter:innen in 4er-Teams gegeneinander antraten. Für zusätzliche Motivation sorgten attraktive Preise für die Gewinnerteams sowie eine Echtzeit-Punkteanzeige auf der großen LED-Wand im Hauptraum. Neben der Betreuung der Spiele übernahmen wir auch die musikalische Gestaltung des Abends und trugen so maßgeblich zu einem energiegeladenen Start ins neue Jahr bei. Inzwischen sind wir ein fester Bestandteil des Abiomed | Johnson & Johnson Feier-Inventars geworden.",
      date: "Juni 2024",
      attendees: "600+",
      location: "DAS LIEBIG, Aachen",
      videoId: "4FIk2StHQdk",
      category: "Corporate Event"
    },
    {
      id: 3,
      title: "Abiomed Sommerfest 2024",
      description: "Bei diesem außergewöhnlichen Sommerfest verwandelte unser Team die Halle 60 in eine eindrucksvolle Festival-Location. Unter dem Motto Von Aachen aus in die ganze Welt feierten Mitarbeiter:innen und Gäste die internationale Bedeutung der innovativen Herzpumpen. Wir verantworteten die komplette technische Betreuung, die DJ-Planung, die Gestaltung einer Geländeübersicht sowie den professionellen Auf- und Abbau und stellten so einen reibungslosen Ablauf sicher. Dieses Recap-Video zeigt die Highlights eines unvergesslichen Tages.",
      date: "August 2024",
      attendees: "600+",
      location: "Halle 60, Aachen",
      videoId: "68U6T7jaPZI",
      category: "Corporate Event"
    },
    {
      id: 4,
      title: "NION DJ Set Tropics",
      description: "Im renommierten Tropics Club in Spanien, ausgezeichnet als einer der besten Clubs weltweit auf Platz 48, sorgte ich mit meiner DJ-Performance für eine mitreißende Party-Atmosphäre. Die Gäste von RUF Jugendreisen erlebten eine energiegeladene Nacht voller Begeisterung, perfekt abgestimmter Beats und elektrisierender Stimmung. Das Event verwandelte den Club in eine pulsierende Feierzone, in der ausgelassene Stimmung und gemeinsame Partyerlebnisse im Mittelpunkt standen.",
      date: "April 2024",
      attendees: "3000+",
      location: "Disco Tropics, Lloret de Mar",
      videoId: "Vuh19HL6sqI",
      category: "Privatfeier"
    },
    {
      id: 5,
      title: "Abiomed Neujahrsfeier 2024",
      description: "Zum Jahresauftakt 2024 wurde das DAS LIEBIG in Aachen (ehemals Starfish) in eine faszinierende Retro-Spiele-Arena verwandelt. Unter dem Motto klassischer Arcade-Games entstand eine außergewöhnliche Event-Atmosphäre, die die Gäste in eine andere Welt eintauchen ließ. Unser Team verantwortete die musikalische Gestaltung des Abends und schuf damit den perfekten Rahmen für ausgelassene Feierlichkeiten. Die Mitarbeiter:innen genossen eine unvergessliche Stimmung und starteten gemeinsam voller Energie in das neue Jahr.",
      date: "Januar 2024",
      attendees: "600+",
      location: "DAS LIEBIG, Aachen",
      videoId: "jWPe7QO38gc",
      category: "Corporate Event"
    },
    {
      id: 6,
      title: "Halloween 2023: DREAMBEATS LAB",
      description: "Das DREAMBEATS LAB 2023 im DAS LIEBIG in Aachen (ehemals Starfish) setzte neue Maßstäbe für Halloween-Partys in der Region. Mit über 1.300 Gästen avancierte die Veranstaltung zur größten Halloween-Party Aachens und zog Publikum aus der gesamten Umgebung an. Highlight des Abends war meine eigene DJ-Performance, die für eine mitreißende Stimmung sorgte, unterstützt von spektakulären Lichteffekten und thematisch inszenierten Dekorationen. Das Event vereinte beste Unterhaltung, ausgefeilte Showelemente und ein außergewöhnliches Partyerlebnis, das in Aachen seinesgleichen sucht.",
      date: "Oktober 2023",
      attendees: "1300+",
      location: "DAS LIEBIG, Aachen",
      videoId: "T55uDdFXt4k",
      category: "Club Event"
    }
  ];

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
    { name: 'Rent2Night Eventmanagement', logo: rent2night, website: 'https://rent2night.de/' },
    { name: 'RELAY GmbH', logo: relay, website: 'https://relay-on.de/' },
    { name: 'RaneK Veranstaltungstechnik', logo: ranek, website: 'https://www.instagram.com/rane_k_veranstaltungstechnik/' },
    { name: 'adesso SE', logo: adesso, website: 'https://www.adesso.de/' }
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
          <div className="w-24 h-1 bg-gradient-primary rounded-full mx-auto mb-8"></div>
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
              onClick={() => window.open('https://g.page/r/CWnFptITqQNDEAE/review', '_blank')}
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
            <div className="w-24 h-1 bg-gradient-primary rounded-full mx-auto mb-8"></div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Diese renommierten Unternehmen setzen auf unsere Expertise für ihre wichtigsten Events
            </p>
          </div>

          {/* Horizontal scrolling partners */}
          <div className="relative overflow-hidden py-12">
            <div className="flex animate-scroll-smooth" style={{ width: 'max-content' }}>
              {/* Sextuple the array for truly seamless infinite scroll */}
              {[...shuffledPartners, ...shuffledPartners, ...shuffledPartners, ...shuffledPartners, ...shuffledPartners, ...shuffledPartners].map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="flex-shrink-0 mx-6 group"
                  style={{ minWidth: '224px' }}
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

      {/* Portfolio Section - Full Width */}
      <div className="relative py-24 mt-20 w-full">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-accent rounded-full blur-3xl opacity-15"></div>

        <div className="relative z-10 container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border mb-6">
              <span className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse"></span>
              <span className="text-sm text-muted-foreground font-medium tracking-wide">UNSERE ERFOLGREICHSTEN EVENTS</span>
            </div>
            <h3 className="text-5xl font-bold mb-6 text-foreground">
              Event <span className="text-gradient">Portfolio</span>
            </h3>
            <div className="w-24 h-1 bg-gradient-primary rounded-full mx-auto mb-8"></div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Erleben Sie unsere erfolgreichsten Events und lassen Sie sich von der Qualität unserer Arbeit überzeugen.
              Jedes Event ist einzigartig und perfekt auf unsere Kunden abgestimmt.
            </p>
          </div>

          {/* Portfolio Grid */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-4">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`group relative glass-card p-8 rounded-3xl hover-lift border border-border/50 hover:border-primary/50 transition-all duration-500 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Video */}
                  <div className="aspect-video mb-6 rounded-2xl overflow-hidden bg-muted/30 ring-1 ring-border/50 group-hover:ring-primary/50 transition-all duration-500">
                    <iframe
                      src={`https://www.youtube.com/embed/${event.videoId}`}
                      title={event.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Event Info */}
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {event.title}
                      </h4>
                      <span className="px-4 py-2 bg-gradient-primary/20 text-primary rounded-full text-sm font-semibold border border-primary/20 flex-shrink-0">
                        {event.category}
                      </span>
                    </div>

                    <p className="text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-300">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border/50 group-hover:border-primary/50 transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground font-medium">Datum</div>
                          <div className="text-sm font-semibold text-foreground">{event.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground font-medium">Gäste</div>
                          <div className="text-sm font-semibold text-foreground">{event.attendees}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:col-span-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground font-medium">Location</div>
                          <div className="text-sm font-semibold text-foreground">{event.location}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;