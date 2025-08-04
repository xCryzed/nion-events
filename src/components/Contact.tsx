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
  mobile: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true; // Optional field
      const mobileRegex = /^(\+49|0049|0)?1[5-7][0-9]{8,9}$/;
      return mobileRegex.test(value.replace(/\s/g, ''));
    }, {
      message: "Bitte geben Sie eine gültige deutsche Mobilnummer ein.",
    }),
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
      description: 'Erreichbar rund um die Uhr',
      href: 'tel:+4915752046096'
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
      icon: Mail,
      title: 'E-Mail',
      content: 'info@nion-events.de',
      description: 'Antwort innerhalb 24h',
      href: 'mailto:info@nion-events.de'
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
                Erzählen Sie uns von Ihrem Vorhaben und wir melden und schnellstmöglich bei Ihnen zurück.
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
                        <FormLabel>Telefonnummer</FormLabel>
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
                        <FormLabel>Unternehmen</FormLabel>
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
                          placeholder="z.B. DAS LIEBIG..."
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
                          placeholder="Beschreiben Sie Ihr Vorhaben..."
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
          <div className="space-y-8 flex-col h-full">
            <div>
              <h3 className="text-title mb-4">Kontaktinformationen</h3>
              <p className="text-body text-muted-foreground mb-8">
                Sie erreichen uns unkompliziert über Ihren bevorzugten Kommunikationsweg.
              </p>
            </div>

            <div className="space-y-6 flex-1">
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
      </div>
    </section>
  );
};

export default Contact;