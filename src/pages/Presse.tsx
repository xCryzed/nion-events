import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Download, Calendar, Users, Award } from 'lucide-react';

const Presse = () => {
  const pressReleases = [
    {
      date: "15. März 2024",
      title: "NION Events gewinnt Award für beste Eventplanung 2024",
      description: "Unser Team wurde für die herausragende Umsetzung der Jahreskonferenz der Tech-Branche ausgezeichnet.",
      downloadUrl: "#"
    },
    {
      date: "02. Februar 2024",
      title: "Neue Partnerschaft mit führenden Veranstaltungsorten in Berlin",
      description: "NION Events erweitert sein Netzwerk um exklusive Locations für Premium-Events.",
      downloadUrl: "#"
    },
    {
      date: "18. Januar 2024",
      title: "Erfolgreiche Umsetzung von über 100 Events in 2023",
      description: "Rückblick auf ein erfolgreiches Jahr mit unvergesslichen Veranstaltungen für unsere Kunden.",
      downloadUrl: "#"
    }
  ];

  const pressKit = [
    {
      title: "Unternehmenslogo (hochauflösend)",
      format: "PNG, JPG, SVG",
      size: "2.3 MB"
    },
    {
      title: "Pressefotos Events",
      format: "JPG",
      size: "15.7 MB"
    },
    {
      title: "Unternehmensprofil",
      format: "PDF",
      size: "1.8 MB"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Presse</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hier finden Sie aktuelle Pressemitteilungen, Bildmaterial und weitere Informationen über NION Events.
            </p>
          </div>

          {/* Kontakt für Medienvertreter */}
          <section className="mb-16">
            <div className="glass-card p-8 rounded-lg max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-center">Pressekontakt</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Medienanfragen</h3>
                  <p className="text-muted-foreground mb-2">
                    <strong>Maria Schmidt</strong><br />
                    Pressesprecherin
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>E-Mail:</strong> presse@nion-events.de
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Telefon:</strong> +49 (0)30 12345678
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Schnelle Fakten</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Gegründet 2015</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">25+ Mitarbeiter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">500+ Events realisiert</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pressemitteilungen */}
          <section className="mb-16">
            <h2 className="text-3xl font-semibold mb-8 text-center">Aktuelle Pressemitteilungen</h2>
            <div className="grid gap-6 max-w-4xl mx-auto">
              {pressReleases.map((release, index) => (
                <div key={index} className="glass-card p-6 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-primary mb-2">{release.date}</p>
                      <h3 className="text-xl font-semibold mb-3">{release.title}</h3>
                      <p className="text-muted-foreground mb-4">{release.description}</p>
                    </div>
                    <button className="ml-4 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Press Kit */}
          <section>
            <h2 className="text-3xl font-semibold mb-8 text-center">Press Kit</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {pressKit.map((item, index) => (
                <div key={index} className="glass-card p-6 rounded-lg text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{item.format}</p>
                  <p className="text-xs text-muted-foreground mb-4">{item.size}</p>
                  <button className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                    Herunterladen
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Presse;