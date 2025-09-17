import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { trackEvent } from '@/hooks/use-google-analytics';
import { Calendar, Users, MapPin, Music } from 'lucide-react';

const Portfolio = () => {
  useEffect(() => {
    document.title = 'Portfolio - DJ Aachen & Eventtechnik | NION Events';
  }, []);
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
      description: "Die Neujahrsparty 2025 von Abiomed | Johnson & Johnson fand erneut im DAS LIEBIG in Aachen statt und stand unter dem Motto „Around The World“. Unser Team stellte abwechslungsreiche Spielstationen bereit – inspiriert von Formaten wie „Das Duell um die Welt“ – bei denen die Mitarbeiter:innen in 4er-Teams gegeneinander antraten. Für zusätzliche Motivation sorgten attraktive Preise für die Gewinnerteams sowie eine Echtzeit-Punkteanzeige auf der großen LED-Wand im Hauptraum. Neben der Betreuung der Spiele übernahmen wir auch die musikalische Gestaltung des Abends und trugen so maßgeblich zu einem energiegeladenen Start ins neue Jahr bei. Inzwischen sind wir ein fester Bestandteil des Abiomed | Johnson & Johnson Feier-Inventars geworden.",
      date: "Juni 2024",
      attendees: "600+",
      location: "DAS LIEBIG, Aachen",
      videoId: "4FIk2StHQdk",
      category: "Corporate Event"
    },
    {
      id: 3,
      title: "Abiomed Sommerfest 2024",
      description: "Bei diesem außergewöhnlichen Sommerfest verwandelte unser Team die Halle 60 in eine eindrucksvolle Festival-Location. Unter dem Motto „Von Aachen aus in die ganze Welt“ feierten Mitarbeiter:innen und Gäste die internationale Bedeutung der innovativen Herzpumpen. Wir verantworteten die komplette technische Betreuung, die DJ-Planung, die Gestaltung einer Geländeübersicht sowie den professionellen Auf- und Abbau und stellten so einen reibungslosen Ablauf sicher. Dieses Recap-Video zeigt die Highlights eines unvergesslichen Tages.",
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
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Unser <span className="text-gradient">Portfolio</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Erleben Sie unsere erfolgreichsten Events und lassen Sie sich von der
              Qualität unserer Arbeit überzeugen. Jedes Event ist einzigartig und
              perfekt auf unsere Kunden abgestimmt.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {events.map((event) => (
              <div key={event.id} className="glass-card p-6 rounded-2xl hover-scale">
                {/* Video */}
                <div className="aspect-video mb-6 rounded-xl overflow-hidden bg-muted">
                  <iframe
                    src={`https://www.youtube.com/embed/${event.videoId}`}
                    title={event.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Event Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{event.title}</h3>
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                      {event.category}
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{event.attendees} Gäste</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="glass-card p-8 rounded-2xl max-w-2xl mx-auto">
              <Music className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Bereit für Ihr eigenes Event?
              </h3>
              <p className="text-muted-foreground mb-6">
                Lassen Sie uns gemeinsam Ihr nächstes unvergessliches Event planen.
                Kontaktieren Sie uns für ein unverbindliches Beratungsgespräch.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                onClick={() => trackEvent('click', 'conversion', 'portfolio_contact_cta')}
              >
                Jetzt Kontakt aufnehmen
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;