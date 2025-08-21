import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon, Save, ArrowLeft, User, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFormPersistence } from '@/hooks/use-form-persistence';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignatureCanvas from 'react-signature-canvas';

// German IBAN validation regex
const IBAN_REGEX = /^DE\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}$/;
// German BIC validation regex
const BIC_REGEX = /^[A-Z]{4}DE[A-Z0-9]{2}([A-Z0-9]{3})?$/;
// German tax ID validation (11 digits)
const TAX_ID_REGEX = /^\d{11}$/;
// German social insurance number validation
const SOCIAL_INSURANCE_REGEX = /^\d{2}\s?\d{6}\s?[A-Z]\s?\d{3}$/;

const personalDataSchema = z.object({
    // Personal Information
    first_name: z.string().min(1, 'Vorname ist erforderlich'),
    last_name: z.string().min(1, 'Nachname ist erforderlich'),
    birth_name: z.string().optional(),
    date_of_birth: z.date({ required_error: 'Geburtsdatum ist erforderlich' }),
    street_address: z.string().min(1, 'Straße und Hausnummer ist erforderlich'),
    postal_code: z.string().min(5, 'PLZ muss mindestens 5 Zeichen haben').max(5, 'PLZ darf maximal 5 Zeichen haben'),
    city: z.string().min(1, 'Ort ist erforderlich'),
    marital_status: z.enum(['ledig', 'verheiratet', 'geschieden', 'verwitwet', 'eingetragene_lebenspartnerschaft'], {
        required_error: 'Familienstand ist erforderlich'
    }),
    gender: z.enum(['männlich', 'weiblich', 'divers', 'unbestimmt'], {
        required_error: 'Geschlecht ist erforderlich'
    }),
    nationality: z.string().min(1, 'Staatsangehörigkeit ist erforderlich'),

    // Banking Information
    iban: z.string().regex(IBAN_REGEX, 'Ungültige IBAN (Format: DE12 3456 7890 1234 5678 90)'),
    bic: z.string().regex(BIC_REGEX, 'Ungültiger BIC (Format: ABCDDE2AXXX)'),

    // Employment Information
    start_date: z.date({ required_error: 'Eintrittsdatum ist erforderlich' }),
    job_title: z.string().min(1, 'Berufsbezeichnung ist erforderlich'),
    employment_type: z.enum(['hauptbeschäftigung', 'nebenbeschäftigung'], {
        required_error: 'Art der Beschäftigung ist erforderlich'
    }),

    // Additional Employment
    has_other_employment: z.boolean().default(false),
    is_marginal_employment: z.boolean().optional(),

    // Education
    highest_school_degree: z.enum(['abitur_fachabitur', 'mittlere_reife', 'hauptschule_volksschule', 'ohne_schulabschluss']).optional(),
    highest_professional_qualification: z.enum(['promotion', 'diplom_magister_master_staatsexamen', 'bachelor', 'meister_techniker_fachschule', 'anerkannte_berufsausbildung', 'ohne_berufsausbildung']).optional(),

    // Tax Information
    tax_id: z.string().regex(TAX_ID_REGEX, 'Steuer-ID muss 11 Ziffern haben').optional().or(z.literal('')),
    tax_class_factor: z.string().optional(),
    child_allowances: z.number().min(0).default(0),
    religious_affiliation: z.string().optional(),

    // Social Insurance
    health_insurance_company: z.string().optional(),
    social_insurance_number: z.string().regex(SOCIAL_INSURANCE_REGEX, 'Ungültige Sozialversicherungsnummer').optional().or(z.literal('')),
});

type PersonalDataFormData = z.infer<typeof personalDataSchema>;

