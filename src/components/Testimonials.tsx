import { Star, Quote, TrendingUp, Users, Award, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import abiomed from '@/assets/logos/abiomed-logo.png';
import jj from '@/assets/logos/jj-logo.png';
import hammer from '@/assets/logos/hammer-logo.png';
import advancedLogistics from '@/assets/logos/advanced-logistics-logo.png';

const Testimonials = () => {
  const [isVisible, setIsVisible] = useState(false);
  
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

  const partnerStats = [
    { icon: Users, label: 'Kunden', value: '500+', color: 'text-blue-400' },
    { icon: Award, label: 'Auszeichnungen', value: '15+', color: 'text-yellow-400' },
    { icon: TrendingUp, label: 'Erfolgsrate', value: '98%', color: 'text-green-400' },
    { icon: Sparkles, label: 'Events', value: '1000+', color: 'text-purple-400' }
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
              className={`glass-card p-8 hover-lift relative overflow-hidden group ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Quote Icon */}
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Quote className="w-6 h-6 text-white" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>

                {/* Content */}
                <p className="text-body text-muted-foreground mb-6 italic group-hover:text-foreground transition-colors duration-300">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="relative">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
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
            </div>
          ))}
        </div>

        {/* Partners Section - Enhanced */}
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-3xl" />
          
          <div className="relative glass-card p-12 rounded-3xl border-primary/20">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {partnerStats.map((stat, index) => (
                <div 
                  key={index}
                  className={`text-center group ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Partners Title */}
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">
                Vertrauen von <span className="text-gradient">führenden Unternehmen</span>
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Diese Weltklasse-Unternehmen vertrauen auf unsere Expertise für ihre wichtigsten Events
              </p>
            </div>

            {/* Enhanced Partner Logos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {partners.map((partner, index) => (
                <div 
                  key={index} 
                  className={`relative group cursor-pointer ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Card */}
                  <div className="relative glass-card p-8 rounded-2xl border-border/50 group-hover:border-primary/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10 transform group-hover:-translate-y-2">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 mb-4 relative">
                        <img 
                          src={partner.logo} 
                          alt={`${partner.name} Logo`}
                          className="w-full h-full object-contain filter brightness-0 invert opacity-60 group-hover:filter-none group-hover:opacity-100 transition-all duration-500"
                        />
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                        {partner.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to action */}
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-6">
                Werden Sie Teil unserer Erfolgsgeschichte
              </p>
              <button className="btn-hero group">
                Ihr nächstes Event planen
                <Sparkles className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;