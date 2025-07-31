import { Calendar, Users, Lightbulb, Award, Zap, Shield } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Calendar,
      title: 'Eventplanung',
      description: 'Komplette Planung und Koordination Ihrer Veranstaltung von A bis Z.',
      features: ['Terminplanung', 'Location-Scouting', 'Budgetmanagement']
    },
    {
      icon: Users,
      title: 'Konferenzen & Meetings',
      description: 'Professionelle Business-Events für maximale Wirkung und Erfolg.',
      features: ['Hybride Events', 'Streaming-Lösungen', 'Networking-Formate']
    },
    {
      icon: Lightbulb,
      title: 'Kreative Konzepte',
      description: 'Innovative Ideen und maßgeschneiderte Event-Konzepte.',
      features: ['Themenentwicklung', 'Storytelling', 'Erlebnisdesign']
    },
    {
      icon: Award,
      title: 'Gala-Events',
      description: 'Exklusive Veranstaltungen mit höchstem Anspruch an Qualität.',
      features: ['Awards-Zeremonien', 'Firmenjubiläen', 'Produktlaunches']
    },
    {
      icon: Zap,
      title: 'Live-Marketing',
      description: 'Emotionale Markenerlebnisse, die in Erinnerung bleiben.',
      features: ['Messeauftritte', 'Roadshows', 'Pop-up Events']
    },
    {
      icon: Shield,
      title: 'Full-Service',
      description: 'Rundum-Betreuung mit persönlichem Ansprechpartner.',
      features: ['24/7 Support', 'Vor-Ort-Betreuung', 'Nachbetreuung']
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