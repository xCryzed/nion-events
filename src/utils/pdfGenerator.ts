import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import jsPDF from 'jspdf';
import logoUrl from '@/assets/nion-logo-white.svg';

interface PersonalDataForPDF {
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

export const generatePersonalDataPDF = (data: PersonalDataForPDF): jsPDF => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const labelColor: [number, number, number] = [200, 200, 200];
  const textColor: [number, number, number] = [255, 255, 255];
  const bgColor: [number, number, number] = [20, 20, 24];

  // Preload NION logo
  const logoImage = new Image();
  logoImage.src = logoUrl as unknown as string;

  let y = 20;
  let page = 1;

  const fillBackground = () => {
    pdf.setFillColor(...bgColor);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  const newPage = (withHeader = true) => {
    if (page > 1) pdf.addPage();
    fillBackground();
    if (withHeader) {
      // Try to render logo
      try {
        if (logoImage && logoImage.complete) {
          const logoSize = 16; // mm
          pdf.addImage(logoImage as any, 'PNG', margin, 12, logoSize, logoSize);
          // "events" label next to logo in purple
          pdf.setTextColor(139, 69, 255);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.text('events', margin + logoSize + 4, 22);
        }
      } catch {}

      // Title centered
      // Title centered
      pdf.setTextColor(...textColor);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Personaldaten', pageWidth / 2, 20, { align: 'center' });

      // Sub header
      pdf.setFontSize(10);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`Seite ${page}`, pageWidth / 2, 28, { align: 'center' });
      pdf.text(`Erstellt: ${format(new Date(), 'dd.MM.yyyy')}`, pageWidth - margin, 28, { align: 'right' });
      y = 40;
    } else {
      y = margin;
    }
  };

  const ensure = (addHeight: number) => {
    if (y + addHeight > pageHeight - margin) {
      page += 1;
      newPage();
    }
  };