const Personaldaten: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [existingData, setExistingData] = useState<any>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
    const [signatureDate, setSignatureDate] = useState<string>('');
    const [canvasWidth, setCanvasWidth] = useState(500);
    const signatureRef = useRef<SignatureCanvas>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const form = useForm<PersonalDataFormData>({
        resolver: zodResolver(personalDataSchema),
        defaultValues: {
            has_other_employment: false,
            child_allowances: 0,
        }
    });

    const { clearStorage } = useFormPersistence(form, 'personal-data-form');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/anmelden');
                return;
            }
            setUser(user);

            // Load existing personal data
            const { data: personalData } = await supabase
                .from('employee_personal_data')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (personalData) {
                setExistingData(personalData);
                setSignatureDataUrl(personalData.signature_data_url || '');
                setSignatureDate(personalData.signature_date ? format(new Date(personalData.signature_date), 'dd.MM.yyyy') : '');
                // Convert dates from string to Date objects and filter out non-form fields
                const formData: Partial<PersonalDataFormData> = {
                    first_name: personalData.first_name,
                    last_name: personalData.last_name,
                    birth_name: personalData.birth_name || undefined,
                    date_of_birth: new Date(personalData.date_of_birth),
                    street_address: personalData.street_address,
                    postal_code: personalData.postal_code,
                    city: personalData.city,
                    marital_status: personalData.marital_status as 'ledig' | 'verheiratet' | 'geschieden' | 'verwitwet' | 'eingetragene_lebenspartnerschaft',
                    gender: personalData.gender as 'männlich' | 'weiblich' | 'divers' | 'unbestimmt',
                    nationality: personalData.nationality,
                    iban: personalData.iban,
                    bic: personalData.bic,
                    start_date: new Date(personalData.start_date),
                    job_title: personalData.job_title,
                    employment_type: personalData.employment_type as 'hauptbeschäftigung' | 'nebenbeschäftigung',
                    has_other_employment: personalData.has_other_employment || false,
                    is_marginal_employment: personalData.is_marginal_employment || undefined,
                    highest_school_degree: personalData.highest_school_degree as 'abitur_fachabitur' | 'mittlere_reife' | 'hauptschule_volksschule' | 'ohne_schulabschluss' | undefined,
                    highest_professional_qualification: personalData.highest_professional_qualification as 'promotion' | 'diplom_magister_master_staatsexamen' | 'bachelor' | 'meister_techniker_fachschule' | 'anerkannte_berufsausbildung' | 'ohne_berufsausbildung' | undefined,
                    tax_id: personalData.tax_id || undefined,
                    tax_class_factor: personalData.tax_class_factor || undefined,
                    child_allowances: personalData.child_allowances || 0,
                    religious_affiliation: personalData.religious_affiliation || undefined,
                    health_insurance_company: personalData.health_insurance_company || undefined,
                    social_insurance_number: personalData.social_insurance_number || undefined,
                };
                form.reset(formData);
            }
        };

        getUser();
    }, [form, navigate]);

    const onSubmit = async (data: PersonalDataFormData) => {
        if (!user) return;

        setLoading(true);
        try {
            const payload = {
                user_id: user.id,
                first_name: data.first_name,
                last_name: data.last_name,
                birth_name: data.birth_name || null,
                date_of_birth: data.date_of_birth.toISOString().split('T')[0],
                street_address: data.street_address,
                postal_code: data.postal_code,
                city: data.city,
                marital_status: data.marital_status,
                gender: data.gender,
                nationality: data.nationality,
                iban: data.iban.replace(/\s/g, '').toUpperCase(),
                bic: data.bic.replace(/\s/g, '').toUpperCase(),
                start_date: data.start_date.toISOString().split('T')[0],
                job_title: data.job_title,
                employment_type: data.employment_type,
                has_other_employment: data.has_other_employment,
                is_marginal_employment: data.is_marginal_employment || null,
                highest_school_degree: data.highest_school_degree || null,
                highest_professional_qualification: data.highest_professional_qualification || null,
                tax_id: data.tax_id || null,
                tax_class_factor: data.tax_class_factor || null,
                child_allowances: data.child_allowances,
                religious_affiliation: data.religious_affiliation || null,
                health_insurance_company: data.health_insurance_company || null,
                social_insurance_number: data.social_insurance_number || null,
                signature_data_url: signatureDataUrl || null,
                signature_date: signatureDate ? new Date(signatureDate.split('.').reverse().join('-')).toISOString() : null,
            };

            let result;
            if (existingData) {
                result = await supabase
                    .from('employee_personal_data')
                    .update(payload)
                    .eq('user_id', user.id);
            } else {
                result = await supabase
                    .from('employee_personal_data')
                    .insert(payload);
            }

            if (result.error) {
                throw result.error;
            }

            toast({
                title: 'Erfolg',
                description: 'Personaldaten wurden erfolgreich gespeichert.',
            });

            clearStorage();
            navigate('/');
        } catch (error: any) {
            console.error('Error saving personal data:', error);
            toast({
                title: 'Fehler',
                description: error.message || 'Beim Speichern ist ein Fehler aufgetreten.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const maritalStatusOptions = [
        { value: 'ledig', label: 'Ledig' },
        { value: 'verheiratet', label: 'Verheiratet' },
        { value: 'geschieden', label: 'Geschieden' },
        { value: 'verwitwet', label: 'Verwitwet' },
        { value: 'eingetragene_lebenspartnerschaft', label: 'Eingetragene Lebenspartnerschaft' },
    ];

    const genderOptions = [
        { value: 'männlich', label: 'Männlich' },
        { value: 'weiblich', label: 'Weiblich' },
        { value: 'divers', label: 'Divers' },
        { value: 'unbestimmt', label: 'Unbestimmt' },
    ];

    const employmentTypeOptions = [
        { value: 'hauptbeschäftigung', label: 'Hauptbeschäftigung' },
        { value: 'nebenbeschäftigung', label: 'Nebenbeschäftigung' },
    ];

    const schoolDegreeOptions = [
        { value: 'abitur_fachabitur', label: 'Abitur/Fachabitur' },
        { value: 'mittlere_reife', label: 'Mittlere Reife/gleichwertiger Abschluss' },
        { value: 'hauptschule_volksschule', label: 'Haupt-/Volksschulabschluss' },
        { value: 'ohne_schulabschluss', label: 'Ohne Schulabschluss' },
    ];

    const professionalQualificationOptions = [
        { value: 'promotion', label: 'Promotion' },
        { value: 'diplom_magister_master_staatsexamen', label: 'Diplom/Magister/Master/Staatsexamen' },
        { value: 'bachelor', label: 'Bachelor' },
        { value: 'meister_techniker_fachschule', label: 'Meister/Techniker/gleichwertiger Fachschulabschluss' },
        { value: 'anerkannte_berufsausbildung', label: 'Anerkannte Berufsausbildung' },
        { value: 'ohne_berufsausbildung', label: 'Ohne beruflichen Ausbildungsabschluss' },
    ];

    const generatePDF = async () => {
        if (!printRef.current || !existingData) {
            toast({
                title: 'Fehler',
                description: 'Keine Personaldaten verfügbar für PDF Export.',
                variant: 'destructive',
            });
            return;
        }

        setGeneratingPdf(true);
        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `Personaldaten_${existingData.first_name}_${existingData.last_name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
            pdf.save(fileName);

            toast({
                title: 'Erfolg',
                description: 'PDF wurde erfolgreich heruntergeladen.',
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: 'Fehler',
                description: 'Beim Erstellen des PDFs ist ein Fehler aufgetreten.',
                variant: 'destructive',
            });
        } finally {
            setGeneratingPdf(false);
        }
    };

    const getLabelForValue = (options: any[], value: string) => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    const clearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
            setSignatureDataUrl('');
            // Force canvas resize after clearing
            setTimeout(() => {
                if (signatureRef.current) {
                    signatureRef.current.getCanvas().width = canvasWidth;
                    signatureRef.current.getCanvas().height = 200;
                }
            }, 0);
        }
    };

    const saveSignature = () => {
        if (signatureRef.current) {
            const dataUrl = signatureRef.current.toDataURL();
            setSignatureDataUrl(dataUrl);
            setSignatureDate(format(new Date(), 'dd.MM.yyyy'));
            toast({
                title: 'Erfolg',
                description: 'Unterschrift gespeichert.',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <Header />

            <main className="container mx-auto px-4 py-8 pt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Zurück
                        </Button>
                        <div className="flex items-center gap-3">
                            <User className="w-6 h-6 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">Personaldaten</h1>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Persönliche Angaben</CardTitle>
                                    <CardDescription>
                                        Grundlegende persönliche Informationen für die Personalakte
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="first_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Vorname *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Max" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="last_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nachname *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Mustermann" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="birth_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Geburtsname (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Musterfrau" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="date_of_birth"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Geburtsdatum *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="date"
                                                            {...field}
                                                            value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                            className="w-full"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="street_address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Straße und Hausnummer *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Musterstraße 123" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="postal_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Postleitzahl *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="12345" maxLength={5} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ort *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Musterstadt" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="marital_status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Familienstand *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Familienstand wählen" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {maritalStatusOptions.map((option) => (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Geschlecht *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Geschlecht wählen" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {genderOptions.map((option) => (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="nationality"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Staatsangehörigkeit *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="deutsch" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Banking Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bankdaten</CardTitle>
                                    <CardDescription>
                                        Bankverbindung für Gehaltsauszahlungen
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="iban"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>IBAN *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="DE12 3456 7890 1234 5678 90"
                                                        {...field}
                                                        onChange={(e) => {
                                                            // Format IBAN with spaces for better readability
                                                            let value = e.target.value.replace(/\s/g, '').toUpperCase();
                                                            if (value.length > 2) {
                                                                value = value.replace(/(.{4})/g, '$1 ').trim();
                                                            }
                                                            field.onChange(value);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bic"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>BIC *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="ABCDDE2AXXX"
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.value.toUpperCase());
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Employment Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Beschäftigungsangaben</CardTitle>
                                    <CardDescription>
                                        Informationen zur Beschäftigung und Position
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="start_date"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Eintrittsdatum *</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd.MM.yyyy", { locale: de })
                                                                    ) : (
                                                                        <span>Datum wählen</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) =>
                                                                    date < new Date("1900-01-01")
                                                                }
                                                                initialFocus
                                                                className="pointer-events-auto"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="job_title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Berufsbezeichnung *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="DJ/Event-Techniker" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="employment_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Art der Beschäftigung *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Art der Beschäftigung wählen" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {employmentTypeOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="has_other_employment"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Üben Sie weitere Beschäftigungen aus?
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="is_marginal_employment"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Handelt es sich hierbei um eine geringfügige Beschäftigung?
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Education */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bildungsabschlüsse</CardTitle>
                                    <CardDescription>
                                        Angaben zu Schul- und Berufsausbildung
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="highest_school_degree"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Höchster Schulabschluss</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Schulabschluss wählen" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {schoolDegreeOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="highest_professional_qualification"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Höchste Berufsausbildung</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Berufsausbildung wählen" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {professionalQualificationOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Tax Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Steuerangaben</CardTitle>
                                    <CardDescription>
                                        Steuerliche Informationen für die Lohnabrechnung
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="tax_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Steuer-Identifikationsnummer</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="12345678901"
                                                            maxLength={11}
                                                            {...field}
                                                            onChange={(e) => {
                                                                // Only allow numbers
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                field.onChange(value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="tax_class_factor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Steuerklasse/Faktor</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="1" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="child_allowances"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kinderfreibeträge</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="religious_affiliation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Konfession</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="evangelisch" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Social Insurance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sozialversicherung</CardTitle>
                                    <CardDescription>
                                        Angaben zur Kranken- und Sozialversicherung
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="health_insurance_company"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gesetzliche Krankenkasse</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="AOK" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="social_insurance_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Versicherungsnummer gem. Sozialversicherungsausweis</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="12 345678 A 123"
                                                        {...field}
                                                        onChange={(e) => {
                                                            // Format social insurance number
                                                            let value = e.target.value.replace(/[^\dA-Z]/g, '');
                                                            if (value.length > 2) {
                                                                value = value.replace(/(\d{2})(\d{6})([A-Z])(\d{3})/, '$1 $2 $3 $4');
                                                            }
                                                            field.onChange(value);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Unterschrift Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Unterschrift</CardTitle>
                                    <CardDescription>
                                        Bitte unterschreiben Sie hier zur Bestätigung der Angaben. Diese Unterschrift wird für die Anmeldung beim Finanzamt und bei der Sozialversicherung benötigt.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="border border-border rounded-lg p-4 bg-background">
                                        <div className="w-full overflow-hidden">
                                            <SignatureCanvas
                                                ref={signatureRef}
                                                canvasProps={{
                                                    width: canvasWidth,
                                                    height: 200,
                                                    className: 'signature-canvas border border-border rounded bg-white',
                                                    style: { width: `${canvasWidth}px`, height: '200px' }
                                                }}
                                                backgroundColor="white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button type="button" onClick={clearSignature} variant="outline" className="w-full sm:w-auto">
                                            Löschen
                                        </Button>
                                        <Button type="button" onClick={saveSignature} className="w-full sm:w-auto">
                                            Unterschrift speichern
                                        </Button>
                                    </div>

                                    {signatureDataUrl && signatureDate && (
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                Unterschrieben am: {signatureDate}
                                            </p>
                                            <div className="mt-2">
                                                <img src={signatureDataUrl} alt="Gespeicherte Unterschrift" className="max-h-16 border rounded" />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto order-3 sm:order-1">
                                    Abbrechen
                                </Button>
                                {existingData && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={generatePDF}
                                        disabled={generatingPdf}
                                        className="w-full sm:w-auto order-2"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        {generatingPdf ? 'Generiere PDF...' : 'PDF herunterladen'}
                                    </Button>
                                )}
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto order-1 sm:order-3">
                                    <Save className="w-4 h-4 mr-2" />
                                    {existingData ? 'Aktualisieren' : 'Speichern'}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {/* Hidden PDF Template */}
                    {existingData && (
                        <div
                            ref={printRef}
                            className="fixed -left-[9999px] top-0 w-[210mm] bg-white p-8 font-sans text-black"
                        >
                            {/* PDF Header */}
                            <div className="mb-8 border-b-2 border-primary pb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-primary">NION Events</h1>
                                        <p className="text-gray-600">Professional Event Services</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">Personaldaten</p>
                                        <p className="text-sm text-gray-600">
                                            Erstellt am: {format(new Date(), 'dd.MM.yyyy', { locale: de })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-4 text-primary border-b border-gray-300 pb-2">
                                    Persönliche Angaben
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Vorname:</strong> {existingData.first_name}</div>
                                    <div><strong>Nachname:</strong> {existingData.last_name}</div>
                                    {existingData.birth_name && (
                                        <div><strong>Geburtsname:</strong> {existingData.birth_name}</div>
                                    )}
                                    <div><strong>Geburtsdatum:</strong> {format(new Date(existingData.date_of_birth), 'dd.MM.yyyy', { locale: de })}</div>
                                    <div className="col-span-2"><strong>Adresse:</strong> {existingData.street_address}, {existingData.postal_code} {existingData.city}</div>
                                    <div><strong>Familienstand:</strong> {getLabelForValue(maritalStatusOptions, existingData.marital_status)}</div>
                                    <div><strong>Geschlecht:</strong> {getLabelForValue(genderOptions, existingData.gender)}</div>
                                    <div><strong>Staatsangehörigkeit:</strong> {existingData.nationality}</div>
                                </div>
                            </div>

                            {/* Banking Information */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-4 text-primary border-b border-gray-300 pb-2">
                                    Bankdaten
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>IBAN:</strong> {existingData.iban}</div>
                                    <div><strong>BIC:</strong> {existingData.bic}</div>
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-4 text-primary border-b border-gray-300 pb-2">
                                    Beschäftigungsangaben
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Eintrittsdatum:</strong> {format(new Date(existingData.start_date), 'dd.MM.yyyy', { locale: de })}</div>
                                    <div><strong>Berufsbezeichnung:</strong> {existingData.job_title}</div>
                                    <div><strong>Art der Beschäftigung:</strong> {getLabelForValue(employmentTypeOptions, existingData.employment_type)}</div>
                                    <div><strong>Weitere Beschäftigungen:</strong> {existingData.has_other_employment ? 'Ja' : 'Nein'}</div>
                                    {existingData.is_marginal_employment !== null && (
                                        <div><strong>Geringfügige Beschäftigung:</strong> {existingData.is_marginal_employment ? 'Ja' : 'Nein'}</div>
                                    )}
                                </div>
                            </div>

                            {/* Education */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-4 text-primary border-b border-gray-300 pb-2">
                                    Bildungsabschlüsse
                                </h2>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    {existingData.highest_school_degree && (
                                        <div><strong>Höchster Schulabschluss:</strong> {getLabelForValue(schoolDegreeOptions, existingData.highest_school_degree)}</div>
                                    )}
                                    {existingData.highest_professional_qualification && (
                                        <div><strong>Höchste Berufsausbildung:</strong> {getLabelForValue(professionalQualificationOptions, existingData.highest_professional_qualification)}</div>
                                    )}
                                </div>
                            </div>

                            {/* Tax Information */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-4 text-primary border-b border-gray-300 pb-2">
                                    Steuerangaben
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {existingData.tax_id && (
                                        <div><strong>Steuer-ID:</strong> {existingData.tax_id}</div>
                                    )}
                                    {existingData.tax_class_factor && (
                                        <div><strong>Steuerklasse/Faktor:</strong> {existingData.tax_class_factor}</div>
                                    )}
                                    <div><strong>Kinderfreibeträge:</strong> {existingData.child_allowances || 0}</div>
                                    {existingData.religious_affiliation && (
                                        <div><strong>Konfession:</strong> {existingData.religious_affiliation}</div>
                                    )}
                                </div>
                            </div>

                            {/* Social Insurance */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-4 text-primary border-b border-gray-300 pb-2">
                                    Sozialversicherung
                                </h2>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    {existingData.health_insurance_company && (
                                        <div><strong>Gesetzliche Krankenkasse:</strong> {existingData.health_insurance_company}</div>
                                    )}
                                    {existingData.social_insurance_number && (
                                        <div><strong>Versicherungsnummer:</strong> {existingData.social_insurance_number}</div>
                                    )}
                                </div>
                            </div>

                            {/* Signature Section in PDF */}
                            <div className="mt-8 border-t pt-6">
                                <h2 className="text-xl font-bold mb-4 text-primary">Bestätigung und Unterschrift</h2>
                                <p className="text-sm mb-4">
                                    Hiermit bestätige ich, dass alle Angaben in diesem Personalfragebogen der Wahrheit entsprechen.
                                    Ich bin mir bewusst, dass falsche Angaben rechtliche Konsequenzen haben können.
                                </p>

                                <div className="flex justify-between items-end mt-8">
                                    <div className="flex-1">
                                        {signatureDataUrl ? (
                                            <div>
                                                <img src={signatureDataUrl} alt="Unterschrift" className="max-h-20 mb-2" />
                                                <div className="border-t border-gray-400 pt-1">
                                                    <p className="text-xs">Unterschrift Mitarbeiter/in</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-b border-gray-400 pb-2 mb-2" style={{ minHeight: '60px' }}>
                                                <p className="text-xs text-gray-500 mt-12">Unterschrift Mitarbeiter/in</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 ml-8 text-center">
                                        <div className="border-b border-gray-400 pb-2 mb-2" style={{ minHeight: '60px' }}>
                                            <p className="text-xs mt-12">{signatureDate || "Datum: ___________"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 text-xs text-gray-600">
                                    <p><strong>Hinweis:</strong> Dieser Personalfragebogen dient der Anmeldung bei den Sozialversicherungsträgern und dem Finanzamt gemäß den gesetzlichen Bestimmungen.</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-12 pt-6 border-t border-gray-300 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <div>
                                        <p><strong>NION Events</strong></p>
                                        <p>Professional Event & DJ Services</p>
                                    </div>
                                    <div className="text-right">
                                        <p>Dokument erstellt am: {format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}</p>
                                        <p>Vertraulich - Nur für interne Verwendung</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Personaldaten;