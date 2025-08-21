import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArrowLeft, User, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFormPersistence } from '@/hooks/use-form-persistence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { PersonalDataStepper } from '@/components/PersonalDataStepper';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignatureCanvas from 'react-signature-canvas';

// Validation schemas and constants
const IBAN_REGEX = /^DE\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}$/;
const BIC_REGEX = /^[A-Z]{4}DE[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const TAX_ID_REGEX = /^\d{11}$/;
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

// Options for dropdowns
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
    { value: 'mittlere_reife', label: 'Mittlere Reife' },
    { value: 'hauptschule_volksschule', label: 'Hauptschule/Volksschule' },
    { value: 'ohne_schulabschluss', label: 'Ohne Schulabschluss' },
];

const professionalQualificationOptions = [
    { value: 'promotion', label: 'Promotion' },
    { value: 'diplom_magister_master_staatsexamen', label: 'Diplom/Magister/Master/Staatsexamen' },
    { value: 'bachelor', label: 'Bachelor' },
    { value: 'meister_techniker_fachschule', label: 'Meister/Techniker/Fachschule' },
    { value: 'anerkannte_berufsausbildung', label: 'Anerkannte Berufsausbildung' },
    { value: 'ohne_berufsausbildung', label: 'Ohne Berufsausbildung' },
];

