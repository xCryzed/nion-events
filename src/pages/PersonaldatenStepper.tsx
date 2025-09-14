import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, User, Calendar as CalendarIcon, X, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO, isValid } from "date-fns";
import { de as deLocale, enUS } from "date-fns/locale";
import { supabase } from '@/integrations/supabase/client';
import { useFormPersistence } from '@/hooks/use-form-persistence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { PersonalDataStepper } from '@/components/PersonalDataStepper';
import { cn } from '@/lib/utils';
import SignatureCanvas from 'react-signature-canvas';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

// Validation schemas and constants
const IBAN_REGEX = /^DE\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}$/;
const BIC_REGEX = /^[A-Z]{4}DE[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const TAX_ID_REGEX = /^\d{11}$/;
const SOCIAL_INSURANCE_REGEX = /^[0-9]{2}\s?[0-9]{6}\s?[A-Za-z]\s?[0-9]{3}$/;

const employmentCategories = [
    'Arbeitnehmer/in',
    'Beamtin/Beamter',
    'Schulentlassene/r',
    'ALG-/Sozialhilfe-empfänger/in',
    'Arbeitnehmer/in in Elternzeit',
    'Hausfrau/Hausmann',
    'Selbständige/r',
    'Studienbewerber/in',
    'Arbeitslose/r',
    'Schüler/in',
    'Student/in',
    'Wehr-/Zivildienstleistender',
    'Sonstige'
];

const taxClasses = [
    { value: 'I', label: 'Steuerklasse I' },
    { value: 'II', label: 'Steuerklasse II' },
    { value: 'III', label: 'Steuerklasse III' },
    { value: 'IV', label: 'Steuerklasse IV' },
    { value: 'V', label: 'Steuerklasse V' },
    { value: 'VI', label: 'Steuerklasse VI' }
];

const religions = [
    { value: 'evangelisch', label: 'Evangelisch' },
    { value: 'katholisch', label: 'Katholisch' },
    { value: 'muslimisch', label: 'Muslimisch' },
    { value: 'jüdisch', label: 'Jüdisch' },
    { value: 'orthodox', label: 'Orthodox' },
    { value: 'buddhistisch', label: 'Buddhistisch' },
    { value: 'hinduistisch', label: 'Hinduistisch' },
    { value: 'sonstige', label: 'Sonstige' },
    { value: 'konfessionslos', label: 'Konfessionslos' }
];

const compensationTypes = [
    { value: 'geringfügig entlohnt', label: 'Geringfügig entlohnt' },
    { value: 'nicht geringfügig entlohnt', label: 'Nicht geringfügig entlohnt' },
    { value: 'kurzfristig beschäftigt', label: 'Kurzfristig beschäftigt' }
];

const personalDataSchema = z.object({
    // Personal Information
    first_name: z.string().min(1, 'Vorname ist erforderlich'),
    last_name: z.string().min(1, 'Nachname ist erforderlich'),
    birth_name: z.string().optional(),
    date_of_birth: z.coerce.date({
        errorMap: () => ({ message: "Gültiges Geburtsdatum ist erforderlich" })
    }),
    birth_place: z.string().min(1, "Geburtsort ist erforderlich"),
    birth_country: z.string().min(1, "Geburtsland ist erforderlich"),
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
    start_date: z.coerce.date({
        errorMap: () => ({ message: "Gültiges Eintrittsdatum ist erforderlich" })
    }),
    job_title: z.string().min(1, 'Berufsbezeichnung ist erforderlich'),
    employment_type: z.array(z.string()).min(1, "Mindestens eine Beschäftigungsart auswählen"),
    employment_type_other: z.string().optional(),

    // Education
    highest_school_degree: z.enum(['abitur', 'fachabitur', 'mittlere_reife', 'hauptschule', 'volksschule', 'ohne_schulabschluss']).optional(),
    highest_professional_qualification: z.enum(['promotion', 'diplom', 'magister', 'master', 'staatsexamen', 'bachelor', 'meister', 'techniker', 'fachschule', 'anerkannte_berufsausbildung', 'ohne_berufsausbildung']).optional(),

    // Additional Employment
    has_additional_employment: z.boolean().default(false),
    other_employment_details: z.array(z.object({
        company: z.string().min(1, "Unternehmen ist erforderlich"),
        start_date: z.string().min(1, "Startdatum ist erforderlich"),
        end_date: z.string().optional(),
        hours_per_week: z.union([z.string(), z.number()]).optional(),
        monthly_income: z.union([z.string(), z.number()]).optional(),
    })).default([]),
    has_other_employment: z.boolean().default(false),
    is_marginal_employment: z.boolean().optional(),

    // Tax Information
    tax_id: z.string().regex(TAX_ID_REGEX, 'Steuer-ID besteht aus 11 Ziffern'),
    tax_class_factor: z.string().min(1, "Steuerklasse ist erforderlich"),
    child_allowances: z.number().min(0).default(0),
    religious_affiliation: z.string().min(1, "Konfession ist erforderlich"),

    // Social Insurance
    health_insurance_company: z.string().min(1, 'Krankenkasse ist erforderlich'),
    social_insurance_number: z.string().regex(SOCIAL_INSURANCE_REGEX, 'Ungültige Sozialversicherungsnummer').min(1, 'Sozialversicherungsnummer ist erforderlich'),

    // Declaration checkbox
    employee_declaration: z.boolean().refine(val => val === true, {
        message: "Sie müssen die Erklärung bestätigen"
    }),
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

const schoolDegreeOptions = [
    { value: 'abitur', label: 'Abitur' },
    { value: 'fachabitur', label: 'Fachabitur' },
    { value: 'mittlere_reife', label: 'Mittlere Reife' },
    { value: 'hauptschule', label: 'Hauptschule' },
    { value: 'volksschule', label: 'Volksschule' },
    { value: 'ohne_schulabschluss', label: 'Ohne Schulabschluss' },
];

const professionalQualificationOptions = [
    { value: 'promotion', label: 'Promotion' },
    { value: 'diplom', label: 'Diplom' },
    { value: 'magister', label: 'Magister' },
    { value: 'master', label: 'Master' },
    { value: 'staatsexamen', label: 'Staatsexamen' },
    { value: 'bachelor', label: 'Bachelor' },
    { value: 'meister', label: 'Meister' },
    { value: 'techniker', label: 'Techniker' },
    { value: 'fachschule', label: 'Fachschule' },
    { value: 'anerkannte_berufsausbildung', label: 'Anerkannte Berufsausbildung' },
    { value: 'ohne_berufsausbildung', label: 'Ohne Berufsausbildung' },
];

// Mapping helpers to align UI values with DB check constraints
const normalizeSchoolForDB = (v?: string) => {
  if (!v) return v as any;
  if (v === 'abitur' || v === 'fachabitur') return 'abitur_fachabitur';
  if (v === 'hauptschule' || v === 'volksschule') return 'hauptschule_volksschule';
  return v;
};

const normalizeProfForDB = (v?: string) => {
  if (!v) return v as any;
  if (['diplom', 'magister', 'master', 'staatsexamen'].includes(v)) return 'diplom_magister_master_staatsexamen';
  if (['meister', 'techniker', 'fachschule'].includes(v)) return 'meister_techniker_fachschule';
  return v;
};

const denormalizeSchoolForUI = (v?: string) => {
  switch (v) {
    case 'abitur_fachabitur': return 'abitur';
    case 'hauptschule_volksschule': return 'hauptschule';
    default: return v as any;
  }
};

const denormalizeProfForUI = (v?: string) => {
  switch (v) {
    case 'diplom_magister_master_staatsexamen': return 'master';
    case 'meister_techniker_fachschule': return 'meister';
    default: return v as any;
  }
};

interface PersonaldatenStepperProps {
  onComplete?: () => void;
  onCancel?: () => void;
  hasExistingData?: boolean;
}

const PersonaldatenStepper: React.FC<PersonaldatenStepperProps> = ({ 
  onComplete, 
  onCancel, 
  hasExistingData = false 
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [existingData, setExistingData] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
    const [signatureDate, setSignatureDate] = useState<string>('');
    const [signatureSource, setSignatureSource] = useState<'external' | 'user' | 'idle'>('idle');
    const [canvasWidth, setCanvasWidth] = useState(500);
    const signatureRef = useRef<SignatureCanvas>(null);
    const printRef = useRef<HTMLDivElement>(null);
const signatureContainerRef = useRef<HTMLDivElement>(null);

    // Get browser locale for date formatting
    const browserLocale = useMemo(() => {
        if (typeof navigator !== 'undefined' && navigator.language) {
            return navigator.language;
        }
        return 'en-US';
    }, []);

    // DayPicker locale based on browser locale
    const dayPickerLocale = useMemo(() => {
        return browserLocale.toLowerCase().startsWith('de') ? deLocale : enUS;
    }, [browserLocale]);

    const form = useForm<PersonalDataFormData>({
        resolver: zodResolver(personalDataSchema),
        defaultValues: {
            has_additional_employment: false,
            has_other_employment: false,
            child_allowances: 0,
            employment_type: [],
            other_employment_details: [],
            job_title: 'Aushilfe', // Default value
            employee_declaration: false,
        },
        mode: 'onChange'
    });

    const { clearStorage } = useFormPersistence(form, 'personal-data-form');

    // Watch form values to trigger re-validation
    const watchedValues = form.watch();

    // Coerce persisted string dates (from localStorage/DB) back into Date objects for correct validation and submission
    useEffect(() => {
        const v: any = form.getValues();
        if (typeof v?.date_of_birth === 'string' && v.date_of_birth) {
            form.setValue('date_of_birth', new Date(v.date_of_birth) as any, { shouldValidate: true, shouldDirty: false });
        }
        if (typeof v?.start_date === 'string' && v.start_date) {
            form.setValue('start_date', new Date(v.start_date) as any, { shouldValidate: true, shouldDirty: false });
        }
        const sub = form.watch((values) => {
            const vv: any = values;
            if (typeof vv?.date_of_birth === 'string' && vv.date_of_birth) {
                form.setValue('date_of_birth', new Date(vv.date_of_birth) as any, { shouldValidate: true });
            }
            if (typeof vv?.start_date === 'string' && vv.start_date) {
                form.setValue('start_date', new Date(vv.start_date) as any, { shouldValidate: true });
            }
        });
        return () => sub.unsubscribe();
    }, [form]);

    // Restore cached signature from localStorage if present (before DB loads)
    useEffect(() => {
        const cached = localStorage.getItem('personal-data-signature');
        if (cached) {
            setSignatureDataUrl(cached);
            setSignatureSource('external');
        }
    }, []);

    // Update canvas width to match container
    useEffect(() => {
        const updateCanvasWidth = () => {
            if (!signatureContainerRef.current) return;
            const containerWidth = Math.floor(signatureContainerRef.current.clientWidth);
            const displayHeight = 200;
            setCanvasWidth(containerWidth);

            if (signatureRef.current) {
              const canvas = signatureRef.current.getCanvas();
              canvas.width = containerWidth;
              canvas.height = displayHeight;
              canvas.style.width = `${containerWidth}px`;
              canvas.style.height = `${displayHeight}px`;

              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
              }
            }
        };

        setTimeout(updateCanvasWidth, 50);

        const resizeObserver = new ResizeObserver(updateCanvasWidth);
        if (signatureContainerRef.current) {
            resizeObserver.observe(signatureContainerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Restore signature into canvas when entering the signature step or when external data arrives
    useEffect(() => {
        if (currentStep === 5 && signatureRef.current && signatureDataUrl && signatureSource === 'external') {
            try { 
                signatureRef.current.fromDataURL(signatureDataUrl); 
                setSignatureSource('idle');
            } catch (e) { 
                console.warn('Failed to load signature image', e); 
            }
        }
    }, [currentStep, signatureDataUrl, signatureSource]);

    // Repaint signature after canvas resizes (width change clears canvas)
    useEffect(() => {
        if (currentStep === 5 && signatureRef.current && signatureDataUrl) {
            try { signatureRef.current.fromDataURL(signatureDataUrl); } catch {}
        }
    }, [canvasWidth, currentStep]);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data } = await supabase
                  .from('employee_personal_data')
                  .select('*')
                  .eq('user_id', user.id)
                  .maybeSingle();

                if (data) {
                    setExistingData(data);

                    const currentValues = form.getValues();
                    const hasCurrentData = currentValues.first_name || currentValues.last_name;

                    if (!hasCurrentData) {
                        // Convert employment_type from string to array if needed
                        let employmentTypeArray = [];
                        if (data.employment_type) {
                            if (Array.isArray(data.employment_type)) {
                                employmentTypeArray = data.employment_type;
                            } else {
                                employmentTypeArray = [data.employment_type];
                            }
                        }

                        form.reset({
                            first_name: data.first_name || '',
                            last_name: data.last_name || '',
                            birth_name: data.birth_name || '',
                            date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
                            birth_place: data.birth_place || '',
                            birth_country: data.birth_country || '',
                            street_address: data.street_address || '',
                            postal_code: data.postal_code || '',
                            city: data.city || '',
                            marital_status: data.marital_status as any || undefined,
                            gender: data.gender as any || undefined,
                            nationality: data.nationality || '',
                            iban: data.iban || '',
                            bic: data.bic || '',
                            start_date: data.start_date ? new Date(data.start_date) : undefined,
                            job_title: data.job_title || 'Aushilfe',
                            employment_type: employmentTypeArray,
                            has_additional_employment: data.has_additional_employment || false,
                            other_employment_details: Array.isArray(data.other_employment_details) ? data.other_employment_details as any[] : [],
                            has_other_employment: data.has_other_employment || false,
                            is_marginal_employment: data.is_marginal_employment || false,
                            highest_school_degree: denormalizeSchoolForUI(data.highest_school_degree as any) || undefined,
                            highest_professional_qualification: denormalizeProfForUI(data.highest_professional_qualification as any) || undefined,
                            tax_id: data.tax_id || '',
                            tax_class_factor: data.tax_class_factor || '',
                            child_allowances: data.child_allowances || 0,
                            religious_affiliation: data.religious_affiliation || '',
                            health_insurance_company: data.health_insurance_company || '',
                            social_insurance_number: data.social_insurance_number || '',
                            employee_declaration: data.employee_declaration || false,
                        });
                    }

                    if (data.signature_data_url) {
                        setSignatureDataUrl(data.signature_data_url);
                        setSignatureSource('external');
                    }
                    if (data.signature_date) {
                        setSignatureDate(data.signature_date);
                    }
                }
            }
        };

        getUser();
    }, []);

    const clearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
            setSignatureDataUrl('');
            try { localStorage.removeItem('personal-data-signature'); } catch {}

            setTimeout(() => {
                if (signatureRef.current && signatureContainerRef.current) {
                    const canvas = signatureRef.current.getCanvas();
                    const containerWidth = Math.floor(signatureContainerRef.current.clientWidth);
                    const displayHeight = 200;

                    canvas.width = containerWidth;
                    canvas.height = displayHeight;
                    canvas.style.width = `${containerWidth}px`;
                    canvas.style.height = `${displayHeight}px`;

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                    }
                }
            }, 0);
        }
    };

    const saveSignature = () => {
        if (!signatureRef.current) return;
        const dataUrl = signatureRef.current.toDataURL();
        setSignatureDataUrl(dataUrl);
        try { localStorage.setItem('personal-data-signature', dataUrl); } catch {}
        setSignatureDate(new Date().toISOString());
        setSignatureSource('user');
        toast({
            title: 'Erfolg',
            description: 'Unterschrift gespeichert.',
        });
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
                birth_place: data.birth_place,
                birth_country: data.birth_country,
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
                has_additional_employment: data.has_additional_employment,
                other_employment_details: data.other_employment_details,
                has_other_employment: data.has_other_employment,
                is_marginal_employment: data.is_marginal_employment,
                highest_school_degree: normalizeSchoolForDB(data.highest_school_degree as any),
                highest_professional_qualification: normalizeProfForDB(data.highest_professional_qualification as any),
                tax_id: data.tax_id,
                tax_class_factor: data.tax_class_factor,
                child_allowances: data.child_allowances,
                religious_affiliation: data.religious_affiliation,
                health_insurance_company: data.health_insurance_company || null,
                social_insurance_number: data.social_insurance_number || null,
                signature_data_url: signatureDataUrl,
                signature_date: signatureDate ? new Date().toISOString() : null,
                employee_declaration: data.employee_declaration === true,
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

            if (onComplete) {
                onComplete();
            } else {
                navigate('/personaldaten');
            }
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

    // Validation function for each step
    const validateStep = useCallback((stepIndex: number): boolean => {
        const values = form.getValues();
        const errors = form.formState.errors;

        switch (stepIndex) {
            case 0: // Personal Information
                return !!(values.first_name && values.last_name && values.date_of_birth &&
                    values.birth_place && values.birth_country &&
                    values.street_address && values.postal_code && values.city &&
                    values.marital_status && values.gender && values.nationality) &&
                  !errors.first_name && !errors.last_name && !errors.date_of_birth &&
                  !errors.birth_place && !errors.birth_country &&
                  !errors.street_address && !errors.postal_code && !errors.city &&
                  !errors.marital_status && !errors.gender && !errors.nationality;
            case 1: // Banking Information
                return !!(values.iban && values.bic) && !errors.iban && !errors.bic;
            case 2: // Education (optional fields)
                return true;
            case 3: // Employment Information (+ optional additional employment)
                {
                  const baseOk = !!(values.start_date && values.job_title && Array.isArray(values.employment_type) && values.employment_type.length > 0) &&
                    !errors.start_date && !errors.job_title && !errors.employment_type;
                  if (!baseOk) return false;
                  
                  // Check if there are incomplete additional employments (partially filled forms that weren't submitted)
                  // We can't directly access the AdditionalEmploymentManager's internal state,
                  // so we assume if has_additional_employment is true, the employments array should have entries
                  if (values.has_additional_employment && values.other_employment_details.length === 0) {
                    // User indicated they have additional employment but haven't added any - this might be incomplete
                    // However, we'll allow it for now as additional employment is optional
                  }
                  
                  return true;
                }
            case 4: // Tax Information
                return !!(values.tax_id && values.tax_class_factor && values.religious_affiliation) &&
                  !errors.tax_id && !errors.tax_class_factor && !errors.religious_affiliation && !errors.child_allowances && !errors.social_insurance_number;
            case 5: // Signature
                return !!signatureDataUrl;
            default:
                return true;
        }
    }, [signatureDataUrl, signatureDate]);

    const handleNext = useCallback(() => {
        setCurrentStep((prev) => Math.min(prev + 1, 5));
    }, []);

    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleStepChange = useCallback((step: number) => {
        setCurrentStep(step);
    }, []);

    const handleComplete = () => {
        form.handleSubmit(onSubmit, () => {
            toast({
                title: 'Bitte prüfen',
                description: 'Bitte alle Pflichtfelder ausfüllen und Fehler korrigieren.',
                variant: 'destructive',
            });
        })();
    };

    // Component for managing additional employment details
    const AdditionalEmploymentManager = ({ field }: any) => {
        const [employments, setEmployments] = useState(field.value || []);
        const [currentEmployment, setCurrentEmployment] = useState({
            company: '',
            start_date: '',
            end_date: '',
            hours_per_week: '',
            monthly_income: ''
        });
        const [startDate, setStartDate] = useState<Date>();
        const [endDate, setEndDate] = useState<Date>();
        const [showAddForm, setShowAddForm] = useState(false);

        useEffect(() => {
            field.onChange(employments);
        }, [employments, field]);

        const addEmployment = () => {
            if (currentEmployment.company && currentEmployment.start_date) {
                setEmployments([...employments, currentEmployment]);
                setCurrentEmployment({
                    company: '',
                    start_date: '',
                    end_date: '',
                    hours_per_week: '',
                    monthly_income: ''
                });
                setStartDate(undefined);
                setEndDate(undefined);
                setShowAddForm(false);
            }
        };

        const removeEmployment = (index: number) => {
            setEmployments(employments.filter((_: any, i: number) => i !== index));
        };

        const isCurrentEmploymentValid = currentEmployment.company && currentEmployment.start_date;

        return (
            <div className="space-y-6">
                {/* Current employments list */}
                {employments.length > 0 && (
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Eingetragene Beschäftigungen:</Label>
                        {employments.map((employment: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="flex-1">
                                    <p className="font-medium">{employment.company}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {(() => {
                                            const s = employment.start_date;
                                            if (!s) return '-';
                                            const d = typeof s === 'string' ? parseISO(s) : new Date(s);
                                            return isValid(d) ? format(d, 'dd.MM.yyyy') : String(s);
                                        })()} - {employment.end_date ? (() => {
                                            const e = employment.end_date;
                                            const d2 = typeof e === 'string' ? parseISO(e) : new Date(e);
                                            return isValid(d2) ? format(d2, 'dd.MM.yyyy') : String(e);
                                        })() : 'Aktuell'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {employment.hours_per_week} Std/Woche, {employment.monthly_income}€/Monat
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeEmployment(index)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Button to show add form */}
                {!showAddForm && (
                    <div className="text-center">
                        <Button
                            type="button"
                            onClick={() => setShowAddForm(true)}
                            variant="outline"
                            className="w-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Weitere Beschäftigung hinzufügen
                        </Button>
                    </div>
                )}

                {/* Add new employment form */}
                {showAddForm && (
                    <div className="space-y-6 p-6 border rounded-lg bg-card">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Neue Beschäftigung hinzufügen:</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setCurrentEmployment({
                                        company: '',
                                        start_date: '',
                                        end_date: '',
                                        hours_per_week: '',
                                        monthly_income: ''
                                    });
                                    setStartDate(undefined);
                                    setEndDate(undefined);
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="company">Unternehmen *</Label>
                                <Input
                                    id="company"
                                    value={currentEmployment.company}
                                    onChange={(e) => setCurrentEmployment({
                                        ...currentEmployment,
                                        company: e.target.value
                                    })}
                                    placeholder="Firmenname"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="hours_per_week">Stunden pro Woche</Label>
                                <Input
                                    id="hours_per_week"
                                    type="number"
                                    value={currentEmployment.hours_per_week}
                                    onChange={(e) => setCurrentEmployment({
                                        ...currentEmployment,
                                        hours_per_week: e.target.value
                                    })}
                                    placeholder="z.B. 20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Startdatum *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "dd.MM.yyyy") : "Datum wählen"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={(date) => {
                                                setStartDate(date);
                                                setCurrentEmployment({
                                                    ...currentEmployment,
                                                    start_date: date ? format(date, 'yyyy-MM-dd') : ''
                                                });
                                            }}
                                            locale={dayPickerLocale}
                                            initialFocus
                                            className={cn("p-3 pointer-events-auto")}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Enddatum (optional)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "dd.MM.yyyy") : "Datum wählen"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={(date) => {
                                                setEndDate(date);
                                                setCurrentEmployment({
                                                    ...currentEmployment,
                                                    end_date: date ? format(date, 'yyyy-MM-dd') : ''
                                                });
                                            }}
                                            locale={dayPickerLocale}
                                            initialFocus
                                            className={cn("p-3 pointer-events-auto")}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="monthly_income">Monatseinkommen (€)</Label>
                            <Input
                                id="monthly_income"
                                type="number"
                                value={currentEmployment.monthly_income}
                                onChange={(e) => setCurrentEmployment({
                                    ...currentEmployment,
                                    monthly_income: e.target.value
                                })}
                                placeholder="z.B. 450"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={addEmployment}
                                disabled={!isCurrentEmploymentValid}
                                className="flex-1"
                            >
                                Beschäftigung hinzufügen
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddForm(false)}
                            >
                                Abbrechen
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Memoized step components
    const PersonalInfoStep = useMemo(() => (
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
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                             )}
                                         >
                                             {field.value ? (
                                                 format(field.value, "dd.MM.yyyy", { locale: dayPickerLocale })
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
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        locale={dayPickerLocale}
                                        initialFocus
                                        className="pointer-events-auto"
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="birth_place"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Geburtsort *</FormLabel>
                            <FormControl>
                                <Input placeholder="Musterstadt" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="birth_country"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Geburtsland *</FormLabel>
                            <FormControl>
                                <Input placeholder="Deutschland" {...field} />
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
    ), [form.control]);

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

    const EmploymentStep = () => {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                             >
                                                 {field.value ? (
                                                     format(field.value, "dd.MM.yyyy", { locale: dayPickerLocale })
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
                                            disabled={(date) => date < new Date("1900-01-01")}
                                            locale={dayPickerLocale}
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
                                    <Input placeholder="Aushilfe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="employment_type"
                    render={({ field }) => {
                        const selected: string[] = Array.isArray(field.value) ? field.value : [];
                        const toggle = (type: string, checked: boolean) => {
                            const set = new Set(selected);
                            if (checked) set.add(type); else set.delete(type);
                            field.onChange(Array.from(set));
                        };
                        const remove = (type: string) => field.onChange(selected.filter((t) => t !== type));

                        return (
                            <FormItem>
                                <FormLabel>Status bei Beginn der Beschäftigung *</FormLabel>
                                <FormControl>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {employmentCategories.map((category) => (
                                                <div key={category} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`emp-${category}`}
                                                        checked={selected.includes(category)}
                                                        onCheckedChange={(val) => toggle(category, Boolean(val))}
                                                    />
                                                    <Label htmlFor={`emp-${category}`} className="text-sm cursor-pointer">
                                                        {category}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>

                                        {selected.includes('Sonstige') && (
                                            <div className="mt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="employment_type_other"
                                                    render={({ field: otherField }) => (
                                                        <FormItem>
                                                            <FormLabel>Sonstige - Bitte angeben:</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Bitte spezifizieren..." {...otherField} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = (e.currentTarget as HTMLInputElement).value.trim(); if (!val) return; const current: string[] = Array.isArray(form.getValues('employment_type')) ? form.getValues('employment_type') : []; const base = current.filter((t) => !String(t).startsWith('Sonstige:')); if (!base.includes('Sonstige')) base.push('Sonstige'); base.push(`Sonstige: ${val}`); form.setValue('employment_type', base, { shouldValidate: true, shouldDirty: true }); otherField.onChange(''); } }} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {selected.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Ausgewählte Status:</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selected.map((type) => (
                                                        <Badge key={type} variant="secondary" className="flex items-center gap-1">
                                                            {type}
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(type)}
                                                                className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <FormField
                    control={form.control}
                    name="has_additional_employment"
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
                                    Ich übe weitere Beschäftigungen aus
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                {form.watch('has_additional_employment') && (
                    <FormField
                        control={form.control}
                        name="other_employment_details"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Weitere Beschäftigungen</FormLabel>
                                <FormControl>
                                    <AdditionalEmploymentManager field={field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}
            </div>
        );
    };

    const EmploymentStatusStep = () => (
        <div className="space-y-6">
            <FormField
                control={form.control}
                name="has_additional_employment"
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
                                Ich übe weitere Beschäftigungen aus
                            </FormLabel>
                        </div>
                    </FormItem>
                )}
            />

            {form.watch('has_additional_employment') && (
                <FormField
                    control={form.control}
                    name="other_employment_details"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weitere Beschäftigungen</FormLabel>
                            <FormControl>
                                <AdditionalEmploymentManager field={field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            )}
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
                        <div className="flex items-center gap-2 mb-2">
                            <FormLabel>Steuer-ID *</FormLabel>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>Die 11-stellige Steuer-ID finden Sie in folgenden Dokumenten: BZSt-Brief, Lohnsteuerbescheinigung, Einkommensteuerbescheid oder in Ihrem ELSTER-Konto.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <FormControl>
                            <Input
                                placeholder="11-stellige Steuer-ID"
                                inputMode="numeric"
                                maxLength={11}
                                {...field}
                                onChange={(e) => {
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
                            <FormLabel>Steuerklasse *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Steuerklasse wählen" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {taxClasses.map((taxClass) => (
                                        <SelectItem key={taxClass.value} value={taxClass.value}>
                                            {taxClass.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            <div className="flex items-center gap-2 mb-2">
                                <FormLabel>Kinderfreibeträge</FormLabel>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p>Pro Elternteil 0,5 Freibeträge. Zusammenlebende Eltern: 1,0 pro Kind. Getrennte Eltern: je 0,5 oder übertragbar (1,0/0,0).</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                            <FormLabel>Konfession *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Konfession wählen" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {religions.map((religion) => (
                                        <SelectItem key={religion.value} value={religion.value}>
                                            {religion.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="health_insurance_company"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Krankenkasse *</FormLabel>
                            <FormControl>
                                <Input placeholder="AOK, Barmer, etc." {...field} />
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
                        <div className="flex items-center gap-2 mb-2">
                            <FormLabel>Sozialversicherungsnummer *</FormLabel>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>Ihre Sozialversicherungsnummer finden Sie im Sozialversicherungsausweis, DRV-Schreiben, Krankenkassen-Dokumenten oder auf der Lohnabrechnung.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <FormControl>
                            <Input
                                placeholder="12 345678 A 123"
                                {...field}
                                onChange={(e) => {
                                    let raw = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
                                    // Insert spaces at 2 and 10 (after considering the first inserted space)
                                    let value = raw;
                                    if (value.length > 2) value = value.slice(0, 2) + ' ' + value.slice(2);
                                    if (value.length > 10) value = value.slice(0, 10) + ' ' + value.slice(10);
                                    field.onChange(value);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        </div>
    );

    const SignatureStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Elektronische Unterschrift</h3>
                <p className="text-muted-foreground mb-6">
                    Bitte unterschreiben Sie im unten stehenden Feld zur Bestätigung Ihrer Angaben.
                </p>
            </div>

            <FormField
                control={form.control}
                name="employee_declaration"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                                Erklärung des Arbeitnehmers *
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                                Ich versichere, dass die vorstehenden Angaben der Wahrheit entsprechen. Ich verpflichte mich, meinem Arbeitgeber alle Änderungen, insbesondere in Bezug auf weitere Beschäftigungen (in Bezug auf Art, Dauer und Entgelt) unverzüglich mitzuteilen.
                            </p>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <div ref={signatureContainerRef} className="w-full">
                    <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                            className: 'signature-canvas border border-border rounded',
                            style: { width: '100%', height: '200px' }
                        }}
                        backgroundColor="rgb(255, 255, 255)"
                        penColor="rgb(0, 0, 0)"
                    />
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <Button type="button" variant="outline" onClick={clearSignature}>
                    Löschen
                </Button>
                <Button type="button" onClick={saveSignature}>
                    Unterschrift speichern
                </Button>
            </div>

            {signatureDataUrl && (
                <div className="text-center text-sm text-muted-foreground">
                    ✓ Unterschrift wurde gespeichert
                </div>
            )}
        </div>
    );

    

    const steps = useMemo(() => ([
        {
            id: 'personal',
            title: 'Persönliche Angaben',
            description: 'Grundlegende persönliche Informationen',
            component: PersonalInfoStep,
        },
        {
            id: 'banking',
            title: 'Bankverbindung',
            description: 'IBAN und BIC für die Lohnabrechnung',
            component: BankingStep,
        },
        {
            id: 'education',
            title: 'Bildung & Qualifikationen',
            description: 'Schulische und berufliche Qualifikationen',
            component: EducationStep,
        },
        {
            id: 'employment',
            title: 'Beschäftigung',
            description: 'Arbeitsbeziehung und Tätigkeitsdetails',
            component: EmploymentStep,
        },
        {
            id: 'tax-social',
            title: 'Steuer- & Sozialangaben',
            description: 'Steuerliche und sozialversicherungsrechtliche Angaben',
            component: TaxStep,
        },
        {
            id: 'signature',
            title: 'Unterschrift',
            description: 'Elektronische Unterschrift zur Bestätigung der Angaben',
            component: SignatureStep,
        },
    ]), [form]);

    return (
        <TooltipProvider delayDuration={100}>
            <Form {...form}>
                <div className="min-h-screen bg-background">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex items-center gap-4 mb-8">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCancel ? onCancel() : navigate('/personaldaten')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Zurück
                            </Button>
                            <div className="flex items-center gap-2">
                                <User className="w-6 h-6 text-primary" />
                                <h1 className="text-2xl font-bold">
                                    {hasExistingData ? 'Personaldaten bearbeiten' : 'Personaldaten erfassen'}
                                </h1>
                            </div>
                        </div>

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
                    </div>
                </div>
            </Form>
        </TooltipProvider>
    );
};

export default PersonaldatenStepper;