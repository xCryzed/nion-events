import React, { useRef, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import { Download, Edit, User, Calendar, MapPin, CreditCard, Building, GraduationCap, FileText, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { generatePersonalDataPDF, generatePersonalDataPDFFileName } from '@/utils/pdfGenerator';

interface PersonalData {
  user_id?: string;
  first_name: string;
  last_name: string;
  birth_name?: string;
  birth_place?: string;
  birth_country?: string;
  date_of_birth: string;
  street_address: string;
  postal_code: string;
  city: string;
  marital_status: string;
  gender: string;
  nationality: string;
  iban: string;
  bic: string;
  start_date: string;
  job_title: string;
  employment_type: string | string[];
  employment_type_other?: string;
  has_other_employment?: boolean;
  has_additional_employment?: boolean;
  other_employment_details?: any[];
  is_marginal_employment?: boolean;
  highest_school_degree?: string;
  highest_professional_qualification?: string;
  tax_id?: string;
  tax_class_factor?: string;
  child_allowances?: number;
  religious_affiliation?: string;
  health_insurance_company?: string;
  social_insurance_number?: string;
  signature_data_url?: string;
  signature_date?: string;
  is_complete?: boolean;
}

interface PersonalDataCardProps {
  data: PersonalData;
  onEdit: () => void;
}

export const PersonalDataCard: React.FC<PersonalDataCardProps> = ({ data, onEdit }) => {
  const userId = data.user_id || 'Unknown';
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [copiedPersonnelNumber, setCopiedPersonnelNumber] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const personnelNumber = data.user_id?.slice(0, 8).toUpperCase() || 'N/A';

  const copyPersonnelNumber = async () => {
    try {
      await navigator.clipboard.writeText(personnelNumber);
      setCopiedPersonnelNumber(true);
      toast({ title: 'Kopiert', description: 'Personalnummer wurde in die Zwischenablage kopiert.' });
      setTimeout(() => setCopiedPersonnelNumber(false), 2000);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Konnte nicht in die Zwischenablage kopieren.', variant: 'destructive' });
    }
  };

  const formatLabel = (key: string, value: string) => {
    const labelMap: Record<string, string> = {
      'ledig': 'Ledig',
      'verheiratet': 'Verheiratet',
      'geschieden': 'Geschieden',
      'verwitwet': 'Verwitwet',
      'eingetragene_lebenspartnerschaft': 'Eingetragene Lebenspartnerschaft',
      'männlich': 'Männlich',
      'weiblich': 'Weiblich',
      'divers': 'Divers',
      'unbestimmt': 'Unbestimmt',
      'hauptbeschäftigung': 'Hauptbeschäftigung',
      'nebenbeschäftigung': 'Nebenbeschäftigung',
      'abitur_fachabitur': 'Abitur/Fachabitur',
      'mittlere_reife': 'Mittlere Reife',
      'hauptschule_volksschule': 'Hauptschule/Volksschule',
      'ohne_schulabschluss': 'Ohne Schulabschluss',
      'promotion': 'Promotion',
      'diplom_magister_master_staatsexamen': 'Diplom/Magister/Master/Staatsexamen',
      'bachelor': 'Bachelor',
      'meister_techniker_fachschule': 'Meister/Techniker/Fachschule',
      'anerkannte_berufsausbildung': 'Anerkannte Berufsausbildung',
      'ohne_berufsausbildung': 'Ohne Berufsausbildung',
    };
    return labelMap[value] || value;
  };

  const generatePDF = async () => {
    if (!printRef.current) {
      toast({ title: 'Fehler', description: 'Keine Daten für PDF Export verfügbar.', variant: 'destructive' });
      return;
    }

    setGeneratingPdf(true);
    try {
      const pdf = generatePersonalDataPDF(data);
      const fileName = generatePersonalDataPDFFileName(data);
      pdf.save(fileName);

      toast({ title: 'Erfolg', description: 'PDF wurde erfolgreich heruntergeladen.' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: 'Fehler', description: 'Beim Erstellen des PDFs ist ein Fehler aufgetreten.', variant: 'destructive' });
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Personaldaten</h1>
            {data.is_complete && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/30">
                Vollständig
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 ml-auto">
            {/* Creation Date Badge */}
            <Badge variant="outline" className="w-fit">
              <Calendar className="w-3 h-3 mr-2" />
              Erstellt: {format(new Date(), 'dd.MM.yyyy')}
            </Badge>
            
            {/* Personnel Number Badge */}
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-muted/50 transition-colors w-fit select-none"
              onClick={copyPersonnelNumber}
            >
              <span className="text-xs font-mono mr-2">PN: {personnelNumber}</span>
              {copiedPersonnelNumber ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Badge>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <Button
            variant="outline"
            onClick={generatePDF}
            disabled={generatingPdf}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            {generatingPdf ? 'Erstelle PDF...' : 'PDF Download'}
          </Button>
          
          <Button
            onClick={onEdit}
            variant="secondary"
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Edit className="w-4 h-4" />
            Bearbeiten
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-6">
        {/* Personal Information */}
        <Card className="glass-card bg-white/5 border-white/10 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-lg sm:text-xl text-primary">
              <User className="w-5 h-5 text-primary flex-shrink-0" />
              Persönliche Angaben
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-white/60">Vorname</p>
                  <p className="text-base font-semibold text-white">{data.first_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Nachname</p>
                  <p className="text-base font-semibold text-white">{data.last_name}</p>
                </div>
                 {data.birth_name && (
                    <div>
                      <p className="text-sm font-medium text-white/60">Geburtsname</p>
                      <p className="text-base text-white">{data.birth_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white/60">Geburtsdatum</p>
                    <p className="text-base flex flex-col sm:flex-row sm:items-center gap-2 text-white">
                     <Calendar className="w-4 h-4 text-white/60 flex-shrink-0" />
                     <span>{(() => { const s = data.date_of_birth as any; const d = typeof s === 'string' ? parseISO(s) : new Date(s); return isValid(d) ? format(d, 'dd.MM.yyyy') : String(s); })()}</span>
                    </p>
                  </div>
                  {(data.birth_place || data.birth_country) && (
                    <div>
                      <p className="text-sm font-medium text-white/60">Geburtsort</p>
                      <p className="text-base text-white">
                        {[data.birth_place, data.birth_country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
               </div>
               <div className="space-y-3">
                 <div>
                   <p className="text-sm font-medium text-white/60">Geschlecht</p>
                   <p className="text-base text-white">{formatLabel('gender', data.gender)}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-white/60">Familienstand</p>
                   <p className="text-base text-white">{formatLabel('marital_status', data.marital_status)}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-white/60">Staatsangehörigkeit</p>
                   <p className="text-base text-white">{data.nationality}</p>
                 </div>
               </div>
             </div>
             
             <div>
               <p className="text-sm font-medium text-white/60 mb-2">Adresse</p>
               <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                 <MapPin className="w-4 h-4 text-white/60 mt-1 flex-shrink-0" />
                 <div className="space-y-1">
                   <p className="text-base text-white">{data.street_address}</p>
                   <p className="text-base text-white">{data.postal_code} {data.city}</p>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>

         {/* Employment Information */}
         <Card className="glass-card bg-white/5 border-white/10 text-white">
           <CardHeader className="pb-4">
             <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-lg sm:text-xl text-primary">
               <Building className="w-5 h-5 text-primary flex-shrink-0" />
               Beschäftigungsdaten
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="space-y-3">
                 <div>
                   <p className="text-sm font-medium text-white/60">Berufsbezeichnung</p>
                   <p className="text-base font-semibold text-white">{data.job_title}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-white/60">Art der Beschäftigung</p>
                   <p className="text-base text-white">
                     {Array.isArray(data.employment_type) 
                       ? data.employment_type.join(', ') 
                       : formatLabel('employment_type', data.employment_type)}
                   </p>
                 </div>
                 {data.employment_type_other && (
                   <div>
                     <p className="text-sm font-medium text-white/60">Sonstige Angabe</p>
                     <p className="text-base text-white">{data.employment_type_other}</p>
                   </div>
                 )}
                  {(data.has_other_employment || data.has_additional_employment) && (
                    <div>
                      <p className="text-sm font-medium text-white/60">Weitere Beschäftigung</p>
                      <p className="text-base text-white">Ja</p>
                    </div>
                  )}
               </div>
               <div className="space-y-3">
                 <div>
                   <p className="text-sm font-medium text-white/60">Eintrittsdatum</p>
                   <p className="text-base flex flex-col sm:flex-row sm:items-center gap-2 text-white">
                     <Calendar className="w-4 h-4 text-white/60 flex-shrink-0" />
                     <span>{(() => { const s = data.start_date as any; const d = typeof s === 'string' ? parseISO(s) : new Date(s); return isValid(d) ? format(d, 'dd.MM.yyyy') : String(s); })()}</span>
                   </p>
                 </div>
                  {data.is_marginal_employment && (
                    <div>
                      <p className="text-sm font-medium text-white/60">Geringfügige Beschäftigung</p>
                      <p className="text-base text-white">Ja</p>
                    </div>
                  )}
               </div>
             </div>
           </CardContent>
         </Card>

         {/* Additional Employment Details */}
         {data.has_additional_employment && data.other_employment_details && data.other_employment_details.length > 0 && (
           <Card className="glass-card bg-white/5 border-white/10 text-white">
             <CardHeader className="pb-4">
               <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-lg sm:text-xl text-primary">
                 <Building className="w-5 h-5 text-primary flex-shrink-0" />
                 Weitere Beschäftigungen
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {data.other_employment_details.map((employment: any, index: number) => (
                 <div key={index} className="p-4 bg-white/10 rounded-lg space-y-3">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     <div>
                       <p className="text-sm font-medium text-white/60">Unternehmen</p>
                       <p className="text-base font-semibold text-white">{employment.company}</p>
                     </div>
                     <div>
                       <p className="text-sm font-medium text-white/60">Zeitraum</p>
                       <p className="text-base text-white">
                         {(() => { const s = employment.start_date; const d = typeof s === 'string' ? parseISO(s) : new Date(s); return isValid(d) ? format(d, 'dd.MM.yyyy') : String(s); })()} - {employment.end_date ? (() => { const e = employment.end_date; const d2 = typeof e === 'string' ? parseISO(e) : new Date(e); return isValid(d2) ? format(d2, 'dd.MM.yyyy') : String(e); })() : 'Aktuell'}
                       </p>
                     </div>
                     <div>
                       <p className="text-sm font-medium text-white/60">Stunden/Woche</p>
                       <p className="text-base text-white">{employment.hours_per_week}</p>
                     </div>
                     <div>
                       <p className="text-sm font-medium text-white/60">Monatseinkommen</p>
                       <p className="text-base text-white">{employment.monthly_income}€</p>
                     </div>
                   </div>
                 </div>
               ))}
             </CardContent>
           </Card>
         )}

         {/* Bank Details */}
         <Card className="glass-card bg-white/5 border-white/10 text-white">
           <CardHeader className="pb-4">
             <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-lg sm:text-xl text-primary">
               <CreditCard className="w-5 h-5 text-primary flex-shrink-0" />
               Bankverbindung
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="space-y-3">
                 <div>
                   <p className="text-sm font-medium text-white/60">IBAN</p>
                   <p className="text-base font-mono text-white">{data.iban}</p>
                 </div>
               </div>
               <div className="space-y-3">
                 <div>
                   <p className="text-sm font-medium text-white/60">BIC</p>
                   <p className="text-base font-mono text-white">{data.bic}</p>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>

         {/* Education */}
         {(data.highest_school_degree || data.highest_professional_qualification) && (
           <Card className="glass-card bg-white/5 border-white/10 text-white">
             <CardHeader className="pb-4">
               <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-lg sm:text-xl text-primary">
                 <GraduationCap className="w-5 h-5 text-primary flex-shrink-0" />
                 Bildungsabschlüsse
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="space-y-3">
                   {data.highest_school_degree && (
                     <div>
                       <p className="text-sm font-medium text-white/60">Höchster Schulabschluss</p>
                       <p className="text-base text-white">{formatLabel('school_degree', data.highest_school_degree)}</p>
                     </div>
                   )}
                 </div>
                 <div className="space-y-3">
                   {data.highest_professional_qualification && (
                     <div>
                       <p className="text-sm font-medium text-white/60">Höchste berufliche Qualifikation</p>
                       <p className="text-base text-white">{formatLabel('professional_qualification', data.highest_professional_qualification)}</p>
                     </div>
                   )}
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Tax Information */}
         {(data.tax_id || data.tax_class_factor || data.child_allowances || data.religious_affiliation) && (
           <Card className="glass-card bg-white/5 border-white/10 text-white">
             <CardHeader className="pb-4">
               <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-lg sm:text-xl text-primary">
                 <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                 Steuerliche Angaben
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="space-y-3">
                   {data.tax_id && (
                     <div>
                       <p className="text-sm font-medium text-white/60">Steuer-ID</p>
                       <p className="text-base font-mono text-white">{data.tax_id}</p>
                     </div>
                   )}
                   {data.child_allowances && (
                     <div>
                       <p className="text-sm font-medium text-white/60">Kinderfreibeträge</p>
                       <p className="text-base text-white">{data.child_allowances}</p>
                     </div>
                   )}
                 </div>
                 <div className="space-y-3">
                   {data.tax_class_factor && (
                     <div>
                       <p className="text-sm font-medium text-white/60">Steuerklasse</p>
                       <p className="text-base text-white">{data.tax_class_factor}</p>
                     </div>
                   )}
                   {data.religious_affiliation && (
                     <div>
                       <p className="text-sm font-medium text-white/60">Konfession</p>
                       <p className="text-base text-white">{data.religious_affiliation}</p>
                     </div>
                   )}
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Social Insurance */}
         {(data.social_insurance_number || data.health_insurance_company) && (
           <Card className="glass-card bg-white/5 border-white/10 text-white">
             <CardHeader className="pb-4">
               <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-lg sm:text-xl text-primary">
                 <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                 Sozialversicherung
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="space-y-3">
                   {data.social_insurance_number && (
                     <div>
                       <p className="text-sm font-medium text-white/60">Sozialversicherungsnummer</p>
                       <p className="text-base font-mono text-white">{data.social_insurance_number}</p>
                     </div>
                   )}
                 </div>
                 <div className="space-y-3">
                   {data.health_insurance_company && (
                     <div>
                       <p className="text-sm font-medium text-white/60">Krankenkasse</p>
                       <p className="text-base text-white">{data.health_insurance_company}</p>
                     </div>
                   )}
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Signature */}
         {data.signature_data_url && (
           <Card className="glass-card bg-white/5 border-white/10 text-white">
             <CardHeader className="pb-4">
               <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-lg sm:text-xl text-primary">
                 <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                 Unterschrift
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="bg-white rounded-lg p-4 max-w-sm">
                 <img src={data.signature_data_url} alt="Unterschrift" className="max-w-full h-auto" />
               </div>
               {data.signature_date && (
                 <p className="text-sm text-white/60">
                   Unterschrieben am: {format(new Date(data.signature_date), 'dd.MM.yyyy', { locale: de })}
                 </p>
               )}
             </CardContent>
           </Card>
         )}
       </div>

       {/* Hidden PDF Reference */}
       <div ref={printRef} className="hidden">
         {/* This is used for PDF generation but not displayed */}
       </div>
    </div>
  );
};