const PersonaldatenStepper: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [existingData, setExistingData] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
    const [signatureDate, setSignatureDate] = useState<string>('');
    const [canvasWidth, setCanvasWidth] = useState(500);
    const signatureRef = useRef<SignatureCanvas>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const signatureContainerRef = useRef<HTMLDivElement>(null);

    const form = useForm<PersonalDataFormData>({
        resolver: zodResolver(personalDataSchema),
        defaultValues: {
            has_other_employment: false,
            child_allowances: 0,
        },
        mode: 'onChange' // Enable validation on change
    });

    const { clearStorage } = useFormPersistence(form, 'personal-data-form');

    // Watch form values to trigger re-validation
    const watchedValues = form.watch();

    // Update canvas width to match container
    useEffect(() => {
        const updateCanvasWidth = () => {
            if (signatureContainerRef.current) {
                const containerWidth = signatureContainerRef.current.offsetWidth - 32; // Account for padding
                setCanvasWidth(containerWidth);

                // Update existing canvas if it exists and force proper dimensions
                if (signatureRef.current) {
                    const canvas = signatureRef.current.getCanvas();
                    const ratio = Math.max(window.devicePixelRatio || 1, 1);

                    // Set internal canvas size
                    canvas.width = containerWidth * ratio;
                    canvas.height = 200 * ratio;

                    // Set display size
                    canvas.style.width = containerWidth + 'px';
                    canvas.style.height = '200px';

                    // Scale context for sharp rendering
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.scale(ratio, ratio);
                    }
                }
            }
        };

        updateCanvasWidth();
        window.addEventListener('resize', updateCanvasWidth);

        // Small delay to ensure DOM is ready
        setTimeout(updateCanvasWidth, 100);

        return () => window.removeEventListener('resize', updateCanvasWidth);
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Fetch existing data
                const { data } = await supabase
                    .from('employee_personal_data')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setExistingData(data);

                    // Pre-populate form with existing data
                    form.reset({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        birth_name: data.birth_name || '',
                        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
                        street_address: data.street_address || '',
                        postal_code: data.postal_code || '',
                        city: data.city || '',
                        marital_status: data.marital_status as any || undefined,
                        gender: data.gender as any || undefined,
                        nationality: data.nationality || '',
                        iban: data.iban || '',
                        bic: data.bic || '',
                        start_date: data.start_date ? new Date(data.start_date) : undefined,
                        job_title: data.job_title || '',
                        employment_type: data.employment_type as any || undefined,
                        has_other_employment: data.has_other_employment || false,
                        is_marginal_employment: data.is_marginal_employment || false,
                        highest_school_degree: data.highest_school_degree as any || undefined,
                        highest_professional_qualification: data.highest_professional_qualification as any || undefined,
                        tax_id: data.tax_id || '',
                        tax_class_factor: data.tax_class_factor || '',
                        child_allowances: data.child_allowances || 0,
                        religious_affiliation: data.religious_affiliation || '',
                        health_insurance_company: data.health_insurance_company || '',
                        social_insurance_number: data.social_insurance_number || '',
                    });

                    if (data.signature_data_url) {
                        setSignatureDataUrl(data.signature_data_url);
                    }
                    if (data.signature_date) {
                        setSignatureDate(format(new Date(data.signature_date), 'dd.MM.yyyy'));
                    }
                }
            }
        };

        getUser();
    }, [form]);

    const clearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
            setSignatureDataUrl('');

            // Force proper canvas dimensions after clearing
            setTimeout(() => {
                if (signatureRef.current) {
                    const canvas = signatureRef.current.getCanvas();
                    const ratio = Math.max(window.devicePixelRatio || 1, 1);

                    canvas.width = canvasWidth * ratio;
                    canvas.height = 200 * ratio;
                    canvas.style.width = canvasWidth + 'px';
                    canvas.style.height = '200px';

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.scale(ratio, ratio);
                    }
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

    const onSubmit = async (data: PersonalDataFormData) => {
        setLoading(true);

        try {
            const submitData: any = {
                user_id: user?.id,
                first_name: data.first_name,
                last_name: data.last_name,
                birth_name: data.birth_name || null,
                date_of_birth: data.date_of_birth,
                street_address: data.street_address,
                postal_code: data.postal_code,
                city: data.city,
                marital_status: data.marital_status,
                gender: data.gender,
                nationality: data.nationality,
                iban: data.iban,
                bic: data.bic,
                start_date: data.start_date,
                job_title: data.job_title,
                employment_type: data.employment_type,
                has_other_employment: data.has_other_employment,
                is_marginal_employment: data.is_marginal_employment,
                highest_school_degree: data.highest_school_degree,
                highest_professional_qualification: data.highest_professional_qualification,
                tax_id: data.tax_id || null,
                tax_class_factor: data.tax_class_factor || null,
                child_allowances: data.child_allowances,
                religious_affiliation: data.religious_affiliation || null,
                health_insurance_company: data.health_insurance_company || null,
                social_insurance_number: data.social_insurance_number || null,
                signature_data_url: signatureDataUrl,
                signature_date: signatureDate ? new Date(signatureDate.split('.').reverse().join('-')) : null,
            };

            const { error } = await supabase
                .from('employee_personal_data')
                .upsert(submitData, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            clearStorage();

            toast({
                title: 'Erfolg',
                description: 'Ihre Personaldaten wurden erfolgreich gespeichert.',
            });

            navigate('/');
        } catch (error) {
            console.error('Error saving data:', error);
            toast({
                title: 'Fehler',
                description: 'Beim Speichern der Daten ist ein Fehler aufgetreten.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Validation functions for each step
    const validateStep = (stepIndex: number): boolean => {
        const values = form.getValues();
        const errors = form.formState.errors;

        switch (stepIndex) {
            case 0: // Personal Information
                return !!(values.first_name && values.last_name && values.date_of_birth &&
                        values.street_address && values.postal_code && values.city &&
                        values.marital_status && values.gender && values.nationality) &&
                    !errors.first_name && !errors.last_name && !errors.date_of_birth &&
                    !errors.street_address && !errors.postal_code && !errors.city &&
                    !errors.marital_status && !errors.gender && !errors.nationality;
            case 1: // Banking Information
                return !!(values.iban && values.bic) && !errors.iban && !errors.bic;
            case 2: // Employment Information
                return !!(values.start_date && values.job_title && values.employment_type) &&
                    !errors.start_date && !errors.job_title && !errors.employment_type;
            case 3: // Education (optional fields)
                return true;
            case 4: // Tax Information (optional fields)
                return !errors.tax_id && !errors.child_allowances;
            case 5: // Social Insurance (optional fields)
                return !errors.social_insurance_number;
            case 6: // Signature
                return !!(signatureDataUrl && signatureDate);
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepChange = (step: number) => {
        setCurrentStep(step);
    };

    const handleComplete = () => {
        form.handleSubmit(onSubmit)();
    };

    // Step components
    const PersonalInfoStep = () => (
        <div className="space-y-6">
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
                            <Input placeholder="Deutsch" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );

    const BankingStep = () => (
        <div className="space-y-6">
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
                                    // Format IBAN with spaces
                                    let value = e.target.value.replace(/\s/g, '').toUpperCase();
                                    if (value.startsWith('DE')) {
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
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );

    const EmploymentStep = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Eintrittsdatum *</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    {...field}
                                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                />
                            </FormControl>
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
                                <Input placeholder="DJ/Techniker" {...field} />
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
                                Ich habe noch eine andere Beschäftigung
                            </FormLabel>
                        </div>
                    </FormItem>
                )}
            />

            {form.watch('has_other_employment') && (
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
            )}
        </div>
    );

    const EducationStep = () => (
        <div className="space-y-6">
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
        </div>
    );

    const TaxStep = () => (
        <div className="space-y-6">
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
        </div>
    );

    const SocialInsuranceStep = () => (
        <div className="space-y-6">
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
        </div>
    );

    const SignatureStep = () => (
        <div className="space-y-6" ref={signatureContainerRef}>
            <div className="border border-border rounded-lg p-4 bg-background">
                <div className="w-full">
                    <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                            width: canvasWidth,
                            height: 200,
                            className: 'signature-canvas border border-border rounded bg-white',
                            style: {
                                width: canvasWidth + 'px',
                                height: '200px',
                                display: 'block',
                                touchAction: 'none'
                            }
                        }}
                        backgroundColor="white"
                        onEnd={() => {
                            if (signatureRef.current) {
                                const dataUrl = signatureRef.current.toDataURL();
                                setSignatureDataUrl(dataUrl);
                            }
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={clearSignature} className="flex-1">
                    Unterschrift löschen
                </Button>
                <Button type="button" onClick={saveSignature} className="flex-1">
                    Unterschrift speichern
                </Button>
            </div>

            {signatureDataUrl && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Unterschrift gespeichert</p>
                            <p className="text-sm text-muted-foreground">Datum: {signatureDate}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-sm text-muted-foreground">
                <p>
                    Mit meiner Unterschrift bestätige ich die Richtigkeit und Vollständigkeit der gemachten Angaben.
                    Diese Angaben sind für die Anmeldung beim Finanzamt und bei der Sozialversicherung erforderlich.
                </p>
            </div>
        </div>
    );

    const steps = [
        {
            id: 'personal',
            title: 'Persönliche Angaben',
            description: 'Grundlegende persönliche Informationen',
            component: <PersonalInfoStep />
        },
        {
            id: 'banking',
            title: 'Bankdaten',
            description: 'IBAN und BIC für Gehaltsüberweisung',
            component: <BankingStep />
        },
        {
            id: 'employment',
            title: 'Beschäftigung',
            description: 'Angaben zur Beschäftigung',
            component: <EmploymentStep />
        },
        {
            id: 'education',
            title: 'Bildung',
            description: 'Schul- und Berufsausbildung',
            component: <EducationStep />
        },
        {
            id: 'tax',
            title: 'Steuerangaben',
            description: 'Steuerliche Informationen',
            component: <TaxStep />
        },
        {
            id: 'insurance',
            title: 'Sozialversicherung',
            description: 'Kranken- und Sozialversicherung',
            component: <SocialInsuranceStep />
        },
        {
            id: 'signature',
            title: 'Unterschrift',
            description: 'Bestätigung der Angaben',
            component: <SignatureStep />
        }
    ];

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
                        <form>
                            <PersonalDataStepper
                                steps={steps}
                                currentStep={currentStep}
                                onStepChange={handleStepChange}
                                onNext={handleNext}
                                onPrevious={handlePrevious}
                                onComplete={handleComplete}
                                isNextDisabled={!validateStep(currentStep)}
                                isCompleting={loading}
                            />
                        </form>
                    </Form>
                </div>
            </main>
        </div>
    );
};

export default PersonaldatenStepper;