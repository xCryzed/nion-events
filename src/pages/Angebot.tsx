import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Users, Music, Camera, Video, Mic, Lightbulb, Volume2, ChevronLeft, ChevronRight, CheckCircle, Monitor, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/hooks/use-google-analytics';
import { supabase } from '@/integrations/supabase/client';
import { useFormPersistence } from '@/hooks/use-form-persistence';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const angebotSchema = z.object({
    veranstaltungstitel: z.string().min(1, 'Veranstaltungstitel ist erforderlich'),
    datum: z.date({ required_error: 'Datum ist erforderlich' }),
    istMehrtaegig: z.boolean().default(false),
    enddatum: z.date().optional(),
    location: z.string().optional(),
    locationOption: z.enum(['has_location', 'find_location']).default('has_location'),
    gasteanzahl: z.string().min(1, 'Erwartete Gästeanzahl ist erforderlich'),
    djGenres: z.array(z.string()).optional(),
    fotograf: z.boolean().default(false),
    videograf: z.boolean().default(false),
    lichtoperator: z.boolean().default(false),
    veranstaltungstechnik: z.array(z.string()).min(1, 'Mindestens eine Technik auswählen'),
    zusatzwunsche: z.string().optional(),
    kontakt: z.object({
        name: z.string().min(1, 'Name ist erforderlich'),
        email: z.string().email('Gültige E-Mail erforderlich'),
        telefon: z.string().min(1, 'Telefonnummer ist erforderlich').regex(/^[\d\s\+\-\(\)\/]{8,}$/, 'Gültige Telefonnummer erforderlich'),
        unternehmen: z.string().optional(),
        strasse: z.string().min(1, 'Straße ist erforderlich'),
        hausnummer: z.string().min(1, 'Hausnummer ist erforderlich'),
        postleitzahl: z.string().min(5, 'Postleitzahl ist erforderlich').max(5, 'Postleitzahl muss 5 Stellen haben'),
        ort: z.string().min(1, 'Ort ist erforderlich'),
    }),
}).refine((data) => {
    if (data.locationOption === 'has_location') {
        return data.location && data.location.trim().length > 0;
    }
    return true;
}, {
    message: 'Location ist erforderlich',
    path: ['location']
});

type AngebotForm = z.infer<typeof angebotSchema>;

const technikOptionen = [
    {
        id: 'sound',
        label: 'Soundsystem',
        icon: Volume2,
        description: 'Professionelle Beschallungsanlage für optimale Klangqualität'
    },
    {
        id: 'licht',
        label: 'Lichttechnik',
        icon: Lightbulb,
        description: 'Stimmungsvolle Beleuchtung und Effekte für Ihre Veranstaltung'
    },
    {
        id: 'buehne',
        label: 'Bühnentechnik',
        icon: Mic,
        description: 'Mikrofone, Mixer und Equipment für Präsentationen'
    },
    {
        id: 'led',
        label: 'LED-Wände',
        icon: Monitor,
        description: 'Hochauflösende LED-Displays für visuelle Inhalte'
    },
    {
        id: 'projektion',
        label: 'Projektion',
        icon: Camera,
        description: 'Beamer und Leinwände für Präsentationen und Videos'
    },
];

const genreOptionen = [
    'House', 'Techno', 'Pop', 'Rock', 'Hip-Hop', 'Schlager',
    'Oldies', 'Charts', 'Electronic', 'Jazz', 'Reggae', 'Latin'
];

const gasteAnzahlOptionen = [
    '1-50', '51-100', '101-200', '201-500', '501-1000', '1000+', 'Noch nicht bekannt'
];

const steps = [
    { id: 1, title: 'Event Details', description: 'Grundlegende Informationen zu Ihrer Veranstaltung' },
    { id: 2, title: 'Technik & Service', description: 'Gewünschte Technik und Dienstleistungen' },
    { id: 3, title: 'Kontaktdaten', description: 'Ihre Kontaktinformationen für das Angebot' },
];

