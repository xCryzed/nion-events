import { Headphones, Volume2, Lightbulb, Heart, Briefcase, Star, Package, Camera } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Headphones,
      title: 'Musik & Entertainment',
      description: 'Professioneller DJ-Service für jeden Anlass – von Club bis Gala',
      features: ['Individuelle Musikauswahl nach Kundenwunsch', 'Moderation & Animation auf Wunsch', 'DJ + Live-Musiker kombinierbar']
    },
    {
      icon: Volume2,
      title: 'Licht-, Ton- & Veranstaltungstechnik',
      description: 'Verleih von Licht- und Tontechnik für Events jeder Größe',
      features: ['Modernes Equipment & Bühnentechnik', 'Auf- & Abbau durch erfahrene Techniker', 'Technische Betreuung vor Ort']
    },
    {
      icon: Lightbulb,
      title: 'Konzeption & Eventplanung',
      description: 'Individuelle Eventkonzeption: von der Idee bis zur Umsetzung',
      features: ['Ablaufplanung & Timemanagement', 'Locationberatung & -scouting', 'Moodboards & Konzepte']
    },
    {
      icon: Heart,
      title: 'Private Events',
      description: 'Geburtstagsfeiern, Hochzeiten, Abibälle & Familienfeste',
      features: ['Geburtstagsfeiern (18., 30., 50., ...)', 'Hochzeiten & Verlobungsfeiern', 'Abibälle & Abschlussfeiern']
    },
    {
      icon: Briefcase,
      title: 'Business-Events & Corporate Solutions',
      description: 'Firmenfeiern, Produktpräsentationen & Galaabende',
      features: ['Firmenfeiern & Sommerfeste', 'Produktpräsentationen & Markeninszenierungen', 'Team-Building-Events & Incentives']
    },
    {
      icon: Star,
      title: 'Spezialformate & Besonderes',
      description: 'Silent-Disco, Motto-Partys & Hybrid-Events',
      features: ['Silent-Disco (Kopfhörerpartys)', 'Open-Air-Events & Pop-up-Veranstaltungen', 'Hybrid-Events & Streaming-Technik']
    },
    {
      icon: Package,
      title: 'Full Service oder individuell buchbar',
      description: 'Alles aus einer Hand oder einzeln buchbar nach Ihren Bedürfnissen',
      features: ['Musik, Technik, Planung, Durchführung', 'Einzeln buchbar: DJ, Technik oder Planung', 'Persönlicher Ansprechpartner']
    },
    {
      icon: Camera,
      title: 'Foto & Videoproduktion',
      description: 'Hochzeitsfotografie, Aftermovies & Business-Videodreh',
      features: ['Hochzeitsfotografie & -videos in Kino-Qualität', 'Dynamische Aftermovies für Events', 'Imagefilme & Corporate Videos']
    },
  ];

  return (
    <section id="services" className="section-padding bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-headline mb-6">
            Unsere <span className="text-gradient">Leistungen</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-primary rounded-full mx-auto mb-8"></div>
          <p className="text-body-large text-muted-foreground">
            Von der ersten Idee bis zur perfekten Umsetzung – wir bieten Ihnen 
            alle Services aus einer Hand für unvergessliche Events.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="glass-card p-8 hover-lift group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300">
                <service.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-title mb-4 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-body text-muted-foreground mb-6">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-body-large text-muted-foreground mb-6">
            Benötigen Sie eine individuelle Lösung?
          </p>
          <button className="btn-hero">
            Kostenlose Beratung vereinbaren
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;