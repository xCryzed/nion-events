import { useState } from 'react';
import { Send, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "Nachricht gesendet!",
      description: "Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
    });
    
    // Reset form
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      content: '+49 (0) 123 456 789',
      description: 'Mo-Fr 9:00-18:00 Uhr'
    },
    {
      icon: Mail,
      title: 'E-Mail',
      content: 'info@nion-events.de',
      description: 'Antwort binnen 24h'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      content: 'Musterstraße 123, 12345 Berlin',
      description: 'Termin nach Vereinbarung'
    },
    {
      icon: Clock,
      title: 'Öffnungszeiten',
      content: 'Mo-Fr 9:00-18:00',
      description: 'Notfall-Hotline 24/7'
    },
  ];

  return (
    <section id="contact" className="section-padding bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-headline mb-6">
            Lassen Sie uns <span className="text-gradient">sprechen</span>
          </h2>
          <p className="text-body-large text-muted-foreground">
            Haben Sie ein Event-Projekt im Kopf? Kontaktieren Sie uns für eine 
            kostenlose Erstberatung und lassen Sie uns gemeinsam Ihre Vision verwirklichen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="space-y-8">
            <div>
              <h3 className="text-title mb-4">Nachricht senden</h3>
              <p className="text-body text-muted-foreground mb-8">
                Erzählen Sie uns von Ihrem Projekt. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-card border-border/50 focus:border-primary"
                    placeholder="Ihr Name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    E-Mail *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-card border-border/50 focus:border-primary"
                    placeholder="ihre@email.de"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-2">
                  Unternehmen
                </label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className="bg-card border-border/50 focus:border-primary"
                  placeholder="Ihr Unternehmen"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Nachricht *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="bg-card border-border/50 focus:border-primary"
                  placeholder="Beschreiben Sie Ihr Event-Projekt..."
                />
              </div>

              <Button type="submit" className="btn-hero w-full group">
                Nachricht senden
                <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-title mb-4">Kontaktinformationen</h3>
              <p className="text-body text-muted-foreground mb-8">
                Erreichen Sie uns über verschiedene Kanäle. Wir sind gerne für Sie da.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="glass-card p-6 hover-lift">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {info.title}
                      </h4>
                      <p className="text-body text-foreground mb-1">
                        {info.content}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Contact */}
            <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">
                Notfall-Hotline
              </h4>
              <p className="text-body text-foreground mb-1">
                +49 (0) 123 456 789
              </p>
              <p className="text-sm text-muted-foreground">
                24/7 verfügbar für laufende Events
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;