const Angebot = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 Stunden in Sekunden
    const { toast } = useToast();

    // Timer Effect für 24h Countdown
    useEffect(() => {
        if (!isSuccess) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isSuccess]);

    // Timer formatieren
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return { hours, minutes, seconds: secs };
    };

    const time = formatTime(timeLeft);

    const form = useForm<AngebotForm>({
        resolver: zodResolver(angebotSchema),
        mode: 'onTouched', // Validierung erst bei Berührung der Felder
        defaultValues: {
            istMehrtaegig: false,
            locationOption: 'has_location',
            veranstaltungstechnik: [],
            djGenres: [],
            fotograf: false,
            videograf: false,
            lichtoperator: false,
            kontakt: {
                name: '',
                email: '',
                telefon: '',
                unternehmen: '',
                strasse: '',
                hausnummer: '',
                postleitzahl: '',
                ort: '',
            },
        },
    });

    const { clearStorage } = useFormPersistence(form, 'angebot-form-data');

    const validateCurrentStep = async () => {
        let isValid = true;

        if (currentStep === 1) {
            // Validate step 1 fields
            const step1Fields = ['veranstaltungstitel', 'datum', 'gasteanzahl'];
            for (const field of step1Fields) {
                const result = await form.trigger(field as keyof AngebotForm);
                if (!result) isValid = false;
            }
            // Validate location only if user has selected 'has_location'
            const locationOption = form.getValues('locationOption');
            if (locationOption === 'has_location') {
                const locationResult = await form.trigger('location');
                if (!locationResult) isValid = false;
            }
        } else if (currentStep === 2) {
            // Validate step 2 fields - veranstaltungstechnik is required
            const result = await form.trigger('veranstaltungstechnik');
            if (!result) isValid = false;
        }

        return isValid;
    };

    const nextStep = async () => {
        console.log('Next step called, current step:', currentStep);

        if (currentStep < 3) {
            const isCurrentStepValid = await validateCurrentStep();
            if (isCurrentStepValid) {
                setCurrentStep(currentStep + 1);
            } else {
                toast({
                    title: 'Bitte füllen Sie alle Pflichtfelder aus',
                    description: 'Vervollständigen Sie die aktuellen Angaben, bevor Sie fortfahren.',
                    variant: 'destructive'
                });
            }
        }
    };

    const getStepValidation = (step: number) => {
        const errors = form.formState.errors;

        if (step === 1) {
            const step1Fields = ['veranstaltungstitel', 'datum', 'gasteanzahl'];
            const hasBasicErrors = step1Fields.some(field => errors[field as keyof AngebotForm]);
            const locationOption = form.getValues('locationOption');
            const hasLocationError = locationOption === 'has_location' && errors.location;
            return !hasBasicErrors && !hasLocationError;
        } else if (step === 2) {
            return !errors.veranstaltungstechnik;
        } else if (step === 3) {
            return !errors.kontakt?.name && !errors.kontakt?.email && !errors.kontakt?.telefon && !errors.kontakt?.strasse &&
              !errors.kontakt?.hausnummer && !errors.kontakt?.postleitzahl && !errors.kontakt?.ort;
        }

        return true;
    };

    const prevStep = () => {
        console.log('Previous step called, current step:', currentStep);
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submit handler called');
        console.log('Current step:', currentStep);
        console.log('Form errors:', form.formState.errors);
        console.log('Form values:', form.getValues());

        if (currentStep < 3) {
            await nextStep();
        } else {
            form.handleSubmit(onSubmit)(e);
        }
    };


    const onSubmit = async (data: AngebotForm) => {
        console.log('Form submitted with data:', data);
        trackEvent('submit', 'conversion', 'angebot_form', 1);
        setIsSubmitting(true);
        try {
            // Get current user if authenticated
            const { data: { user } } = await supabase.auth.getUser();

            // Prepare event request data for the event_requests table
            // The offer_number will be automatically generated by the database trigger
            const eventRequestData = {
                event_title: data.veranstaltungstitel,
                event_date: data.datum.toISOString(),
                end_date: data.istMehrtaegig && data.enddatum ? data.enddatum.toISOString() : null,
                location: data.locationOption === 'has_location' ? data.location || '' :
                  'Location wird gesucht',
                guest_count: data.gasteanzahl,
                tech_requirements: data.veranstaltungstechnik,
                dj_genres: data.djGenres || [],
                photographer: data.fotograf,
                videographer: data.videograf,
                light_operator: data.lichtoperator,
                additional_wishes: data.zusatzwunsche || '',
                contact_name: data.kontakt.name,
                contact_email: data.kontakt.email,
                contact_phone: data.kontakt.telefon,
                contact_company: data.kontakt.unternehmen || '',
                contact_street: data.kontakt.strasse,
                contact_house_number: data.kontakt.hausnummer,
                contact_postal_code: data.kontakt.postleitzahl,
                contact_city: data.kontakt.ort,
                user_id: user?.id || null, // Set user_id if user is authenticated
                status: 'ANGEFRAGT' as const
            };

            console.log('Sending event request data:', eventRequestData);

            const { data: insertedData, error } = await (supabase as any)
              .from('event_requests')
              .insert([eventRequestData])
              .select('offer_number')
              .single();

            if (error) {
                console.error('Supabase error:', error);
                trackError(error.message, 'form_submission', 'angebot_form', {
                    event_title: data.veranstaltungstitel,
                    guest_count: data.gasteanzahl,
                    error_code: error.code || 'unknown'
                });
                throw error;
            }

            const angebotsnummer = insertedData?.offer_number;
            console.log('Event request saved successfully with offer number:', angebotsnummer);

            // Send notification emails
            try {
                const emailData = {
                    id: insertedData.id,
                    offer_number: angebotsnummer,
                    event_title: data.veranstaltungstitel,
                    event_date: data.datum.toISOString(),
                    end_date: data.istMehrtaegig && data.enddatum ? data.enddatum.toISOString() : null,
                    location: data.locationOption === 'has_location' ? data.location || '' : 'Location wird gesucht',
                    guest_count: data.gasteanzahl,
                    tech_requirements: data.veranstaltungstechnik,
                    dj_genres: data.djGenres || [],
                    photographer: data.fotograf,
                    videographer: data.videograf,
                    light_operator: data.lichtoperator,
                    additional_wishes: data.zusatzwunsche || '',
                    contact_name: data.kontakt.name,
                    contact_email: data.kontakt.email,
                    contact_phone: data.kontakt.telefon,
                    contact_company: data.kontakt.unternehmen || '',
                    contact_street: data.kontakt.strasse,
                    contact_house_number: data.kontakt.hausnummer,
                    contact_postal_code: data.kontakt.postleitzahl,
                    contact_city: data.kontakt.ort,
                    created_at: new Date().toISOString()
                };

                // Send both emails in parallel
                const [notificationResult, confirmationResult] = await Promise.allSettled([
                    supabase.functions.invoke('send-offer-notification', { body: emailData }),
                    supabase.functions.invoke('send-offer-confirmation', { body: emailData })
                ]);

                // Check for rate limiting specifically
                if (notificationResult.status === 'rejected') {
                    const error = notificationResult.reason;
                    if (error?.message?.includes('Rate limit exceeded') || error?.status === 429) {
                        console.warn('Rate limit reached for offer notifications');
                        toast({
                            title: "Zu viele Angebotsanfragen",
                            description: "Sie haben zu viele Angebotsanfragen in kurzer Zeit gesendet. Bitte versuchen Sie es in einer Stunde erneut.",
                            variant: "destructive"
                        });
                        return;
                    }
                    console.error('Failed to send notification email:', error);
                }
                
                if (confirmationResult.status === 'rejected') {
                    console.error('Failed to send confirmation email:', confirmationResult.reason);
                }

                console.log('Email notifications sent');
            } catch (emailError) {
                console.error('Error sending email notifications:', emailError);
                
                // Check if it's a rate limiting error
                if (emailError?.message?.includes('Rate limit exceeded') || 
                    emailError?.status === 429) {
                    toast({
                        title: "Zu viele Angebotsanfragen",
                        description: "Sie haben zu viele Angebotsanfragen in kurzer Zeit gesendet. Bitte versuchen Sie es in einer Stunde erneut.",
                        variant: "destructive"
                    });
                    return;
                }
                
                // Don't fail the entire process if emails fail
            }

            // Clear localStorage and show success
            clearStorage();
            setIsSuccess(true);
            toast({
                title: 'Anfrage erfolgreich gesendet!',
                description: `Ihre Angebotsnummer lautet: ${angebotsnummer}. Wir melden uns innerhalb von 24 Stunden bei Ihnen.`,
                duration: 8000,
            });
        } catch (error) {
            console.error('Error submitting event request:', error);
            trackError(error instanceof Error ? error : 'Event request submission failed', 'form_submission', 'angebot_form', {
                event_title: data.veranstaltungstitel,
                guest_count: data.gasteanzahl,
                location_option: data.locationOption
            });
            toast({
                title: 'Fehler beim Senden',
                description: 'Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
          <div className="min-h-screen bg-gradient-hero">
              <Header />
              <div className="container mx-auto px-4 py-20">
                  <div className="max-w-4xl mx-auto">
                      {/* Success Header */}
                      <div className="text-center mb-12">
                          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-scale-in">
                              <CheckCircle className="w-10 h-10 text-white" />
                          </div>
                          <h1 className="text-display mb-6">
                              Vielen Dank für Ihre <span className="text-gradient">Anfrage!</span>
                          </h1>
                          <p className="text-body-large text-muted-foreground mb-8 max-w-2xl mx-auto">
                              Wir haben Ihre Anfrage erhalten und werden Ihnen innerhalb von 24 Stunden ein individuelles Angebot erstellen.
                          </p>
                      </div>

                      {/* 24h Timer Card */}
                      <Card className="glass-card mb-8 overflow-hidden">
                          <CardContent className="p-8">
                              <div className="text-center">
                                  <div className="flex items-center justify-center mb-6">
                                      <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mr-4">
                                          <Timer className="w-8 h-8 text-white" />
                                      </div>
                                      <div>
                                          <h3 className="text-title mb-2">Ihr Angebot wird erstellt</h3>
                                          <p className="text-muted-foreground">Geschätzte Bearbeitungszeit</p>
                                      </div>
                                  </div>

                                  {/* Countdown Timer */}
                                  <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
                                      <div className="glass-card p-4 text-center">
                                          <div className="text-2xl font-bold text-gradient mb-1">
                                              {time.hours.toString().padStart(2, '0')}
                                          </div>
                                          <div className="text-sm text-muted-foreground">Stunden</div>
                                      </div>
                                      <div className="glass-card p-4 text-center">
                                          <div className="text-2xl font-bold text-gradient mb-1">
                                              {time.minutes.toString().padStart(2, '0')}
                                          </div>
                                          <div className="text-sm text-muted-foreground">Minuten</div>
                                      </div>
                                      <div className="glass-card p-4 text-center">
                                          <div className="text-2xl font-bold text-gradient mb-1">
                                              {time.seconds.toString().padStart(2, '0')}
                                          </div>
                                          <div className="text-sm text-muted-foreground">Sekunden</div>
                                      </div>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="w-full bg-border rounded-full h-2 mb-4">
                                      <div
                                        className="bg-gradient-primary h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${((24 * 60 * 60 - timeLeft) / (24 * 60 * 60)) * 100}%` }}
                                      ></div>
                                  </div>

                                  <p className="text-sm text-muted-foreground">
                                      Sie erhalten Ihr individuelles Angebot per E-Mail
                                  </p>
                              </div>
                          </CardContent>
                      </Card>

                      {/* Action Button */}
                      <div className="text-center">
                          <Button
                            onClick={() => {
                                try {
                                    trackEvent('click', 'navigation', 'angebot_success_homepage');
                                    window.location.href = '/';
                                } catch (error) {
                                    trackError(error instanceof Error ? error : 'Navigation tracking failed', 'analytics', 'angebot_success');
                                    window.location.href = '/';
                                }
                            }}
                            className="btn-hero"
                          >
                              Zurück zur Startseite
                          </Button>
                      </div>
                  </div>
              </div>
              <Footer />
          </div>
        );
    }

    return (
      <div className="min-h-screen bg-gradient-hero">
          <Header />

          {/* Hero Section */}
          <section className="py-20 relative overflow-hidden">
              <div className="container mx-auto px-4">
                  <div className="max-w-4xl mx-auto text-center mb-16">
                      <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
                          <span className="w-2 h-2 bg-primary rounded-full mr-3 animate-glow-pulse"></span>
                          <span className="text-sm font-medium">Kostenloses Angebot anfordern</span>
                      </div>
                      <h1 className="text-display mb-6">
                          Ihr <span className="text-gradient">perfektes Event</span><br />
                          beginnt hier
                      </h1>
                      <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
                          Beschreiben Sie uns Ihre Vorstellungen und erhalten Sie innerhalb von 24 Stunden
                          ein maßgeschneidertes Angebot für Ihre Veranstaltung.
                      </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="max-w-3xl mx-auto mb-12">
                      <div className="flex items-center justify-between">
                          {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                  className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                                    currentStep >= step.id
                                      ? "bg-gradient-primary text-white shadow-glow"
                                      : "bg-card border border-border text-muted-foreground"
                                  )}
                                >
                                    {step.id}
                                </div>
                                <div className="ml-4 hidden md:block">
                                    <h3 className={cn(
                                      "font-semibold transition-colors",
                                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                  <div className={cn(
                                    "hidden md:block w-24 h-0.5 mx-8 transition-colors",
                                    currentStep > step.id ? "bg-primary" : "bg-border"
                                  )} />
                                )}
                            </div>
                          ))}
                      </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
                      <Card className="glass-card">
                          <CardContent className="p-8">
                              {/* Step 1: Event Details */}
                              {currentStep === 1 && (
                                <div className="space-y-8">
                                    <div className="text-center mb-8">
                                        <h2 className="text-title mb-2">Event Details</h2>
                                        <p className="text-muted-foreground">Erzählen Sie uns von Ihrer Veranstaltung</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Veranstaltungstitel *</label>
                                            <Input
                                              {...form.register('veranstaltungstitel')}
                                              placeholder="z.B. Firmenfeier 2024"
                                              className="bg-input/50"
                                            />
                                            {form.formState.errors.veranstaltungstitel && (
                                              <p className="text-sm text-destructive">{form.formState.errors.veranstaltungstitel.message}</p>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Startdatum *</label>
                                                <Controller
                                                  control={form.control}
                                                  name="datum"
                                                  render={({ field }) => (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                              variant="outline"
                                                              className={cn(
                                                                "w-full justify-start text-left font-normal bg-input/50",
                                                                !field.value && "text-muted-foreground"
                                                              )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {field.value ? (
                                                                  format(field.value, "PPP", { locale: de })
                                                                ) : (
                                                                  <span>Startdatum wählen</span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                              mode="single"
                                                              selected={field.value}
                                                              onSelect={field.onChange}
                                                              disabled={(date) => date < new Date()}
                                                              initialFocus
                                                              className="pointer-events-auto"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                  )}
                                                />
                                                {form.formState.errors.datum && (
                                                  <p className="text-sm text-destructive">{form.formState.errors.datum.message}</p>
                                                )}
                                            </div>

                                            <div className={cn(
                                              "space-y-2 transition-all duration-300",
                                              form.watch('istMehrtaegig') ? "opacity-100" : "opacity-50"
                                            )}>
                                                <label className="text-sm font-medium">Enddatum</label>
                                                <Controller
                                                  control={form.control}
                                                  name="enddatum"
                                                  render={({ field }) => (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                              variant="outline"
                                                              className={cn(
                                                                "w-full justify-start text-left font-normal bg-input/50",
                                                                !field.value && "text-muted-foreground"
                                                              )}
                                                              disabled={!form.watch('istMehrtaegig')}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {field.value ? (
                                                                  format(field.value, "PPP", { locale: de })
                                                                ) : (
                                                                  <span>Enddatum wählen</span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                              mode="single"
                                                              selected={field.value}
                                                              onSelect={field.onChange}
                                                              disabled={(date) => {
                                                                  const startDate = form.watch('datum');
                                                                  return !startDate || date <= startDate;
                                                              }}
                                                              initialFocus
                                                              className="pointer-events-auto"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                  )}
                                                />
                                            </div>
                                        </div>

                                        {/* Multi-day Event Checkbox - repositioned */}
                                        <div className="flex items-center space-x-3">
                                            <Controller
                                              control={form.control}
                                              name="istMehrtaegig"
                                              render={({ field }) => (
                                                <Checkbox
                                                  checked={field.value}
                                                  onCheckedChange={(checked) => {
                                                      field.onChange(!!checked);
                                                      if (!checked) {
                                                          form.setValue('enddatum', undefined);
                                                      }
                                                  }}
                                                  id="istMehrtaegig"
                                                />
                                              )}
                                            />
                                            <label htmlFor="istMehrtaegig" className="text-sm font-medium cursor-pointer">
                                                Mehrtägige Veranstaltung
                                            </label>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Gästeanzahl *</label>
                                                <Controller
                                                  control={form.control}
                                                  name="gasteanzahl"
                                                  render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="bg-input/50">
                                                            <SelectValue placeholder="Erwartete Gästeanzahl" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {gasteAnzahlOptionen.map((anzahl) => (
                                                              <SelectItem key={anzahl} value={anzahl}>
                                                                  <div className="flex items-center">
                                                                      <Users className="w-4 h-4 mr-2" />
                                                                      {anzahl === 'Noch nicht bekannt' ? anzahl : `${anzahl} Gäste`}
                                                                  </div>
                                                              </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                  )}
                                                />
                                                {form.formState.errors.gasteanzahl && (
                                                  <p className="text-sm text-destructive">{form.formState.errors.gasteanzahl.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Location Status *</label>
                                                <Controller
                                                  control={form.control}
                                                  name="locationOption"
                                                  render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="bg-input/50">
                                                            <SelectValue placeholder="Location Status wählen" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="has_location">Ich habe bereits eine Location</SelectItem>
                                                            <SelectItem value="find_location">Ich möchte eine passende Location finden</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                  )}
                                                />
                                            </div>
                                        </div>

                                        {/* Conditional Location Input */}
                                        {form.watch('locationOption') === 'has_location' && (
                                          <div className="space-y-2">
                                              <label className="text-sm font-medium">Location *</label>
                                              <Input
                                                {...form.register('location')}
                                                placeholder="z.B. Hotel Adlon, Berlin"
                                                className="bg-input/50"
                                              />
                                              {form.formState.errors.location && (
                                                <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
                                              )}
                                          </div>
                                        )}

                                        {form.watch('locationOption') === 'find_location' && (
                                          <div className="p-4 rounded-lg bg-muted/50 border border-border">
                                              <p className="text-sm text-muted-foreground">
                                                  Gerne helfen wir Ihnen bei der Suche nach der perfekten Location für Ihr Event. Weitere Details können Sie in den Zusatzwünschen im nächsten Schritt angeben.
                                              </p>
                                          </div>
                                        )}
                                    </div>
                                </div>
                              )}

                              {/* Step 2: Technik & Service */}
                              {currentStep === 2 && (
                                <div className="space-y-10">
                                    <div className="text-center mb-12">
                                        <h2 className="text-title mb-2">Technik & Service</h2>
                                        <p className="text-muted-foreground">Wählen Sie die gewünschten Services für Ihr Event</p>
                                    </div>

                                    {/* DJ Services */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                                                <Music className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">DJ Services</h3>
                                                <p className="text-sm text-muted-foreground">Professionelle Musik für Ihr Event</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-medium">Gewünschte Musikrichtungen</label>
                                            <div className="flex flex-wrap gap-3">
                                                {genreOptionen.map((genre) => {
                                                    const isSelected = form.watch('djGenres')?.includes(genre) || false;

                                                    return (
                                                      <Badge
                                                        key={genre}
                                                        variant={isSelected ? "default" : "outline"}
                                                        className={cn(
                                                          "cursor-pointer transition-all hover:scale-105 text-sm py-2 px-4",
                                                          isSelected && "bg-gradient-primary shadow-glow"
                                                        )}
                                                        onClick={() => {
                                                            const currentGenres = form.getValues('djGenres') || [];
                                                            const newValue = isSelected
                                                              ? currentGenres.filter(item => item !== genre)
                                                              : [...currentGenres, genre];
                                                            form.setValue('djGenres', newValue);
                                                        }}
                                                      >
                                                          <Music className="w-3 h-3 mr-1" />
                                                          {genre}
                                                      </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Creative Services */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">Creative Services</h3>
                                                <p className="text-sm text-muted-foreground">Professionelle Dokumentation und Beleuchtung</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            {[
                                                { key: 'fotograf', icon: Camera, label: 'Fotograf', desc: 'Professionelle Event-Fotografie' },
                                                { key: 'videograf', icon: Video, label: 'Videograf', desc: 'Hochwertige Videoproduktion' },
                                                { key: 'lichtoperator', icon: Lightbulb, label: 'Licht Operator', desc: 'Professionelle Lichtführung' }
                                            ].map((service) => {
                                                const isSelected = form.watch(service.key as any) || false;

                                                return (
                                                  <div
                                                    key={service.key}
                                                    className={cn(
                                                      "group flex flex-col items-center p-6 rounded-lg border transition-all hover:shadow-elegant cursor-pointer",
                                                      isSelected ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/50"
                                                    )}
                                                    onClick={() => {
                                                        form.setValue(service.key as any, !isSelected);
                                                    }}
                                                  >
                                                      <div className={cn(
                                                        "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all",
                                                        isSelected ? "bg-gradient-primary" : "bg-muted group-hover:bg-primary/20"
                                                      )}>
                                                          <service.icon className={cn("w-8 h-8", isSelected ? "text-white" : "text-muted-foreground")} />
                                                      </div>
                                                      <h4 className="font-semibold mb-2">{service.label}</h4>
                                                      <p className="text-sm text-muted-foreground text-center">{service.desc}</p>
                                                  </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Technical Equipment */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                                                <Volume2 className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">Veranstaltungstechnik</h3>
                                                <p className="text-sm text-muted-foreground">Professionelle Technik für Ihr Event</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {technikOptionen.map((technik) => {
                                                const isSelected = form.watch('veranstaltungstechnik')?.includes(technik.id) || false;

                                                return (
                                                  <div
                                                    key={technik.id}
                                                    className={cn(
                                                      "group p-6 rounded-lg border transition-all hover:shadow-elegant cursor-pointer",
                                                      isSelected ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/50"
                                                    )}
                                                    onClick={() => {
                                                        const currentTechnik = form.getValues('veranstaltungstechnik') || [];
                                                        const newValue = isSelected
                                                          ? currentTechnik.filter(item => item !== technik.id)
                                                          : [...currentTechnik, technik.id];
                                                        form.setValue('veranstaltungstechnik', newValue);
                                                    }}
                                                  >
                                                      <div className="flex items-start space-x-4">
                                                          <div className={cn(
                                                            "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                                                            isSelected ? "bg-gradient-primary" : "bg-muted group-hover:bg-primary/20"
                                                          )}>
                                                              <technik.icon className={cn("w-6 h-6", isSelected ? "text-white" : "text-muted-foreground")} />
                                                          </div>
                                                          <div className="flex-1">
                                                              <h4 className="font-semibold mb-2">{technik.label}</h4>
                                                              <p className="text-sm text-muted-foreground">{technik.description}</p>
                                                          </div>
                                                          <div className={cn(
                                                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-1",
                                                            isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                                                          )}>
                                                              {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                          </div>
                                                      </div>
                                                  </div>
                                                );
                                            })}
                                        </div>
                                        {form.formState.errors.veranstaltungstechnik && (
                                          <p className="text-sm text-destructive">{form.formState.errors.veranstaltungstechnik.message}</p>
                                        )}
                                    </div>

                                    {/* Additional Wishes */}
                                    <div className="space-y-4">
                                        <label className="text-sm font-medium">Zusätzliche Wünsche</label>
                                        <Textarea
                                          {...form.register('zusatzwunsche')}
                                          placeholder="Teilen Sie uns weitere Details oder spezielle Wünsche mit..."
                                          className="bg-input/50 min-h-[120px]"
                                        />
                                    </div>
                                </div>
                              )}

                              {/* Step 3: Kontaktdaten */}
                              {currentStep === 3 && (
                                <div className="space-y-8">
                                    <div className="text-center mb-8">
                                        <h2 className="text-title mb-2">Kontaktdaten</h2>
                                        <p className="text-muted-foreground">Damit wir Ihnen das Angebot zusenden können</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Name *</label>
                                                <Input
                                                  {...form.register('kontakt.name')}
                                                  placeholder="Ihr vollständiger Name"
                                                  className="bg-input/50"
                                                />
                                                {form.formState.errors.kontakt?.name && form.formState.touchedFields.kontakt?.name && (
                                                  <p className="text-sm text-destructive">{form.formState.errors.kontakt.name.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">E-Mail *</label>
                                                <Input
                                                  {...form.register('kontakt.email')}
                                                  type="email"
                                                  placeholder="ihre.email@beispiel.de"
                                                  className="bg-input/50"
                                                />
                                                {form.formState.errors.kontakt?.email && form.formState.touchedFields.kontakt?.email && (
                                                  <p className="text-sm text-destructive">{form.formState.errors.kontakt.email.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Telefonnummer *</label>
                                                <Input
                                                  {...form.register('kontakt.telefon')}
                                                  type="tel"
                                                  placeholder="+49 123 456789"
                                                  className="bg-input/50"
                                                />
                                                {form.formState.errors.kontakt?.telefon && form.formState.touchedFields.kontakt?.telefon && (
                                                  <p className="text-sm text-destructive">{form.formState.errors.kontakt.telefon.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-medium">Unternehmen</label>
                                                <Input
                                                  {...form.register('kontakt.unternehmen')}
                                                  placeholder="Ihr Unternehmen (optional)"
                                                  className="bg-input/50"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-sm font-medium text-muted-foreground">Anschrift für das Angebot</h4>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-medium">Straße *</label>
                                                    <Input
                                                      {...form.register('kontakt.strasse')}
                                                      placeholder="Musterstraße"
                                                      className="bg-input/50"
                                                    />
                                                    {form.formState.errors.kontakt?.strasse && form.formState.touchedFields.kontakt?.strasse && (
                                                      <p className="text-sm text-destructive">{form.formState.errors.kontakt.strasse.message}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Hausnummer *</label>
                                                    <Input
                                                      {...form.register('kontakt.hausnummer')}
                                                      placeholder="123"
                                                      className="bg-input/50"
                                                    />
                                                    {form.formState.errors.kontakt?.hausnummer && form.formState.touchedFields.kontakt?.hausnummer && (
                                                      <p className="text-sm text-destructive">{form.formState.errors.kontakt.hausnummer.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Postleitzahl *</label>
                                                    <Input
                                                      {...form.register('kontakt.postleitzahl')}
                                                      placeholder="12345"
                                                      className="bg-input/50"
                                                      maxLength={5}
                                                    />
                                                    {form.formState.errors.kontakt?.postleitzahl && form.formState.touchedFields.kontakt?.postleitzahl && (
                                                      <p className="text-sm text-destructive">{form.formState.errors.kontakt.postleitzahl.message}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Ort *</label>
                                                    <Input
                                                      {...form.register('kontakt.ort')}
                                                      placeholder="Berlin"
                                                      className="bg-input/50"
                                                    />
                                                    {form.formState.errors.kontakt?.ort && form.formState.touchedFields.kontakt?.ort && (
                                                      <p className="text-sm text-destructive">{form.formState.errors.kontakt.ort.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                              )}

                              {/* Navigation */}
                              <div className="flex justify-between mt-12 pt-8 border-t border-border">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className="bg-transparent"
                                  >
                                      <ChevronLeft className="w-4 h-4 mr-2" />
                                      Zurück
                                  </Button>

                                  {currentStep < 3 ? (
                                    <Button
                                      type="button"
                                      onClick={() => {
                                          trackEvent('click', 'engagement', `angebot_step_${currentStep}_next`);
                                          nextStep();
                                      }}
                                      className="btn-hero"
                                    >
                                        Weiter
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                  ) : (
                                    <Button
                                      type="submit"
                                      disabled={isSubmitting}
                                      className="btn-hero"
                                    >
                                        {isSubmitting ? 'Wird gesendet...' : 'Angebot anfordern'}
                                    </Button>
                                  )}
                              </div>
                          </CardContent>
                      </Card>
                  </form>
              </div>
          </section>

          <Footer />
      </div>
    );
};

export default Angebot;