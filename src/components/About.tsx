import {Award, Heart, MapPin, Users, Zap} from 'lucide-react';
import nionPortrait from '@/assets/nion-portrait.webp';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Leidenschaft",
      description: "Jedes Event wird mit persönlicher Hingabe und Liebe zum Detail geplant"
    },
    {
      icon: Award,
      title: "Qualität",
      description: "Höchste Standards in Planung, Durchführung und Kundenservice"
    },
    {
      icon: Users,
      title: "Vertrauen",
      description: "Langfristige Partnerschaften durch Zuverlässigkeit und Professionalität"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Moderne Technologien und kreative Lösungen für unvergessliche Erlebnisse"
    }
  ];

  return (
    <section id="unternehmen" className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-primary rounded-full blur-3xl opacity-10"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent rounded-full blur-3xl opacity-10"></div>

      <div className="container relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border mb-6">
            <span className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse"></span>
            <span className="text-sm text-muted-foreground font-medium tracking-wide">DJ- & EVENTMANAGEMENT MIT LEIDENSCHAFT UND SYSTEM</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">NION </span><span className="text-gradient">Events</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-primary rounded-full mx-auto mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Als DJ und Eventmanager aus Aachen bringe ich über 6 Jahre Erfahrung auf die Bühne –
            von Clubnächten bis zu Großveranstaltungen mit über 2.500 Gästen.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Portrait and Expertise Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Portrait - Top Left */}
            <div className="lg:col-span-1">
              <div className="relative group">
                {/* Glowing Background */}
                <div className="absolute -inset-4 bg-gradient-primary rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-primary rounded-xl opacity-60 rotate-12"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-accent rounded-lg opacity-80 rotate-45"></div>

                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={nionPortrait}
                    alt="Nino Bergen, Gründer von NION Events"
                    className="w-full h-[400px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Overlay Info Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 border border-border shadow-xl">
                    <h3 className="text-lg font-bold text-foreground mb-1">Nino Bergen</h3>
                    <p className="text-primary font-semibold mb-2 text-sm">Geschäftsführer</p>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                          Aachen
                        </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expertise directly under image */}
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Meine Expertise</h3>
                <div className="space-y-3">
                  <div className="bg-card/30 backdrop-blur-sm rounded-xl p-4 border border-border">
                    <h4 className="font-semibold text-primary mb-2 text-sm">Event-Highlights</h4>
                    <div className="space-y-2">
                      {[
                        "Apollo Resident DJ 2019 - heute",
                        "Himmerich Resident DJ 2020 - heute",
                        "DREAMBEATS 2022-2024 (Apollo & Nox Aachen)",
                        "DREAMBEATS LAB 2023 (DAS LIEBIG, Aachen)",
                        "Electrisize 2023 & 2024 (Erkelenz)",
                        "Disco Tropics 2024 (Lloret de Mar)",
                        "Hammer Beachparty 2025 (DAS LIEBIG, Aachen)"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-gradient-primary rounded-full flex-shrink-0"></div>
                          <span className="text-xs text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card/30 backdrop-blur-sm rounded-xl p-4 border border-border">
                    <h4 className="font-semibold text-primary mb-2 text-sm">Technische Expertise</h4>
                    <div className="space-y-2">
                      {[
                        "Softwareentwickler-Background",
                        "Entwicklung individueller Event-Tools (z. B. Gästelisten, Check-in-Systeme, E-Ticketing)",
                        "Integration interaktiver Features (z. B. Live-Voting, Wunschmusik-Abfragen)",
                        "Technische Umsetzung hybrider und digitaler Events",
                        "Datenanalyse und Echtzeit-Dashboards für Veranstalter",
                        "IT-Support & technische Betreuung während der Veranstaltung"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-gradient-primary rounded-full flex-shrink-0"></div>
                          <span className="text-xs text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Story */}
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Seit 2019 stehe ich selbst als DJ hinter den Decks und habe dabei nicht nur in fast jedem Club der
                  Region aufgelegt,
                  sondern auch internationale Bookings, Hochzeiten, Abibälle und Firmenevents erfolgreich begleitet.
                </p>

                <p className="leading-relaxed text-muted-foreground">
                  Im Oktober 2022 erfüllte ich mir einen langjährigen Traum: meine eigene Veranstaltungsreihe DREAMBEATS –
                  mit dem klaren Ziel, elektronische Musik endlich wieder sichtbarer in Aachens Eventlandschaft zu verankern.
                  In einer Stadt, in der elektronische Formate lange unterrepräsentiert waren, schuf DREAMBEATS eine neue Plattform
                  für moderne Clubkultur. Die ersten Events fanden im Apollo und später im NOX Aachen statt und trafen schnell auf eine wachsende Community.
                  Nur ein Jahr später folgte das nächste Level: Mit der DREAMBEATS LAB veranstaltete ich an Halloween 2023 die
                  größte Halloween-Party Aachens – im DAS LIEBIG (ehemals Starfish Aachen). Die Veranstaltung war ein
                  voller Erfolg und hat eindrucksvoll gezeigt, welches Potenzial elektronische Events in Aachen haben – sowohl kulturell als auch organisatorisch.
                </p>

                <p className="leading-relaxed text-muted-foreground">
                  Im folgt die nächste Stufe:
                  Aachens größte Beachparty mit über 2.500 Gästen, erneut im DAS LIEBIG.
                </p>

                <p className="leading-relaxed text-muted-foreground">
                  Mit der Gründung von NION Events habe ich meine Leidenschaft zum Beruf gemacht. Heute betreue ich auch
                  namhafte Kunden
                  wie Johnson & Johnson (ehemals Abiomed) und der Hammer GmbH & Co. KG bei der professionellen Umsetzung ihrer Events.
                </p>

                <p className="leading-relaxed text-muted-foreground">
                  Dank meiner parallelen Laufbahn als Softwareentwickler biete ich zusätzlich technische Lösungen auf
                  höchstem Niveau – von digitalen Tools bis zu individuellen Sonderwünschen. Durch mein starkes Netzwerk
                  in Aachen lassen sich nahezu alle Ideen zuverlässig umsetzen – ob privat, geschäftlich oder
                  öffentlich.
                </p>

                {/* Newspaper Article Link */}
                <div className="relative group bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">📰</span>
                  </div>
                  <h4 className="text-lg font-semibold text-primary mb-3">DREAMBEATS in den Medien</h4>
                  <p className="text-muted-foreground mb-4">
                    Die Aachener Zeitung berichtete über die Erfolgsgeschichte von DREAMBEATS und die Entwicklung
                    der elektronischen Musikszene in Aachen.
                  </p>
                  <a
                    href="https://www.aachener-zeitung.de/lokales/region-aachen/aachen/dreambeats-erfolgsgeschichte-von-zwei-aachener-djs/15204194.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-primary font-semibold hover:text-primary-glow transition-colors duration-200 group-hover:underline"
                  >
                    <span>Artikel in der Aachener Zeitung lesen</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="mt-24">
          {/* Vision Card with integrated values */}
          <div className="flex justify-center">
            <div className="max-w-6xl relative group">
              {/* Background glow effects */}
              <div className="absolute -inset-8 bg-gradient-primary rounded-3xl blur-3xl opacity-10 group-hover:opacity-20 transition-all duration-700"></div>
              <div className="absolute -inset-4 bg-gradient-accent rounded-2xl blur-2xl opacity-15 group-hover:opacity-25 transition-all duration-500"></div>

              {/* Main card */}
              <div className="relative bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-primary/20 hover:border-primary/40 transition-all duration-500 shadow-2xl">
                <div className="absolute bottom-6 left-6 w-8 h-8 bg-gradient-accent rounded-xl opacity-60 rotate-45 group-hover:rotate-90 transition-transform duration-700"></div>

                {/* Content */}
                <div className="text-center space-y-8">
                  <div className="inline-flex items-center space-x-3 bg-primary/10 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/20 mb-4">
                    <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse"></div>
                    <span className="text-primary font-semibold text-sm tracking-wider">MEINE VISION</span>
                  </div>

                  <div className="space-y-4 text-lg leading-relaxed max-w-3xl mx-auto">
                    <p className="text-foreground">
                      Maßgeschneiderte Eventlösungen – von stilvollen Hochzeitsfeiern bis hin zu großen Firmenevents.
                      Durch meine umfassende Erfahrung garantiere ich Ihnen eine professionelle Umsetzung auf höchstem Niveau.
                    </p>
                  </div>

                  {/* Values Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-8 border-t border-border/50">
                    {values.map((value, index) => (
                      <div
                        key={value.title}
                        className="group/value relative bg-card/40 backdrop-blur-sm p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-500 hover:transform hover:-translate-y-2"
                      >
                        <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-0 group-hover/value:opacity-5 transition-opacity duration-500"></div>
                        <div className="relative z-10 text-center space-y-3">
                          <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto group-hover/value:scale-110 transition-transform duration-300">
                            <value.icon className="w-7 h-7 text-white" />
                          </div>
                          <h4 className="text-base font-semibold text-foreground">{value.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {value.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;