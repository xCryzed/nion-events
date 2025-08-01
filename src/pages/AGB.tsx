import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AGB = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Allgemeine Geschäftsbedingungen</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">§ 1 Geltungsbereich</h2>
              <p className="text-muted-foreground mb-4">
                Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen NION Events und dem Kunden 
                über die Erbringung von Eventmanagement-Dienstleistungen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">§ 2 Vertragsschluss</h2>
              <p className="text-muted-foreground mb-4">
                Der Vertrag kommt durch die schriftliche Bestätigung des Auftrags durch NION Events zustande. 
                Mündliche Nebenabreden bedürfen zu ihrer Wirksamkeit der schriftlichen Bestätigung.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">§ 3 Leistungsumfang</h2>
              <p className="text-muted-foreground mb-4">
                Der Umfang der zu erbringenden Leistungen ergibt sich aus der jeweiligen Auftragsbestätigung. 
                Zusätzliche Leistungen werden gesondert berechnet.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">§ 4 Preise und Zahlungsbedingungen</h2>
              <p className="text-muted-foreground mb-4">
                Alle Preise verstehen sich zuzüglich der gesetzlichen Mehrwertsteuer. Die Zahlung erfolgt nach 
                Rechnungsstellung innerhalb von 14 Tagen ohne Abzug.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">§ 5 Mitwirkungspflichten des Kunden</h2>
              <p className="text-muted-foreground mb-4">
                Der Kunde verpflichtet sich, alle erforderlichen Informationen rechtzeitig zur Verfügung zu stellen 
                und bei der Durchführung der Veranstaltung zu kooperieren.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">§ 6 Haftung</h2>
              <p className="text-muted-foreground mb-4">
                NION Events haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten beruhen. 
                Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit nicht Leib, Leben oder Gesundheit 
                betroffen sind.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">§ 7 Kündigung</h2>
              <p className="text-muted-foreground mb-4">
                Der Vertrag kann von beiden Seiten mit einer Frist von 4 Wochen vor dem Veranstaltungstermin 
                gekündigt werden. Bei kurzfristigeren Kündigungen können Stornogebühren anfallen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">§ 8 Schlussbestimmungen</h2>
              <p className="text-muted-foreground mb-4">
                Es gilt deutsches Recht. Gerichtsstand ist Berlin. Sollten einzelne Bestimmungen unwirksam sein, 
                bleibt die Wirksamkeit des übrigen Vertrags unberührt.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AGB;