import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Calendar, Users, MapPin, Music } from 'lucide-react';

const Portfolio = () => {
  const events = [
    {
      id: 1,
      title: "Beachparty DAS LIEBIG",
      description: "Die größte Beachparty Aachens mit über 800 Gästen. Eine unvergessliche Nacht mit perfekter Atmosphäre und erstklassiger Musik.",
      date: "August 2025",
      attendees: "800+",
      location: "DAS LIEBIG, Aachen",
      videoId: "dQw4w9WgXcQ", // Placeholder YouTube ID
      category: "Großveranstaltung"
    },
    {
      id: 2,
      title: "Corporate Event Köln",
      description: "Firmenevent mit über 600 Mitarbeitern. Professionelle Organisation und Entertainment für einen erfolgreichen Unternehmensabend.",
      date: "September 2024",
      attendees: "600+",
      location: "Köln",
      videoId: "dQw4w9WgXcQ", // Placeholder YouTube ID
      category: "Corporate Event"
    },
    {
      id: 3,
      title: "Hochzeit Aachen",
      description: "Eine romantische Hochzeitsfeier mit perfekt abgestimmter Musik für jeden Moment des besonderen Tages.",
      date: "Juli 2024",
      attendees: "120",
      location: "Aachen Region",
      videoId: "dQw4w9WgXcQ", // Placeholder YouTube ID
      category: "Hochzeit"
    },
    {
      id: 4,
      title: "Abiball 2024",
      description: "Unvergesslicher Abiball mit energiegeladener Musik und perfekter Stimmung für die Absolventen.",
      date: "Juni 2024",
      attendees: "200",
      location: "Aachen",
      videoId: "dQw4w9WgXcQ", // Placeholder YouTube ID
      category: "Abiball"
    },
    {
      id: 5,
      title: "Club Night Spanien",
      description: "Internationaler Auftritt in Spanien mit begeistertem Publikum und unvergesslicher Partystimmung.",
      date: "Mai 2024",
      attendees: "300+",
      location: "Spanien",
      videoId: "dQw4w9WgXcQ", // Placeholder YouTube ID
      category: "Club Event"
    },
    {
      id: 6,
      title: "Geburtagsfeier Deluxe",
      description: "Exklusive Geburtstagsfeier mit individuell zusammengestellter Playlist und perfekter Atmosphäre.",
      date: "April 2024",
      attendees: "80",
      location: "Aachen Region",
      videoId: "dQw4w9WgXcQ", // Placeholder YouTube ID
      category: "Privatfeier"
    }
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