  const section = (title: string) => {
    ensure(16);
    pdf.setTextColor(139, 69, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(title, margin, y);
    y += 8;
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.2);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  const labelValue = (label: string, value: string) => {
    const labelSize = 8;
    const textSize = 10;
    const lineGap = 1;
    const indent = 2;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(labelSize);
    pdf.setTextColor(...labelColor);
    const labelLines = pdf.splitTextToSize(label, contentWidth);
    ensure(labelLines.length * (labelSize * 0.5 + 1) + lineGap + textSize * 0.5 + 4);
    pdf.text(labelLines, margin, y);
    y += labelLines.length * (labelSize * 0.5 + 1) + lineGap;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(textSize);
    pdf.setTextColor(...textColor);
    const textLines = pdf.splitTextToSize(value || '—', contentWidth - indent);
    pdf.text(textLines, margin + indent, y);
    y += textLines.length * (textSize * 0.5 + 1) + 2;
  };

  const twoColumn = (label1: string, value1: string, label2: string, value2: string) => {
    const labelSize = 8;
    const textSize = 10;
    const lineGap = 1;
    const colWidth = (contentWidth - 10) / 2;

    ensure(20);

    // Left column
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(labelSize);
    pdf.setTextColor(...labelColor);
    pdf.text(label1, margin, y);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(textSize);
    pdf.setTextColor(...textColor);
    const text1 = pdf.splitTextToSize(value1 || '—', colWidth);
    pdf.text(text1, margin + 2, y + 4);

    // Right column
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(labelSize);
    pdf.setTextColor(...labelColor);
    pdf.text(label2, margin + colWidth + 10, y);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(textSize);
    pdf.setTextColor(...textColor);
    const text2 = pdf.splitTextToSize(value2 || '—', colWidth);
    pdf.text(text2, margin + colWidth + 12, y + 4);

    y += Math.max(text1.length, text2.length) * (textSize * 0.5 + 1) + 6;
  };

  const bullets = (items: string[]) => {
    const textSize = 10;
    const lineH = textSize * 0.5 + 2;
    items.forEach((t) => {
      ensure(lineH + 2);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(textSize);
      pdf.setTextColor(...textColor);
      const lines = pdf.splitTextToSize(t, contentWidth - 6);
      pdf.text('•', margin, y);
      pdf.text(lines, margin + 4, y);
      y += lines.length * lineH;
    });
    y += 2;
  };

  // Start
  newPage(true);

  // Persönliche Angaben
  section('Persönliche Angaben');
  if (data.user_id) {
    labelValue('Personalnummer', data.user_id.slice(0, 8).toUpperCase());
  }
  twoColumn('Vorname', data.first_name, 'Nachname', data.last_name);
  if (data.birth_name) labelValue('Geburtsname', data.birth_name);
  twoColumn('Geburtsdatum', (() => { const s: any = data.date_of_birth; const d = typeof s === 'string' ? parseISO(s) : new Date(s); return isValid(d) ? format(d, 'dd.MM.yyyy') : String(s); })(), 'Geschlecht', formatLabel('gender', data.gender));
  if (data.birth_place || data.birth_country) {
    twoColumn('Geburtsort', [data.birth_place, data.birth_country].filter(Boolean).join(', '), 'Familienstand', formatLabel('marital_status', data.marital_status));
  } else {
    twoColumn('Familienstand', formatLabel('marital_status', data.marital_status), 'Staatsangehörigkeit', data.nationality);
  }
  if (data.birth_place || data.birth_country) {
    labelValue('Staatsangehörigkeit', data.nationality);
  }
  labelValue('Adresse', `${data.street_address}, ${data.postal_code} ${data.city}`);

  // Beschäftigungsdaten
  section('Beschäftigungsdaten');
  twoColumn('Berufsbezeichnung', data.job_title, 'Eintrittsdatum', (() => { const s: any = data.start_date; const d = typeof s === 'string' ? parseISO(s) : new Date(s); return isValid(d) ? format(d, 'dd.MM.yyyy') : String(s); })());
  labelValue('Art der Beschäftigung', Array.isArray(data.employment_type) ? data.employment_type.join(', ') : formatLabel('employment_type', data.employment_type));
  if (data.employment_type_other) labelValue('Sonstige Angabe', data.employment_type_other);
  
  const specialEmployment = [];
  if (data.is_marginal_employment) specialEmployment.push('Geringfügige Beschäftigung');
  if (data.has_other_employment || data.has_additional_employment) specialEmployment.push('Weitere Beschäftigung');
  if (specialEmployment.length > 0) labelValue('Besonderheiten', specialEmployment.join(', '));

  if (data.has_additional_employment && Array.isArray(data.other_employment_details) && data.other_employment_details.length > 0) {
    section('Weitere Beschäftigungen');
    data.other_employment_details.forEach((emp: any, idx: number) => {
      const parts: string[] = [];
      if (emp.company) parts.push(`Unternehmen: ${emp.company}`);
      if (emp.start_date || emp.end_date) {
        const sd = emp.start_date ? (() => { const s = emp.start_date; const d = typeof s === 'string' ? parseISO(s) : new Date(s); return isValid(d) ? format(d, 'dd.MM.yyyy') : String(s); })() : '';
        const ed = emp.end_date ? (() => { const e = emp.end_date; const d2 = typeof e === 'string' ? parseISO(e) : new Date(e); return isValid(d2) ? format(d2, 'dd.MM.yyyy') : String(e); })() : 'Aktuell';
        parts.push(`Zeitraum: ${sd} - ${ed}`);
      }
      if (emp.hours_per_week) parts.push(`Stunden/Woche: ${emp.hours_per_week}`);
      if (emp.monthly_income) parts.push(`Monatseinkommen: ${emp.monthly_income}€`);
      bullets([`Eintrag ${idx + 1}: ${parts.join(' | ')}`]);
    });
  }

  // Bankverbindung
  section('Bankverbindung');
  twoColumn('IBAN', data.iban, 'BIC', data.bic);

  // Bildungsabschlüsse
  if (data.highest_school_degree || data.highest_professional_qualification) {
    section('Bildungsabschlüsse');
    if (data.highest_school_degree && data.highest_professional_qualification) {
      twoColumn('Schulabschluss', formatLabel('school_degree', data.highest_school_degree), 'Berufsqualifikation', formatLabel('professional_qualification', data.highest_professional_qualification));
    } else {
      if (data.highest_school_degree) labelValue('Höchster Schulabschluss', formatLabel('school_degree', data.highest_school_degree));
      if (data.highest_professional_qualification) labelValue('Höchste berufliche Qualifikation', formatLabel('professional_qualification', data.highest_professional_qualification));
    }
  }

  // Steuerliche Angaben
  if (data.tax_id || data.tax_class_factor || data.child_allowances || data.religious_affiliation) {
    section('Steuerliche Angaben');
    if (data.tax_id && data.tax_class_factor) {
      twoColumn('Steuer-ID', data.tax_id, 'Steuerklasse', data.tax_class_factor);
    } else {
      if (data.tax_id) labelValue('Steuer-ID', data.tax_id);
      if (data.tax_class_factor) labelValue('Steuerklasse', data.tax_class_factor);
    }
    if (typeof data.child_allowances !== 'undefined' && data.religious_affiliation) {
      twoColumn('Kinderfreibeträge', String(data.child_allowances), 'Konfession', data.religious_affiliation);
    } else {
      if (typeof data.child_allowances !== 'undefined') labelValue('Kinderfreibeträge', String(data.child_allowances));
      if (data.religious_affiliation) labelValue('Konfession', data.religious_affiliation);
    }
  }

  // Sozialversicherung
  if (data.social_insurance_number || data.health_insurance_company) {
    section('Sozialversicherung');
    if (data.social_insurance_number && data.health_insurance_company) {
      twoColumn('Sozialversicherungsnummer', data.social_insurance_number, 'Krankenkasse', data.health_insurance_company);
    } else {
      if (data.social_insurance_number) labelValue('Sozialversicherungsnummer', data.social_insurance_number);
      if (data.health_insurance_company) labelValue('Krankenkasse', data.health_insurance_company);
    }
  }

  // Unterschrift (Bild bleibt Bild)
  if (data.signature_data_url) {
    section('Unterschrift');
    ensure(40);
    // Weißer Hintergrund für Unterschrift
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, y, 80, 25, 'F');
    try { pdf.addImage(data.signature_data_url, 'PNG', margin, y, 80, 25); } catch {}
    y += 30;
    
    // Unterschriftsdatum hinzufügen
    if (data.signature_date) {
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const dateStr = (() => { 
        const d = new Date(data.signature_date as any); 
        return isNaN(d.getTime()) ? String(data.signature_date) : format(d, 'dd.MM.yyyy', { locale: de }); 
      })();
      pdf.text(`Unterschrieben am: ${dateStr}`, margin, y);
      y += 8;
    }
  }

  return pdf;
};

export const generatePersonalDataPDFBlob = (data: PersonalDataForPDF): Blob => {
  const pdf = generatePersonalDataPDF(data);
  return pdf.output('blob');
};

export const generatePersonalDataPDFFileName = (data: PersonalDataForPDF): string => {
  const sanitize = (s?: string) => (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
  const today = format(new Date(), 'yyyy-MM-dd');
  const personnelNumber = data.user_id?.slice(0, 8).toUpperCase() || 'XXXXXXXX';
  return `${today}_Personaldaten_${personnelNumber}_${sanitize(data.first_name)}_${sanitize(data.last_name)}.pdf`;
};