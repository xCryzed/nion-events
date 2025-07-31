import { Star, Quote } from 'lucide-react';
import abiomed from '@/assets/logos/abiomed-logo.png';
import jj from '@/assets/logos/jj-logo.png';
import hammer from '@/assets/logos/hammer-logo.png';
import advancedLogistics from '@/assets/logos/advanced-logistics-logo.png';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Dr. Sarah Weber',
      position: 'Geschäftsführerin',
      company: 'TechCorp GmbH',
      content: 'NION hat unsere Jahreskonferenz zu einem unvergesslichen Erlebnis gemacht. Die professionelle Planung und kreative Umsetzung haben alle Erwartungen übertroffen.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c4?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Michael Richter',
      position: 'Marketing Director',
      company: 'InnovateLab',
      content: 'Außergewöhnliche Kreativität gepaart mit perfekter Organisation. Das NION-Team hat unseren Produktlaunch zu einem vollen Erfolg gemacht.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Lisa Müller',
      position: 'Vorstand',
      company: 'FutureVision AG',
      content: 'Von der ersten Beratung bis zur Nachbetreuung – alles war perfekt durchdacht. NION ist unser Partner für alle wichtigen Events.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
  ];

  const partners = [
    { name: 'Abiomed Europe GmbH', logo: abiomed },
    { name: 'Johnson & Johnson', logo: jj },
    { name: 'Hammer GmbH & Co. KG', logo: hammer },
    { name: 'Advanced Logistics', logo: advancedLogistics },
  ];

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
              className="glass-card p-8 hover-lift"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Quote Icon */}
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-6">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-body text-muted-foreground mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.position}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center">
          <h3 className="text-title mb-12 text-muted-foreground">
            Vertrauen von führenden Unternehmen
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {partners.map((partner, index) => (
              <div 
                key={index} 
                className="glass-card p-6 hover-lift group transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img 
                  src={partner.logo} 
                  alt={`${partner.name} Logo`}
                  className="w-full h-16 object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300 filter brightness-0 invert group-hover:filter-none"
                />
                <p className="text-sm text-muted-foreground mt-3 group-hover:text-foreground transition-colors">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;