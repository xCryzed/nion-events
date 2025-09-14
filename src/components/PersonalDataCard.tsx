import React, { useRef, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import { Download, Edit, User, Calendar, MapPin, CreditCard, Building, GraduationCap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const printRef = useRef<HTMLDivElement>(null);

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
      toast({
        title: 'Fehler',
        description: 'Keine Daten für PDF Export verfügbar.',
        variant: 'destructive',
      });
      return;
    }

    setGeneratingPdf(true);
    try {
      // Get computed background color
      const bgCss = getComputedStyle(printRef.current).backgroundColor || 'rgb(255,255,255)';
      const match = bgCss.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      const r = match ? parseInt(match[1], 10) : 20;
      const g = match ? parseInt(match[2], 10) : 20;
      const b = match ? parseInt(match[3], 10) : 24;

      // Kartenbasiertes Rendering (wie vorher), optimiert für Dateigröße
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const cardSpacing = 12;
      let currentY = 20;
      let pageNumber = 1;

      const fillPageBackground = () => {
        pdf.setFillColor(r, g, b);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      };

      const addHeader = (isFirstPage = false) => {
        if (!isFirstPage) {
          pdf.addPage();
        }
        fillPageBackground();
        // Titel ohne Firmenname
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Personaldatenblatt', pageWidth / 2, 20, { align: 'center' });
        pdf.setFontSize(10);
        pdf.setTextColor(200, 200, 200);
        pdf.text(`Seite ${pageNumber}`, pageWidth / 2, 28, { align: 'center' });
        const today = format(new Date(), 'dd.MM.yyyy');
        pdf.text(`Erstellt: ${today}`, pageWidth - margin, 28, { align: 'right' });
        currentY = 40; // Startinhalt unterhalb der Kopfzeile
      };

      addHeader(true);

      const cards = printRef.current.querySelectorAll('.glass-card');
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        try {
          const canvas = await html2canvas(card, {
            scale: 1,
            logging: false,
            useCORS: true,
            backgroundColor: null, // Transparenz beibehalten
            allowTaint: true,
            foreignObjectRendering: true,
            imageTimeout: 5000,
            removeContainer: false,
            onclone: (doc) => {
              try {
                doc.documentElement.className = window.document.documentElement.className;
              } catch {}
            }
          });

          // Auf dunklem Hintergrund zusammenführen und als JPEG komprimieren
          const compCanvas = document.createElement('canvas');
          compCanvas.width = canvas.width;
          compCanvas.height = canvas.height;
          const compCtx = compCanvas.getContext('2d');
          if (!compCtx) continue;
          compCtx.fillStyle = `rgb(${r},${g},${b})`;
          compCtx.fillRect(0, 0, compCanvas.width, compCanvas.height);
          compCtx.drawImage(canvas, 0, 0);

          const imgWidth = pageWidth - (margin * 2);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (currentY + imgHeight > pageHeight - margin) {
            pageNumber++;
            addHeader(false);
          }

          const imgData = compCanvas.toDataURL('image/jpeg', 0.8);
          pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + cardSpacing;
        } catch (error) {
          console.warn(`Failed to render card ${i}:`, error);
          if (currentY + 20 > pageHeight - margin) {
            pageNumber++;
            addHeader(false);
          }
          pdf.setTextColor(139, 69, 255);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          const cardTitle = card.querySelector('h3, .font-semibold')?.textContent || `Bereich ${i + 1}`;
          pdf.text(cardTitle, margin, currentY);
          currentY += 10;
          pdf.setTextColor(200, 200, 200);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text('(Inhalt konnte nicht gerendert werden)', margin, currentY);
          currentY += cardSpacing;
        }
      }

      // Unterschrift anhängen, falls vorhanden
      if (data.signature_data_url) {
        if (currentY + 40 > pageHeight - margin) {
          pageNumber++;
          addHeader(false);
        }
        pdf.setTextColor(139, 69, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Unterschrift', margin, currentY);
        currentY += 10;
        try {
          pdf.addImage(data.signature_data_url, 'PNG', margin, currentY, 80, 25);
          currentY += 30;
        } catch {}
      }

      const fileName = `Personaldaten_${data.first_name}_${data.last_name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Personaldaten</h1>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/50 font-mono text-sm">
            ID: {userId.slice(0, 8)}
          </Badge>
          {data.is_complete && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/30">
              Vollständig
            </Badge>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={generatePDF}
            disabled={generatingPdf}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {generatingPdf ? 'Erstelle PDF...' : 'PDF Download'}
          </Button>
          <Button
            onClick={onEdit}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Bearbeiten
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div ref={printRef} className="bg-background text-white p-8" style={{ backgroundColor: 'hsl(var(--background))', color: 'white' }}>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 pb-8 border-b border-white/20">
            <h1 className="text-4xl font-bold text-primary">Personaldatenblatt</h1>
            <p className="text-sm text-white/80">
              Erstellt am {format(new Date(), 'dd. MMMM yyyy', { locale: de })}
            </p>
          </div>

          {/* Personal Information */}
          <Card className="glass-card bg-white/5 border-white/10 text-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-primary">
                <User className="w-5 h-5 text-primary" />
                Persönliche Angaben
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                     <p className="text-base flex items-center gap-2 text-white">
                      <Calendar className="w-4 h-4 text-white/60" />
                      {(() => { const s = data.date_of_birth as any; const d = typeof s === 'string' ? parseISO(s) : new Date(s); return isValid(d) ? format(d, 'dd.MM.yyyy') : String(s); })()}
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
              
              <Separator className="my-6 bg-white/20" />
              
              <div>
                <p className="text-sm font-medium text-white/60 mb-2">Adresse</p>
                <div className="flex items-start gap-2">
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
              <CardTitle className="flex items-center gap-3 text-xl text-primary">
                <Building className="w-5 h-5 text-primary" />
                Beschäftigungsdaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                       <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">Ja</Badge>
                     </div>
                   )}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-white/60">Eintrittsdatum</p>
                    <p className="text-base flex items-center gap-2 text-white">
                      <Calendar className="w-4 h-4 text-white/60" />
                      {(() => { const s = data.start_date as any; const d = typeof s === 'string' ? parseISO(s) : new Date(s); return isValid(d) ? format(d, 'dd.MM.yyyy') : String(s); })()}
                    </p>
                  </div>
                  {data.is_marginal_employment && (
                    <div>
                      <p className="text-sm font-medium text-white/60">Geringfügige Beschäftigung</p>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">Ja</Badge>
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
                <CardTitle className="flex items-center gap-3 text-xl text-primary">
                  <Building className="w-5 h-5 text-primary" />
                  Weitere Beschäftigungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.other_employment_details.map((employment: any, index: number) => (
                  <div key={index} className="p-4 bg-white/10 rounded-lg space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Banking Information */}
          <Card className="glass-card bg-white/5 border-white/10 text-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-primary">
                <CreditCard className="w-5 h-5 text-primary" />
                Bankverbindung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-white/60 mb-2">IBAN</p>
                  <div className="text-base font-mono bg-white/10 p-3 rounded border-white/20 border break-all text-white">{data.iban}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60 mb-2">BIC</p>
                  <div className="text-base font-mono bg-white/10 p-3 rounded border-white/20 border break-all text-white">{data.bic}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education (if available) */}
          {(data.highest_school_degree || data.highest_professional_qualification) && (
            <Card className="glass-card bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl text-primary">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Bildungsabschlüsse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.highest_school_degree && (
                    <div>
                      <p className="text-sm font-medium text-white/60">Höchster Schulabschluss</p>
                      <p className="text-base text-white">{formatLabel('school_degree', data.highest_school_degree)}</p>
                    </div>
                  )}
                  {data.highest_professional_qualification && (
                    <div>
                      <p className="text-sm font-medium text-white/60">Höchste berufliche Qualifikation</p>
                      <p className="text-base text-white">{formatLabel('professional_qualification', data.highest_professional_qualification)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          {(data.tax_id || data.social_insurance_number || data.health_insurance_company) && (
            <Card className="glass-card bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl text-primary">
                  <FileText className="w-5 h-5 text-primary" />
                  Weitere Angaben
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.tax_id && (
                    <div>
                      <p className="text-sm font-medium text-white/60">Steuer-ID</p>
                      <p className="text-base font-mono text-white">{data.tax_id}</p>
                    </div>
                  )}
                  {data.social_insurance_number && (
                    <div>
                      <p className="text-sm font-medium text-white/60">Sozialversicherungsnummer</p>
                      <p className="text-base font-mono text-white">{data.social_insurance_number}</p>
                    </div>
                  )}
                  {data.health_insurance_company && (
                    <div>
                      <p className="text-sm font-medium text-white/60">Krankenkasse</p>
                      <p className="text-base text-white">{data.health_insurance_company}</p>
                    </div>
                  )}
                   {data.child_allowances !== undefined && data.child_allowances > 0 && (
                     <div>
                       <p className="text-sm font-medium text-white/60">Kinderfreibeträge</p>
                       <p className="text-base text-white">{data.child_allowances}</p>
                     </div>
                   )}
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
              </CardContent>
            </Card>
          )}

          {/* Signature */}
          {data.signature_data_url && (
            <Card className="glass-card bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-primary">Unterschrift</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="border-2 border-dashed border-white/20 p-4 rounded-lg bg-white/10">
                    <img 
                      src={data.signature_data_url} 
                      alt="Unterschrift" 
                      className="max-h-32 mx-auto"
                    />
                  </div>
                  {data.signature_date && (
                    <p className="text-sm text-white/60">
                      Unterschrieben am {(() => { const d = new Date(data.signature_date as any); return isNaN(d.getTime()) ? String(data.signature_date) : d.toLocaleDateString(); })()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};