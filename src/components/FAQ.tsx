import { useState, useMemo } from 'react';
import { Search, ChevronDown, Music, Calendar, MapPin, DollarSign, Clock, Users, Settings, Camera, Zap, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

  const faqData: FAQItem[] = [
    // Allgemeine Fragen
    {
      id: '1',
      category: 'Allgemein',
      icon: <Award className="w-4 h-4" />,
      question: 'Was ist NION Events und wer steht dahinter?',
      answer: 'NION Events ist ein professionelles DJ- und Eventmanagement-Unternehmen aus Aachen, gegründet von Nino Bergen. Mit über 6 Jahren Erfahrung als DJ und Eventmanager haben wir bereits über 500 erfolgreiche Events durchgeführt, von intimen Hochzeitsfeiern bis hin zu Großveranstaltungen mit über 2.500 Gästen.',
      keywords: ['nion', 'unternehmen', 'gründer', 'nino bergen', 'aachen', 'erfahrung']
    },
    {
      id: '2',
      category: 'Allgemein',
      icon: <Award className="w-4 h-4" />,
      question: 'Welche Events hat NION Events bereits durchgeführt?',
      answer: 'Zu unseren Highlights gehören DREAMBEATS (Apollo & NOX Aachen), DREAMBEATS LAB (größte Halloween-Party Aachens im DAS LIEBIG), Electrisize 2023 & 2024, Disco Tropics 2024 in Lloret de Mar, und die geplante Hammer Beachparty 2025 mit über 2.500 Gästen. Zusätzlich betreuen wir Corporate Events für Johnson & Johnson und Hammer GmbH & Co. KG.',
      keywords: ['dreambeats', 'halloween', 'beachparty', 'electrisize', 'apollo', 'nox', 'liebig', 'events']
    },
    {
      id: '3',
      category: 'Allgemein',
      icon: <Award className="w-4 h-4" />,
      question: 'Was macht NION Events besonders?',
      answer: 'Unsere Einzigartigkeit liegt in der Kombination aus praktischer DJ-Erfahrung und technischer Expertise. Als Softwareentwickler bieten wir individuelle digitale Lösungen wie Gästelisten-Apps, Check-in-Systeme und Live-Voting. Unser starkes Netzwerk in Aachen ermöglicht es, nahezu alle Event-Ideen zuverlässig umzusetzen.',
      keywords: ['besonders', 'einzigartig', 'software', 'technisch', 'digital', 'netzwerk']
    },

    // Services & Leistungen
    {
      id: '4',
      category: 'Services',
      icon: <Music className="w-4 h-4" />,
      question: 'Welche DJ-Services bieten Sie an?',
      answer: 'Wir bieten professionellen DJ-Service für alle Anlässe: Club-Events, Hochzeiten, Geburtstagsfeiern, Firmenfeiern, Abibälle und Galaabende. Unsere Musikauswahl wird individuell nach Kundenwunsch zusammengestellt. Zusätzlich bieten wir Moderation und Animation sowie die Kombination mit Live-Musikern.',
      keywords: ['dj', 'musik', 'hochzeit', 'geburtstag', 'firmenfeier', 'abiball', 'gala', 'moderation']
    },
    {
      id: '5',
      category: 'Services',
      icon: <Zap className="w-4 h-4" />,
      question: 'Welche Technik stellen Sie zur Verfügung?',
      answer: 'Wir vermieten moderne Licht- und Tontechnik für Events jeder Größe, inklusive Bühnentechnik. Unser erfahrenes Technikerteam übernimmt Auf- und Abbau sowie die technische Betreuung vor Ort. Von kleinen Feiern bis zu Großveranstaltungen mit über 2.500 Gästen.',
      keywords: ['technik', 'licht', 'ton', 'bühne', 'aufbau', 'abbau', 'betreuung', 'verleih']
    },
    {
      id: '6',
      category: 'Services',
      icon: <Calendar className="w-4 h-4" />,
      question: 'Bieten Sie Eventplanung und Konzeption an?',
      answer: 'Ja, wir entwickeln individuelle Eventkonzepte von der ersten Idee bis zur kompletten Umsetzung. Dazu gehören Ablaufplanung, Timemanagement, Locationberatung und -scouting sowie die Erstellung von Moodboards und detaillierten Konzepten.',
      keywords: ['eventplanung', 'konzeption', 'ablauf', 'location', 'moodboard', 'planung']
    },
    {
      id: '7',
      category: 'Services',
      icon: <Camera className="w-4 h-4" />,
      question: 'Bieten Sie auch Foto- und Videoproduktion an?',
      answer: 'Ja, unser Team bietet professionelle Hochzeitsfotografie und -videos in Kino-Qualität, dynamische Aftermovies für Events sowie Imagefilme und Corporate Videos. Unser Foto- und Videograf Alex sorgt für perfekte Erinnerungen an Ihren besonderen Tag.',
      keywords: ['foto', 'video', 'hochzeit', 'aftermovie', 'imagefilm', 'corporate', 'alex', 'fotograf']
    },
    {
      id: '8',
      category: 'Services',
      icon: <Settings className="w-4 h-4" />,
      question: 'Was sind Silent-Disco und Hybrid-Events?',
      answer: 'Silent-Disco sind Kopfhörerpartys, bei denen Gäste die Musik über Kopfhörer hören und zwischen verschiedenen DJ-Kanälen wählen können. Hybrid-Events kombinieren Präsenz- und Online-Teilnehmer durch professionelle Streaming-Technik. Beide Formate ermöglichen innovative Event-Erlebnisse.',
      keywords: ['silent disco', 'kopfhörer', 'hybrid', 'streaming', 'online', 'innovativ']
    },

    // Private Events
    {
      id: '9',
      category: 'Private Events',
      icon: <Users className="w-4 h-4" />,
      question: 'Welche privaten Events können Sie betreuen?',
      answer: 'Wir organisieren Geburtstagsfeiern (18., 30., 50., etc.), Hochzeiten, Verlobungsfeiern, Abibälle, Abschlussfeiern und Familienfeste. Jedes Event wird individuell geplant und auf Ihre Wünsche zugeschnitten.',
      keywords: ['privat', 'geburtstag', 'hochzeit', 'verlobung', 'abiball', 'abschluss', 'familie']
    },
    {
      id: '10',
      category: 'Private Events',
      icon: <Users className="w-4 h-4" />,
      question: 'Wie läuft die Planung einer Hochzeit ab?',
      answer: 'Wir beginnen mit einem persönlichen Beratungsgespräch, um Ihre Wünsche und Vorstellungen zu verstehen. Dann erstellen wir ein individuelles Konzept mit Musikauswahl, Technik und Ablaufplanung. Unser Service umfasst DJ, Technik, Planung und optional Foto/Video - alles aus einer Hand.',
      keywords: ['hochzeit', 'planung', 'beratung', 'konzept', 'musik', 'ablauf']
    },
    {
      id: '11',
      category: 'Private Events',
      icon: <Users className="w-4 h-4" />,
      question: 'Können Sie auch kleinere Geburtstagsfeiern betreuen?',
      answer: 'Absolut! Wir betreuen Events jeder Größe, von intimen Geburtstagsfeiern mit 20 Gästen bis hin zu großen Partys mit mehreren hundert Personen. Unsere Technik und Services sind skalierbar und werden an die Veranstaltungsgröße angepasst.',
      keywords: ['geburtstag', 'klein', 'groß', 'skalierbar', 'anpassbar', 'gäste']
    },

    // Business Events
    {
      id: '12',
      category: 'Business Events',
      icon: <Users className="w-4 h-4" />,
      question: 'Welche Corporate Events können Sie durchführen?',
      answer: 'Wir organisieren Firmenfeiern, Sommerfeste, Produktpräsentationen, Markeninszenierungen, Team-Building-Events, Incentives und Galaabende. Namhafte Kunden wie Johnson & Johnson (ehemals Abiomed) und Hammer GmbH & Co. KG vertrauen auf unsere Expertise.',
      keywords: ['firmenfeier', 'sommerfest', 'produktpräsentation', 'team building', 'gala', 'johnson', 'hammer']
    },
    {
      id: '13',
      category: 'Business Events',
      icon: <Users className="w-4 h-4" />,
      question: 'Haben Sie Erfahrung mit großen Firmenveranstaltungen?',
      answer: 'Ja, wir haben bereits erfolgreich Corporate Events für internationale Unternehmen wie Johnson & Johnson (ehemals Abiomed) durchgeführt. Unser Team versteht die besonderen Anforderungen von Geschäftsveranstaltungen und sorgt für einen professionellen, reibungslosen Ablauf.',
      keywords: ['groß', 'firmen', 'corporate', 'international', 'johnson', 'abiomed', 'professionell']
    },

    // Technik & Equipment
    {
      id: '14',
      category: 'Technik',
      icon: <Settings className="w-4 h-4" />,
      question: 'Welches Equipment verwenden Sie?',
      answer: 'Wir setzen auf modernes, professionelles Equipment von führenden Herstellern. Dazu gehören hochwertige Soundsysteme, LED-Lichttechnik, Bühnentechnik und DJ-Equipment. Alles wird regelmäßig gewartet und auf dem neuesten technischen Stand gehalten.',
      keywords: ['equipment', 'sound', 'led', 'bühne', 'dj equipment', 'modern', 'wartung']
    },
    {
      id: '15',
      category: 'Technik',
      icon: <Settings className="w-4 h-4" />,
      question: 'Können Sie auch Open-Air-Events technisch betreuen?',
      answer: 'Ja, wir haben umfangreiche Erfahrung mit Open-Air-Events und Pop-up-Veranstaltungen. Unsere wetterfeste Technik und unser erfahrenes Team sorgen auch im Freien für perfekte Sound- und Lichtqualität. Beispiele sind unsere DREAMBEATS Open-Air-Events und die geplante Hammer Beachparty.',
      keywords: ['open air', 'outdoor', 'pop up', 'wetterfest', 'freien', 'beachparty']
    },
    {
      id: '16',
      category: 'Technik',
      icon: <Zap className="w-4 h-4" />,
      question: 'Welche digitalen Lösungen bieten Sie an?',
      answer: 'Dank meines Backgrounds als Softwareentwickler entwickeln wir individuelle Event-Tools wie Gästelisten-Apps, Check-in-Systeme, E-Ticketing-Lösungen, Live-Voting und Wunschmusik-Abfragen. Zusätzlich bieten wir Datenanalyse und Echtzeit-Dashboards für Veranstalter.',
      keywords: ['digital', 'software', 'app', 'ticketing', 'voting', 'dashboard', 'entwicklung']
    },

    // Preise & Buchung
    {
      id: '17',
      category: 'Preise & Buchung',
      icon: <DollarSign className="w-4 h-4" />,
      question: 'Wie setzen sich Ihre Preise zusammen?',
      answer: 'Unsere Preise richten sich nach Art und Umfang der Veranstaltung, Anzahl der Gäste, benötigte Technik und Dauer des Events. Wir bieten transparente Festpreise ohne versteckte Kosten. Gerne erstellen wir Ihnen ein individuelles, unverbindliches Angebot.',
      keywords: ['preise', 'kosten', 'angebot', 'transparent', 'festpreis', 'gäste', 'dauer']
    },
    {
      id: '18',
      category: 'Preise & Buchung',
      icon: <DollarSign className="w-4 h-4" />,
      question: 'Können einzelne Services gebucht werden?',
      answer: 'Ja, Sie können unsere Services sowohl als Full-Service-Paket als auch einzeln buchen. Ob nur DJ, nur Technik oder nur Planung - wir stellen Ihnen ein maßgeschneidertes Angebot zusammen, das genau Ihren Bedürfnissen entspricht.',
      keywords: ['einzeln', 'full service', 'paket', 'maßgeschneidert', 'flexibel', 'bedürfnisse']
    },
    {
      id: '19',
      category: 'Preise & Buchung',
      icon: <Calendar className="w-4 h-4" />,
      question: 'Wie weit im Voraus sollte ich buchen?',
      answer: 'Für optimale Planung empfehlen wir eine Buchung 3-6 Monate im Voraus, besonders für Hochzeiten und große Events in der Hochsaison. Kurzfristige Buchungen sind je nach Verfügbarkeit möglich. Kontaktieren Sie uns gerne für eine Anfrage.',
      keywords: ['voraus', 'buchen', 'planung', 'monate', 'kurzfristig', 'verfügbarkeit', 'hochsaison']
    },
    {
      id: '20',
      category: 'Preise & Buchung',
      icon: <MapPin className="w-4 h-4" />,
      question: 'In welchen Regionen sind Sie tätig?',
      answer: 'Unser Haupteinsatzgebiet ist Aachen und die Region. Wir betreuen jedoch auch Events in ganz NRW und darüber hinaus. Für Veranstaltungen außerhalb von Aachen berechnen wir faire Anfahrtskosten. Sprechen Sie uns gerne an!',
      keywords: ['region', 'aachen', 'nrw', 'anfahrt', 'deutschland', 'einsatzgebiet']
    },

    // Ablauf & Organisation
    {
      id: '21',
      category: 'Ablauf',
      icon: <Clock className="w-4 h-4" />,
      question: 'Wie läuft die Zusammenarbeit ab?',
      answer: 'Nach Ihrer Anfrage führen wir ein kostenloses Beratungsgespräch. Dann erstellen wir ein individuelles Angebot. Nach Buchung planen wir gemeinsam alle Details. Am Event-Tag kümmern wir uns um Aufbau, Durchführung und Abbau - Sie können sich entspannt auf Ihre Gäste konzentrieren.',
      keywords: ['zusammenarbeit', 'beratung', 'angebot', 'planung', 'aufbau', 'durchführung', 'abbau']
    },
    {
      id: '22',
      category: 'Ablauf',
      icon: <Clock className="w-4 h-4" />,
      question: 'Wie lange dauert der Aufbau?',
      answer: 'Der Aufbau dauert je nach Event-Größe zwischen 1-4 Stunden. Für kleinere Events reichen oft 1-2 Stunden, für große Veranstaltungen mit umfangreicher Technik planen wir 3-4 Stunden ein. Der Abbau erfolgt meist schneller, in der Regel innerhalb von 1-2 Stunden.',
      keywords: ['aufbau', 'dauer', 'stunden', 'zeit', 'abbau', 'größe']
    },
    {
      id: '23',
      category: 'Ablauf',
      icon: <Users className="w-4 h-4" />,
      question: 'Haben Sie einen festen Ansprechpartner?',
      answer: 'Ja, Sie haben während der gesamten Planung und Durchführung einen persönlichen Ansprechpartner. Dies gewährleistet eine reibungslose Kommunikation und dass alle Ihre Wünsche und Details berücksichtigt werden.',
      keywords: ['ansprechpartner', 'persönlich', 'kommunikation', 'planung', 'wünsche']
    },

    // Team & Personal
    {
      id: '24',
      category: 'Team',
      icon: <Users className="w-4 h-4" />,
      question: 'Wer gehört zum NION Events Team?',
      answer: 'Unser Team besteht aus erfahrenen Profis: Nino Bergen (Geschäftsführer & DJ), Dogan (DJ), Ben (DJ), Steven (DJ), Alex (Foto- & Videograf), Devin (Techniker), Rene (Techniker) und Melanie (Designerin). Jeder bringt spezielle Expertise mit.',
      keywords: ['team', 'nino', 'dogan', 'ben', 'steven', 'alex', 'devin', 'rene', 'melanie']
    },
    {
      id: '25',
      category: 'Team',
      icon: <Music className="w-4 h-4" />,
      question: 'Welche Musikrichtungen können Ihre DJs spielen?',
      answer: 'Unsere DJs decken alle Musikrichtungen ab: House, Techno, Hip-Hop, Pop, Rock, Schlager, Charts und mehr. Jeder DJ hat seine Spezialgebiete - von elektronischer Musik bis hin zu Hochzeitsmusik. Wir passen die Musikauswahl immer an Ihre Wünsche und Ihr Publikum an.',
      keywords: ['musik', 'house', 'techno', 'hip hop', 'pop', 'rock', 'schlager', 'charts', 'hochzeit']
    },

    // Kontakt & Service
    {
      id: '26',
      category: 'Kontakt',
      icon: <Clock className="w-4 h-4" />,
      question: 'Wie kann ich Sie erreichen?',
      answer: 'Sie erreichen uns per E-Mail, Telefon oder über unser Kontaktformular auf der Website. Wir bieten 24/7 Support und melden uns schnellstmöglich bei Ihnen zurück. Für dringende Anliegen am Event-Tag sind wir jederzeit erreichbar.',
      keywords: ['kontakt', 'email', 'telefon', 'formular', '24/7', 'support', 'erreichbar']
    },
    {
      id: '27',
      category: 'Kontakt',
      icon: <Award className="w-4 h-4" />,
      question: 'Bieten Sie auch Last-Minute-Buchungen an?',
      answer: 'Je nach Verfügbarkeit können wir auch kurzfristige Buchungen realisieren. Kontaktieren Sie uns einfach - wir prüfen gerne, ob wir Ihnen auch bei Last-Minute-Anfragen helfen können. Unser flexibles Team macht vieles möglich.',
      keywords: ['last minute', 'kurzfristig', 'verfügbarkeit', 'flexibel', 'möglich']
    },
    {
      id: '28',
      category: 'Kontakt',
      icon: <Award className="w-4 h-4" />,
      question: 'Haben Sie Referenzen oder Bewertungen?',
      answer: 'Ja, wir haben zahlreiche positive Bewertungen und Referenzen von zufriedenen Kunden. Nele Frohn schreibt: "Einfach 5/5, denn besser geht es kaum." Jörg Schreiber: "Alle waren total begeistert." Silvia K: "Kann ich nur weiterempfehlen." Gerne zeigen wir Ihnen weitere Referenzen.',
      keywords: ['referenzen', 'bewertungen', 'kunden', 'zufrieden', 'empfehlung', '5 sterne']
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

  const categories = [...new Set(faqData.map(faq => faq.category))];

  const getFAQsByCategory = (category: string) => {
    return filteredFAQs.filter(faq => faq.category === category);
  };

  return (
    <section id="faq" className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/10 to-background"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-primary rounded-full blur-3xl opacity-5"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent rounded-full blur-3xl opacity-5"></div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border mb-6">
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
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="FAQ durchsuchen... (z.B. 'Preise', 'Hochzeit', 'Technik')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-card/50 border-border/50 focus:border-primary/50 rounded-2xl backdrop-blur-sm"
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

                <Accordion type="single" collapsible className="space-y-4">
                  {categoryFAQs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border-border/30 rounded-xl bg-card/30 px-6 hover:bg-card/50 transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-6">
                        <span className="flex items-center gap-3">
                          {faq.icon}
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pt-2">
                        {faq.answer}
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
              <Search className="w-10 h-10 text-muted-foreground" />
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
        <div className="text-center mt-16 glass-card p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h3 className="text-2xl font-bold mb-4 text-foreground">
            Ihre Frage war nicht dabei?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Kein Problem! Kontaktieren Sie uns gerne direkt. Wir beraten Sie kostenlos
            und unverbindlich zu allen Aspekten Ihres Events.
          </p>
          <button className="btn-hero group">
            Kostenlose Beratung anfragen
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;