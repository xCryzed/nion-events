import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AGB = () => {
  return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center">Allgemeine Geschäftsbedingungen</h1>

            <div className="prose prose-invert max-w-none space-y-8">
              <div className="glass-card p-6 rounded-lg mb-8">
                <p className="text-center text-muted-foreground mb-4">
                  <strong>Stand: August 2025</strong><br/>
                  Allgemeine Geschäftsbedingungen für Eventdienstleistungen und Technikverleih
                </p>
                <p className="text-sm text-center text-muted-foreground">
                  Diese AGB gelten für alle Geschäftsbeziehungen zwischen NION Events und unseren Kunden.
                </p>
              </div>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 1 Geltungsbereich & Vertragspartner</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  <strong>1.1</strong> Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche Verträge über
                  Eventdienstleistungen und/oder die Vermietung von Veranstaltungstechnik, die NION Events
                  (im Folgenden „Veranstalter") mit ihren Kunden abschließt.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>1.2</strong> Abweichende Geschäftsbedingungen des Kunden werden nicht anerkannt, es sei denn,
                  NION Events stimmt ihrer Geltung ausdrücklich schriftlich zu.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 2 Vertragsabschluss</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>2.1</strong> Ein Vertrag kommt zustande, wenn der Kunde das schriftliche Angebot von NION Events
                  bestätigt oder NION Events eine entsprechende Auftragsbestätigung übermittelt.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>2.2</strong> Mündliche Nebenabreden sind nur wirksam, wenn sie schriftlich bestätigt werden.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 3 Widerrufsrecht für Verbraucher</h2>
                <div className="bg-accent/10 p-4 rounded-lg mb-4 border border-accent/20">
                  <h3 className="text-lg font-semibold mb-2 text-accent">Widerrufsbelehrung</h3>
                  <p className="text-muted-foreground mb-2">
                    <strong>3.1</strong> Kunden, die Verbraucher im Sinne des § 13 BGB sind, haben das Recht, binnen 14 Tagen
                    ohne Angabe von Gründen diesen Vertrag zu widerrufen.
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>3.2</strong> Die Widerrufsfrist beträgt 14 Tage ab dem Tag des Vertragsabschlusses.
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>3.3</strong> Um das Widerrufsrecht auszuüben, muss der Kunde NION Events mittels einer eindeutigen
                    Erklärung (z. B. per Post, E-Mail an info@nion-events.de) über seinen Entschluss, den Vertrag zu widerrufen, informieren.
                  </p>
                </div>
                <p className="text-muted-foreground mb-4">
                  <strong>3.4</strong> Das Widerrufsrecht erlischt vorzeitig, wenn der Vertrag auf ausdrücklichen Wunsch des
                  Kunden vollständig erfüllt wurde, bevor er das Widerrufsrecht ausgeübt hat.
                </p>
                <p className="text-muted-foreground">
                  <strong>3.5</strong> Die vollständige Widerrufsbelehrung wird dem Kunden gesondert in Textform zur Verfügung gestellt.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 4 Leistungsumfang & Technikverleih</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>4.1</strong> Die gemietete Veranstaltungstechnik ist vom Kunden sorgfältig zu behandeln und in
                  einwandfreiem Zustand zurückzugeben.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>4.2</strong> Eine Nutzung ohne Personal von NION Events ist nur zulässig, wenn der Kunde vorab eine
                  Haftungsübernahmeerklärung gemäß § 5 dieser AGB unterzeichnet.
                </p>
                <p className="text-muted-foreground">
                  <strong>4.3</strong> Der Kunde verpflichtet sich, die Technik ausschließlich für den vereinbarten Zweck zu nutzen.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 5 Haftungsübernahme bei unbeaufsichtigter Technik</h2>
                <div className="bg-destructive/10 p-4 rounded-lg mb-4 border border-destructive/20">
                  <h3 className="text-lg font-semibold mb-2 text-destructive">Wichtiger Hinweis zur Haftung</h3>
                  <p className="text-muted-foreground mb-2">
                    <strong>5.1</strong> Wird die Technik nicht durchgehend von einem Mitarbeiter von NION Events betreut,
                    haftet der Kunde ab Übergabe bis zur Rückgabe in vollem Umfang für Verlust, Beschädigung oder unsachgemäße Bedienung.
                  </p>
                </div>
                <p className="text-muted-foreground mb-4">
                  <strong>5.2</strong> Der Kunde ist verpflichtet, bei Übernahme der Technik eine Haftungsübernahmeerklärung zu unterzeichnen.
                </p>
                <p className="text-muted-foreground">
                  <strong>5.3</strong> Schäden oder Verluste sind NION Events unverzüglich zu melden.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 6 Stornobedingungen</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>6.1</strong> Stornierungen müssen schriftlich erfolgen (z. B. per Post oder E-Mail an info@nion-events.de).
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>6.2</strong> Bei Stornierung fallen folgende Pauschalen vom Gesamtauftragswert an:
                </p>
                <div className="bg-secondary/20 p-4 rounded-lg mb-4">
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>bis 30 Tage vor Veranstaltungsbeginn:</span>
                      <span className="font-semibold text-primary">30%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>bis 14 Tage vor Veranstaltungsbeginn:</span>
                      <span className="font-semibold text-primary">50%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>bis 3 Tage vor Veranstaltungsbeginn:</span>
                      <span className="font-semibold text-destructive">80%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>später als 3 Tage oder Nichtabnahme:</span>
                      <span className="font-semibold text-destructive">100%</span>
                    </li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  <strong>6.3</strong> Dem Kunden bleibt der Nachweis vorbehalten, dass kein oder ein geringerer Schaden entstanden ist.
                  NION Events kann einen höheren Schaden nachweisen.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 7 Preise und Zahlungsbedingungen</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>7.1</strong> Alle Preise verstehen sich zuzüglich der gesetzlichen Mehrwertsteuer.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>7.2</strong> Die Zahlung erfolgt nach Rechnungsstellung innerhalb von 14 Tagen ohne Abzug.
                </p>
                <p className="text-muted-foreground">
                  <strong>7.3</strong> Bei Zahlungsverzug werden Verzugszinsen in Höhe von 9 Prozentpunkten über dem
                  Basiszinssatz der Europäischen Zentralbank berechnet.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 8 Mitwirkungspflichten des Kunden</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>8.1</strong> Der Kunde verpflichtet sich, alle erforderlichen Informationen rechtzeitig zur Verfügung
                  zu stellen und bei der Durchführung der Veranstaltung zu kooperieren.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>8.2</strong> Der Kunde stellt sicher, dass die Veranstaltungsräume für die vereinbarten Leistungen
                  geeignet und zugänglich sind.
                </p>
                <p className="text-muted-foreground">
                  <strong>8.3</strong> Erforderliche Genehmigungen (z.B. GEMA, Nachbarschaftsrecht) sind vom Kunden einzuholen.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 9 Rückgabe</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>9.1</strong> Die Technik ist am vereinbarten Rückgabetermin in funktionsfähigem, sauberem Zustand zurückzugeben.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>9.2</strong> Bei verspäteter Rückgabe kann NION Events eine angemessene Nutzungsentschädigung verlangen.
                </p>
                <p className="text-muted-foreground">
                  <strong>9.3</strong> Fehlende oder beschädigte Teile werden dem Kunden zum Wiederbeschaffungswert berechnet.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 10 Haftung</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>10.1</strong> NION Events haftet nur bei Vorsatz oder grober Fahrlässigkeit, es sei denn, es handelt sich
                  um die Verletzung wesentlicher Vertragspflichten.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>10.2</strong> Bei leichter Fahrlässigkeit ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.
                </p>
                <p className="text-muted-foreground">
                  <strong>10.3</strong> Die Haftung für Schäden an gemieteter Technik, die durch unsachgemäße Bedienung oder
                  Nichtbeachtung der Bedienungsanleitung entstehen, liegt beim Kunden.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 11 Höhere Gewalt</h2>
                <p className="text-muted-foreground">
                  Fälle höherer Gewalt (z. B. Naturkatastrophen, behördliche Anordnungen, Pandemien, Stromausfälle, Streiks)
                  entbinden beide Parteien von der Leistungspflicht. Schadensersatzansprüche sind ausgeschlossen.
                  Bereits geleistete Zahlungen werden anteilig erstattet.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 12 Datenschutz</h2>
                <p className="text-muted-foreground">
                  Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung, die unter
                  <a href="/datenschutz" className="text-primary hover:text-accent transition-colors">www.nion-events.de/datenschutz</a>
                  einsehbar ist.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 13 Salvatorische Klausel</h2>
                <p className="text-muted-foreground mb-4">
                  Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Regelungen unberührt.
                  An die Stelle der unwirksamen Bestimmung tritt eine rechtlich zulässige Regelung, die dem wirtschaftlichen
                  Zweck möglichst nahekommt.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">§ 14 Anwendbares Recht und Gerichtsstand</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>14.1</strong> Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.
                </p>
                <p className="text-muted-foreground">
                  <strong>14.2</strong> Gerichtsstand für alle Streitigkeiten aus diesem Vertragsverhältnis ist Berlin,
                  sofern der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches
                  Sondervermögen ist.
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