import {useState, useMemo, useEffect} from 'react';
import {
  Search,
  ChevronDown,
  Music,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Settings,
  Camera,
  Zap,
  Award,
  Mic, AlertCircle, Headphones,
  Briefcase, PartyPopper, LayoutDashboard
} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
  keywords: string[];
}

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const faqData: FAQItem[] = [
    // Einstieg & Leistungen
    {
      id: '1',
      category: 'Allgemein',
      icon: <LayoutDashboard className="w-4 h-4"/>,
      question: 'Wie läuft die Zusammenarbeit mit NION Events konkret ab – von der ersten Anfrage bis zum Event?',
      answer:
        'Nach Ihrer Anfrage vereinbaren wir ein persönliches Beratungsgespräch, um Ihre Wünsche, Anforderungen und Rahmenbedingungen kennenzulernen. Im Anschluss erhalten Sie ein maßgeschneidertes Angebot. Nach Vertragsabschluss begleiten wir Sie mit klaren Prozessen, technischen Lösungen und musikalischem Feingefühl bis zum Veranstaltungstag – zuverlässig, professionell und transparent.',
      keywords: ['ablauf', 'prozess', 'planung', 'angebot', 'beratung']
    },
    {
      id: '2',
      category: 'Allgemein',
      icon: <PartyPopper className="w-4 h-4"/>,
      question: 'Welche Eventformate realisieren Sie neben Hochzeiten und Firmenfeiern?',
      answer:
        'Wir betreuen eine Vielzahl an Formaten: Hochzeiten, Abschlussbälle, Abipartys, Jubiläen, Messe-Events, Produktpräsentationen, Aftershows, Galaveranstaltungen und private Feiern jeder Art. Dank modularer Technik und individuell abgestimmter Musik passen wir unser Setup flexibel an Ihre Zielgruppe und Veranstaltungsgröße an.',
      keywords: ['abiball', 'abschlussfeier', 'eventarten', 'hochzeit', 'messe']
    },

    // Buchung & Bezahlung
    {
      id: '3',
      category: 'Preise & Buchung',
      icon: <DollarSign className="w-4 h-4"/>,
      question: 'Wie läuft der Buchungsprozess ab?',
      answer:
        'Nach Ihrer Anfrage führen wir ein unverbindliches Erstgespräch. Anschließend erhalten Sie ein individuelles Angebot. Mit Vertragsunterzeichnung und Anzahlung ist Ihr Termin verbindlich reserviert. Die Restzahlung erfolgt bequem per Rechnung nach der Veranstaltung.',
      keywords: ['buchung', 'vertrag', 'zahlung', 'angebot']
    },
    {
      id: '4',
      category: 'Preise & Buchung',
      icon: <DollarSign className="w-4 h-4"/>,
      question: 'Wie setzen sich die Kosten für eine Veranstaltung zusammen?',
      answer:
        'Unsere Preise basieren auf Art und Dauer des Events, Umfang der Technik, Anfahrtsweg und gewünschten Zusatzleistungen. Sie erhalten stets transparente Festpreise – ohne versteckte Kosten. Für Abschlussklassen und gemeinnützige Organisationen bieten wir auf Anfrage Sonderkonditionen.',
      keywords: ['preis', 'kosten', 'pauschale', 'rabatt', 'sonderpreis']
    },
    {
      id: '5',
      category: 'Preise & Buchung',
      icon: <Calendar className="w-4 h-4"/>,
      question: 'Wie weit im Voraus sollte man buchen?',
      answer:
        'Für Hochzeiten und Firmenevents empfehlen wir eine Vorlaufzeit von 6–12 Monaten, insbesondere in der Hochsaison. Abibälle und kurzfristige Veranstaltungen realisieren wir je nach Verfügbarkeit auch innerhalb weniger Wochen.',
      keywords: ['buchung', 'frühzeitig', 'planung', 'verfügbarkeit']
    },

    // Ablauf & Planung
    {
      id: '6',
      category: 'Ablauf',
      icon: <Clock className="w-4 h-4"/>,
      question: 'Gibt es ein persönliches Planungsgespräch vorab?',
      answer:
        'Ja – in der Regel führen wir zwei strukturierte Vorgespräche per Video-Call oder vor Ort: eines zur inhaltlichen Planung, eines zur finalen Abstimmung kurz vor dem Event. Dabei klären wir musikalische Vorlieben, Programmpunkte und technische Besonderheiten.',
      keywords: ['vorgespräch', 'planungsmeeting', 'briefing']
    },
    {
      id: '7',
      category: 'Ablauf',
      icon: <Clock className="w-4 h-4"/>,
      question: 'Wie sieht der Ablauf am Veranstaltungstag aus?',
      answer:
        'Wir treffen frühzeitig vor Ort ein und übernehmen eigenständig den Aufbau der Technik. Die Musik beginnt pünktlich zur gewünschten Startzeit. Übergänge zwischen Programmpunkten, spontane Änderungen und Stimmungswechsel begleiten wir professionell und flexibel.',
      keywords: ['eventtag', 'ablauf', 'aufbau', 'zeitplanung']
    },

    // Musik & Moderation
    {
      id: '8',
      category: 'Services',
      icon: <Music className="w-4 h-4"/>,
      question: 'Welche Musikrichtungen werden gespielt?',
      answer:
        'Unsere Musik ist individuell auf Ihr Event zugeschnitten. Von Charts, House und Hip-Hop über Klassiker der 70er–2000er bis hin zu Club-Sounds, Rock oder Lounge – Sie bestimmen die Richtung, wir sorgen für die passende Dramaturgie.',
      keywords: ['musikrichtung', 'genres', 'stil']
    },
    {
      id: '9',
      category: 'Services',
      icon: <Music className="w-4 h-4"/>,
      question: 'Können Musikwünsche im Vorfeld und live berücksichtigt werden?',
      answer:
        'Absolut. Im Vorfeld können Sie über ein digitales Wunschformular Ihre Favoriten und No-Gos einreichen. Während des Events nehmen wir live Wünsche entgegen, sofern sie zur Stimmung passen. Für Abibälle oder Hochzeiten bieten wir auch Live-Voting-Tools an.',
      keywords: ['musikwünsche', 'voting', 'playlist', 'gäste']
    },
    {
      id: '10',
      category: 'Services',
      icon: <Mic className="w-4 h-4"/>,
      question: 'Ist auch eine Moderation oder Eventbegleitung möglich?',
      answer:
        'Ja, auf Wunsch übernehmen wir dezente Moderation – etwa zur Begrüßung, für Programmpunkte oder zur Koordination mit Dienstleistern. Lautstärke, Stil und Tonalität stimmen wir vorab gemeinsam ab.',
      keywords: ['moderation', 'ansagen', 'dj', 'eventleitung']
    },

    // Technik & Infrastruktur
    {
      id: '11',
      category: 'Technik',
      icon: <Settings className="w-4 h-4"/>,
      question: 'Welche Technik wird von Ihnen bereitgestellt?',
      answer:
        'Wir setzen ausschließlich auf hochwertige Ton- und Lichttechnik. Je nach Location, Gästeanzahl und Eventcharakter wählen wir ein passendes Setup aus – inkl. DJ-Pult, Lautsprechern, Ambientebeleuchtung, Funkmikrofonen und Backupsystemen.',
      keywords: ['technik', 'tonanlage', 'licht', 'mikrofon']
    },
    {
      id: '12',
      category: 'Technik',
      icon: <Settings className="w-4 h-4"/>,
      question: 'Welche Voraussetzungen müssen vor Ort gegeben sein?',
      answer:
        'Für den Aufbau benötigen wir eine ebene Fläche von ca. 3×2 m sowie zwei separate 230 V-Stromanschlüsse. Bei größeren Produktionen (z. B. Abibälle) stimmen wir uns zusätzlich mit der Location über Bühnenzugang, Stromlast und Aufbauzeiten ab.',
      keywords: ['strom', 'platz', 'anforderungen', 'vorbereitung']
    },

    // Ausfall & Sicherheit
    {
      id: '13',
      category: 'Sicherheit',
      icon: <AlertCircle className="w-4 h-4"/>,
      question: 'Was passiert im Krankheitsfall oder bei einem Ausfall?',
      answer:
        'Wir garantieren eine qualifizierte Vertretung durch unser professionelles Netzwerk – vorbereitet mit Ihrem Musikprofil, Eventbriefing und technischer Übergabe. Ausfallsicherheit ist bei uns Teil des Leistungsversprechens.',
      keywords: ['ausfall', 'ersatz', 'krankheit', 'backup']
    },

    // Zusatzleistungen
    {
      id: '14',
      category: 'Services',
      icon: <Camera className="w-4 h-4"/>,
      question: 'Bieten Sie auch Foto- oder Videoproduktionen an?',
      answer:
        'Ja. Wir produzieren auf Wunsch Eventfilme, Aftermovies, Highlight-Reels oder auch Social-Media-Clips. Ideal für Hochzeiten, Firmenveranstaltungen oder Abschlussfeiern. Alle Aufnahmen erfolgen in Studioqualität.',
      keywords: ['foto', 'video', 'film', 'dokumentation']
    },
    {
      id: '15',
      category: 'Services',
      icon: <Headphones className="w-4 h-4"/>,
      question: 'Was ist eine Silent-Disco und eignet sich das für Abibälle?',
      answer:
        'Silent-Discos ermöglichen Tanzen über Funkkopfhörer auf mehreren Kanälen – ideal bei Lärmschutzauflagen oder als Gag am späteren Abend. Abibälle und Studentenpartys nutzen das Konzept gern als zweiten Dancefloor mit freier Kanalwahl.',
      keywords: ['silent disco', 'abiball', 'funksystem', 'kopfhörer']
    },

    // Business & Region
    {
      id: '16',
      category: 'Business Events',
      icon: <Briefcase className="w-4 h-4"/>,
      question: 'Welche Art von Business-Events realisieren Sie?',
      answer:
        'Wir betreuen Firmenfeiern, Messe-Events, Galaabende, Mitarbeiterveranstaltungen und Produktpräsentationen. Unsere Kunden schätzen insbesondere den reibungslosen Ablauf, hochwertige Technik und unsere professionelle Außenwirkung.',
      keywords: ['business', 'messe', 'unternehmen', 'kunden']
    },
    {
      id: '17',
      category: 'Preise & Buchung',
      icon: <MapPin className="w-4 h-4"/>,
      question: 'In welchen Regionen sind Sie tätig?',
      answer:
        'Wir sind im gesamten Raum NRW tätig – mit Schwerpunkt Aachen, Köln, Düsseldorf und Bonn. Bundesweite und internationale Veranstaltungen realisieren wir ebenfalls auf Anfrage.',
      keywords: ['gebiet', 'einsatzorte', 'aachen', 'deutschland', 'region']
    }
  ];

  const filteredFAQs = useMemo(() => {
    if (!searchTerm) return faqData;

    const searchLower = searchTerm.toLowerCase();
    return faqData.filter(faq =>
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower) ||
      faq.category.toLowerCase().includes(searchLower) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  }, [searchTerm]);

  // Automatisch passende FAQs aufklappen und Suchbegriff hervorheben
  useEffect(() => {
    if (searchTerm) {
      const matchingIds = filteredFAQs.map(faq => faq.id);
      setOpenItems(matchingIds);
    } else {
      setOpenItems([]);
    }
  }, [searchTerm, filteredFAQs]);

  // Funktion zum Hervorheben des Suchbegriffs
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ?
        <mark key={index} className="bg-primary/20 text-primary rounded px-1">{part}</mark> :
        part
    );
  };

  const categories = [...new Set(faqData.map(faq => faq.category))];

  const getFAQsByCategory = (category: string) => {
    return filteredFAQs.filter(faq => faq.category === category);
  };

  return (
    <section id="faq" className="section-padding bg-muted/30">
      {/* Background Elements */}
      <div className="absolute inset-0"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-primary rounded-full blur-3xl opacity-5"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent rounded-full blur-3xl opacity-5"></div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border mb-6">
            <span className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse"></span>
            <span className="text-sm text-muted-foreground font-medium tracking-wide">HÄUFIG GESTELLTE FRAGEN</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient">FAQ</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-primary rounded-full mx-auto mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Hier finden Sie Antworten auf die wichtigsten Fragen rund um unsere Services,
            Preise und Abläufe. Nutzen Sie die Suchfunktion für gezielte Ergebnisse.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary w-6 h-6 z-10 drop-shadow-sm"/>
            <Input
              type="text"
              placeholder="FAQ durchsuchen... (z.B. 'Preise', 'Hochzeit', 'Technik')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-background/80 border-border/50 focus:border-primary/50 rounded-2xl relative z-10"
            />
          </div>
          {searchTerm && (
            <p className="text-center mt-4 text-muted-foreground">
              {filteredFAQs.length} Ergebnis{filteredFAQs.length !== 1 ? 'se' : ''} gefunden
            </p>
          )}
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryFAQs = getFAQsByCategory(category);
            if (categoryFAQs.length === 0) return null;

            return (
              <div key={category} className="glass-card p-8 rounded-3xl">
                <h3 className="text-2xl font-bold mb-6 text-gradient flex items-center gap-3">
                  {categoryFAQs[0]?.icon}
                  {category}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({categoryFAQs.length})
                  </span>
                </h3>

                <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="space-y-4">
                  {categoryFAQs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border-border/30 rounded-xl bg-card/30 px-6 hover:bg-card/50 transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-6">
                        <span className="flex items-center gap-3">
                          {faq.icon}
                          {highlightSearchTerm(faq.question, searchTerm)}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pt-2">
                        {highlightSearchTerm(faq.answer, searchTerm)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground"/>
            </div>
            <h3 className="text-xl font-semibold mb-4">Keine Ergebnisse gefunden</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Ihre Suche nach "{searchTerm}" ergab keine Treffer. Versuchen Sie andere Suchbegriffe
              oder kontaktieren Sie uns direkt.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="btn-secondary"
            >
              Suche zurücksetzen
            </button>
          </div>
        )}

        {/* Contact CTA */}
        <div
          className="text-center mt-16 glass-card p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h3 className="text-2xl font-bold mb-4 text-foreground">
            Ihre Frage war nicht dabei?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Kein Problem! Kontaktieren Sie uns gerne direkt. Wir beraten Sie kostenlos
            und unverbindlich zu allen Aspekten Ihres Events.
          </p>
          <a href="#contact">
            <button className="btn-hero group">
              Kostenlose Beratung anfragen
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;