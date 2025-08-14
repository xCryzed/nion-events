import { Send, Phone, Mail, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/hooks/use-google-analytics';
import { supabase } from '@/integrations/supabase/client';
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

    const onSubmit = async (values: FormData) => {
        try {
            trackEvent('submit', 'conversion', 'contact_form', 1);
            const { data, error } = await supabase
              .from('contact_requests')
              .insert([{
                  name: values.name,
                  email: values.email,
                  phone: values.phone || null,
                  mobile: values.mobile || null,
                  company: values.company || null,
                  event_type: values.eventType || null,
                  callback_time: values.callbackTime || null,
                  venue: values.venue || null,
                  message: values.message
              }])
              .select()
              .single();

            if (error) {
                console.error('Error submitting contact request:', error);
                trackError(error.message, 'form_submission', 'contact_form', {
                    form_data: {
                        name: values.name,
                        email: values.email,
                        event_type: values.eventType
                    },
                    error_code: error.code || 'unknown'
                });
                toast({
                    title: "Fehler beim Senden",
                    description: "Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
                    variant: "destructive"
                });
                return;
            }

            // Send email notification
            try {
                const emailData = {
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    mobile: values.mobile,
                    company: values.company,
                    event_type: values.eventType,
                    callback_time: values.callbackTime,
                    venue: values.venue,
                    message: values.message,
                    created_at: data.created_at
                };

                await supabase.functions.invoke('send-contact-notification', {
                    body: emailData
                });

                console.log('Email notification sent successfully');
            } catch (emailError) {
                console.error('Error sending email notification:', emailError);
                trackError(emailError instanceof Error ? emailError : 'Email notification failed', 'email_service', 'contact_form', {
                    form_data: { name: values.name, email: values.email }
                });
                // Don't show error to user, as the main form submission was successful
            }

            toast({
                title: "Nachricht gesendet!",
                description: "Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
            });

            // Reset form
            form.reset();
        } catch (error) {
            console.error('Error submitting contact request:', error);
            trackError(error instanceof Error ? error : 'Contact form submission failed', 'form_submission', 'contact_form', {
                form_data: {
                    name: values.name,
                    email: values.email,
                    event_type: values.eventType
                }
            });
            toast({
                title: "Fehler beim Senden",
                description: "Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
                variant: "destructive"
            });
        }
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
                      <span className="text-foreground">Lassen Sie uns </span><span className="text-gradient">sprechen</span>
                      <div className="w-24 h-1 bg-gradient-primary rounded-full mx-auto mt-8"></div>
                  </h2>
                  <p className="text-body-large text-muted-foreground">
                      Haben Sie ein Event-Projekt im Kopf? Kontaktieren Sie uns für eine
                      kostenlose Erstberatung und lassen Sie uns gemeinsam Ihre Vision verwirklichen.
                  </p>
              </div>

              {/* Event Planner CTA Highlight */}
              <div className="mb-16">
                  <div className="max-w-4xl mx-auto">
                      <div className="glass-card p-8 hover-lift border border-primary/20 relative overflow-hidden">
                          {/* Decorative background elements */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"></div>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary/20 rounded-full blur-3xl"></div>
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-primary/15 rounded-full blur-2xl"></div>

                          <div className="relative z-10 text-center">
                              <div className="inline-flex items-center gap-2 bg-gradient-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 border border-primary/20">
                                  <span className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse"></span>
                                  Direkter Weg zum Angebot
                              </div>

                              <h3 className="text-2xl font-bold text-foreground mb-3">
                                  Sie haben schon konkrete Vorstellungen von Ihrem Event?
                              </h3>
                              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                  Holen Sie sich mit unserem Eventplaner direkt ein konkretes Angebot ein.
                                  Schnell, unkompliziert und maßgeschneidert für Ihre Bedürfnisse.
                              </p>

                              <a href="/angebot" className="inline-block">
                                  <Button
                                    size="lg"
                                    className="bg-gradient-primary text-white hover:opacity-90 transition-all duration-300 shadow-glow hover:shadow-xl hover:scale-105 px-8 py-4"
                                    onClick={() => {
                                        try {
                                            trackEvent('click', 'conversion', 'contact_cta_angebot');
                                        } catch (error) {
                                            trackError(error instanceof Error ? error : 'Event tracking failed', 'analytics', 'contact_form');
                                        }
                                    }}
                                  >
                                      Jetzt Angebot erstellen
                                      <Send className="ml-2 w-5 h-5" />
                                  </Button>
                              </a>
                          </div>
                      </div>
                  </div>
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
                                      <a
                                        href={info.href}
                                        target={info.title === 'WhatsApp' ? '_blank' : undefined}
                                        rel={info.title === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                                        className="block"
                                        onClick={() => {
                                            const eventLabel = info.title.toLowerCase().replace(' ', '_');
                                            trackEvent('click', 'communication', `contact_${eventLabel}`);
                                        }}
                                      >
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

              {/* Centered Quick Contact Section */}
              <div className="mt-20">
                  <div className="max-w-4xl mx-auto">
                      <div className="glass-card p-8 text-center hover-lift relative overflow-hidden border border-border/20">
                          {/* Decorative elements */}
                          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-primary/10 rounded-full blur-2xl -translate-x-12 -translate-y-12"></div>
                          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-primary/10 rounded-full blur-2xl translate-x-12 translate-y-12"></div>

                          {/* Content */}
                          <div className="relative z-10">
                              <h4 className="text-2xl font-bold text-foreground mb-3">Kontakt speichern</h4>
                              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                                  Speichern Sie unsere Kontaktdaten direkt oder nutzen Sie den QR-Code für sofortigen Zugriff
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-6">
                                  {/* QR Code */}
                                  <div className="flex flex-col items-center group">
                                      <img
                                        src="/nion-events-contact-qr-code.svg"
                                        alt="NION Events Kontakt QR-Code"
                                        className="w-28 h-28 mb-3 group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <span className="text-sm text-muted-foreground font-medium">QR-Code scannen</span>
                                  </div>

                                  {/* Center divider */}
                                  <div className="flex items-center justify-center">
                                      <div className="flex items-center space-x-2">
                                          <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent md:hidden"></div>
                                          <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-primary/60 to-transparent"></div>
                                          <span className="px-3 py-1 text-sm text-muted-foreground/80 font-medium bg-background/50 rounded-full border border-border/30">
                                                oder
                                            </span>
                                          <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent md:hidden"></div>
                                          <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-primary/60 to-transparent"></div>
                                      </div>
                                  </div>

                                  {/* Download Button */}
                                  <div className="flex flex-col items-center">
                                      <a
                                        href="/nion-events-vcard.vcf"
                                        download="NION-Events-Kontakt.vcf"
                                        className="block mb-3"
                                        onClick={() => trackEvent('click', 'download', 'contact_vcard')}
                                      >
                                          <Button
                                            size="lg"
                                            className="bg-gradient-primary text-white hover:opacity-90 transition-all duration-300 shadow-glow hover:shadow-xl hover:scale-105 px-8 py-3"
                                          >
                                              <Download className="w-5 h-5 mr-3" />
                                              Kontakt speichern
                                          </Button>
                                      </a>
                                      <span className="text-sm text-muted-foreground font-medium">Direkt ins Adressbuch</span>
                                  </div>
                              </div>

                              {/* Single footer accent */}
                              <div className="w-24 h-0.5 bg-gradient-primary rounded-full mx-auto opacity-60"></div>
                          </div>
                      </div>
                  </div>
              </div>

          </div>
      </section>
    );
};

export default Contact;