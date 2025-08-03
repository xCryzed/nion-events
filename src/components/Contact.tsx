import { Send, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name muss mindestens 2 Zeichen lang sein.",
  }),
  email: z.string().email({
    message: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
  }),
  phone: z.string().optional(),
  company: z.string().optional(),
  eventType: z.string().optional(),
  callbackTime: z.string().optional(),
  venue: z.string().optional(),
  message: z.string().min(10, {
    message: "Nachricht muss mindestens 10 Zeichen lang sein.",
  }),
});

type FormData = z.infer<typeof formSchema>;

const Contact = () => {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      eventType: "",
      callbackTime: "",
      venue: "",
      message: "",
    },
  });

  const onSubmit = (values: FormData) => {
    console.log('Form submitted with values:', values);

    // Simulate form submission
    toast({
      title: "Nachricht gesendet!",
      description: "Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
    });

    // Reset form
    form.reset();
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      content: '+49 1575 2046096',
      description: 'Mo-Fr 9:00-18:00 Uhr',
      href: 'tel:+4915752046096'
    },
    {
      icon: Mail,
      title: 'E-Mail',
      content: 'info@nion-events.de',
      description: 'Antwort binnen 24h',
      href: 'mailto:info@nion-events.de'
    },
    {
      icon: () => (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      ),
      title: 'WhatsApp',
      content: '+49 1575 2046096',
      description: 'Direkte Nachricht',
      href: 'https://wa.me/4915752046096'
    },
    {
      icon: Clock,
      title: 'Öffnungszeiten',
      content: 'Mo-Fr 9:00-18:00',
      description: 'Flexible Termine möglich'
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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ihr Name"
                            className="bg-card border-border/50 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-Mail *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ihre@email.de"
                            className="bg-card border-border/50 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefonnummer (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+49 123 456789"
                            className="bg-card border-border/50 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unternehmen (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ihr Unternehmen"
                            className="bg-card border-border/50 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Veranstaltungsvorhaben</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-card border-border/50 focus:border-primary">
                              <SelectValue placeholder="Bitte wählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="hochzeit">Hochzeit</SelectItem>
                            <SelectItem value="firmenveranstaltung">Firmenveranstaltung</SelectItem>
                            <SelectItem value="konferenz">Konferenz</SelectItem>
                            <SelectItem value="gala">Gala-Event</SelectItem>
                            <SelectItem value="geburtstag">Geburtstag</SelectItem>
                            <SelectItem value="abschlussfeier">Abschlussfeier</SelectItem>
                            <SelectItem value="abiball">Abiball</SelectItem>
                            <SelectItem value="produktpräsentation">Produktpräsentation</SelectItem>
                            <SelectItem value="messe">Messe</SelectItem>
                            <SelectItem value="sonstiges">Sonstiges</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="callbackTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gewünschte Rückrufzeit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-card border-border/50 focus:border-primary">
                              <SelectValue placeholder="Bitte wählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="morgens">Morgens (08:00 - 12:00 Uhr)</SelectItem>
                            <SelectItem value="mittags">Mittags (12:00 - 15:00 Uhr)</SelectItem>
                            <SelectItem value="nachmittags">Nachmittags (15:00 - 18:00 Uhr)</SelectItem>
                            <SelectItem value="abends">Abends (18:00 - 20:00 Uhr)</SelectItem>
                            <SelectItem value="wochenende">Am Wochenende</SelectItem>
                            <SelectItem value="flexibel">Flexibel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veranstaltungsort (falls bereits bekannt)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="z.B. Berlin, Hotel XY, eigene Location..."
                          className="bg-card border-border/50 focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nachricht *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Beschreiben Sie Ihr Event-Projekt..."
                          className="bg-card border-border/50 focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="btn-hero w-full group">
                  Nachricht senden
                  <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </Form>
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
              {contactInfo.map((info, index) => {
                const isClickable = info.href;

                const CardContent = () => (
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
                );

                return (
                  <div key={index}>
                    {isClickable ? (
                      <a href={info.href} target={info.title === 'WhatsApp' ? '_blank' : undefined} rel={info.title === 'WhatsApp' ? 'noopener noreferrer' : undefined} className="block">
                        <div className="glass-card p-6 hover-lift cursor-pointer transition-all duration-300 hover:shadow-glow">
                          <CardContent />
                        </div>
                      </a>
                    ) : (
                      <div className="glass-card p-6 hover-lift">
                        <CardContent />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Google Review Section - Full Width */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="glass-card p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h3 className="text-title mb-4 text-foreground">
              Bewerten Sie unsere Arbeit
            </h3>

            {/* 5 Stars */}
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-accent mx-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>

            <p className="text-muted-foreground mb-6">
              Ihre Meinung ist uns wichtig. Teilen Sie Ihre Erfahrung mit anderen und helfen Sie uns dabei,
              noch bessere Events zu gestalten.
            </p>

            <Button
              onClick={() => window.open('https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID', '_blank')}
              className="btn-hero group"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Bei Google bewerten
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;