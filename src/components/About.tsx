import { Award, Heart, Users, Zap } from 'lucide-react';
import ninoPortrait from '@/assets/nino-portrait.webp';

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
                      <span className="text-sm text-muted-foreground font-medium tracking-wide">ÜBER MICH</span>
                  </div>
                  <h2 className="text-5xl lg:text-6xl font-bold mb-6">
                      <span className="text-foreground">Unternehmen</span>
                  </h2>
                  <div className="w-24 h-1 bg-gradient-primary rounded-full mx-auto mb-8"></div>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                      6+ Jahre Expertise im DJ- und Eventmanagement aus Aachen
                  </p>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  {/* Portrait Side */}
                  <div className="order-2 lg:order-1">
                      <div className="relative group">
                          {/* Glowing Background */}
                          <div className="absolute -inset-8 bg-gradient-primary rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>

                          {/* Decorative Elements */}
                          <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-primary rounded-2xl opacity-60 rotate-12"></div>
                          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-accent rounded-xl opacity-80 rotate-45"></div>

                          {/* Main Image */}
                          <div className="relative bg-card rounded-3xl p-2 shadow-2xl">
                              <img
                                src={ninoPortrait}
                                alt="Nino Bergen, Gründer von NION Events"
                                className="w-full h-[500px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                              />

                              {/* Overlay Info Card */}
                              <div className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-xl">
                                  <h3 className="text-xl font-bold text-foreground mb-2">Nino Bergen</h3>
                                  <p className="text-primary font-semibold mb-3">Gründer & DJ</p>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Aachen
                    </span>
                                      <span className="flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                      6+ Jahre Erfahrung
                    </span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Content Side */}
                  <div className="order-1 lg:order-2 space-y-8">
                      {/* Main Story */}
                      <div className="space-y-6">
                          <p className="text-lg leading-relaxed text-muted-foreground">
                              Als <span className="text-primary font-semibold">Nino Bergen</span> aus Aachen bringe ich
                              <span className="text-primary font-semibold"> über 6 Jahre fundierte Erfahrung</span> im DJ- und
                              Eventmanagement mit. Diese langjährige Expertise bildet das Fundament für NION Events.
                          </p>

                          <p className="leading-relaxed text-muted-foreground">
                              <span className="text-primary font-semibold">August 2025</span> markiert einen besonderen Meilenstein:
                              Meine erste eigene Großveranstaltung im renommierten DAS LIEBIG (ehemals Starfish Aachen).
                              Als Höhepunkt folgt die größte Beachparty Aachens, ebenfalls im LIEBIG.
                          </p>
                      </div>

                      {/* Achievement Stats */}
                      <div className="grid grid-cols-2 gap-6">
                          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border">
                              <div className="text-3xl font-bold text-primary mb-2">600+</div>
                              <p className="text-sm text-muted-foreground">Teilnehmer bei größtem Corporate Event</p>
                          </div>
                          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border">
                              <div className="text-3xl font-bold text-primary mb-2">6+</div>
                              <p className="text-sm text-muted-foreground">Jahre DJ & Event Erfahrung</p>
                          </div>
                      </div>

                      {/* Experience Highlights */}
                      <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-foreground">Meine Expertise</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[
                                  "Alle Clubs in Aachen & Region",
                                  "Internationale Auftritte",
                                  "Corporate Events 600+ Gäste",
                                  "Hochzeiten & Abibälle",
                                  "DAS LIEBIG Großevents",
                                  "Private Geburtstage"
                              ].map((item, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-gradient-primary rounded-full"></div>
                                    <span className="text-sm text-muted-foreground">{item}</span>
                                </div>
                              ))}
                          </div>
                      </div>

                      {/* Mission Statement */}
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
                          <p className="text-foreground leading-relaxed">
                              <span className="text-primary font-semibold">NION Events</span> steht für maßgeschneiderte Eventlösungen –
                              von intimen Hochzeitsfeiern bis hin zu großen Firmenevents. Durch meine umfassende Erfahrung garantiere
                              ich Ihnen professionelle Umsetzung auf höchstem Niveau.
                          </p>
                      </div>
                  </div>
              </div>

              {/* Values Section */}
              <div className="mt-24">
                  <div className="text-center mb-16">
                      <h3 className="text-3xl font-bold text-foreground mb-4">Meine Werte</h3>
                      <p className="text-muted-foreground">Was NION Events auszeichnet</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {values.map((value, index) => (
                        <div
                          key={value.title}
                          className="group relative bg-card/30 backdrop-blur-sm p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-500 hover:transform hover:-translate-y-2"
                        >
                            <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                            <div className="relative z-10 text-center space-y-4">
                                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                    <value.icon className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="text-lg font-semibold text-foreground">{value.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
          </div>
      </section>
    );
};

export default About;