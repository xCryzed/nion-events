import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Datenschutz = () => {
  useEffect(() => {
    document.title = 'Datenschutz - DJ Aachen & Eventtechnik | NION Events';
  }, []);
  return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center">Datenschutzerklärung</h1>
            <p className="text-center text-muted-foreground mb-8">Stand: August 2025</p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. Datenschutz auf einen Blick</h2>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Allgemeine Hinweise</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
                  passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
                  persönlich identifiziert werden können.
                </p>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
                <p className="text-muted-foreground mb-4">
                  Die Datenverarbeitung erfolgt durch den Websitebetreiber:
                </p>
                <div className="bg-secondary/20 p-4 rounded-lg mb-4">
                  <p className="mb-2"><strong>NION Events</strong></p>
                  <p className="mb-2">Dobacher Str. 126</p>
                  <p className="mb-2">52146 Würselen</p>
                  <p className="mb-2">Deutschland</p>
                  <p className="mb-2"><strong>Telefon:</strong> +49 1575 2046096</p>
                  <p className="mb-2"><strong>E-Mail:</strong> datenschutz@nion-events.de</p>
                </div>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Allgemeine Hinweise und Pflichtinformationen</h2>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Datenschutz</h3>
                <p className="text-muted-foreground mb-4">
                  Wir behandeln Ihre personenbezogenen Daten vertraulich und gemäß den gesetzlichen Datenschutzvorschriften
                  (insbesondere DSGVO, BDSG, TTDSG) sowie dieser Datenschutzerklärung.
                </p>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Zuständige Aufsichtsbehörde</h3>
                <div className="bg-secondary/20 p-4 rounded-lg mb-4">
                  <p className="mb-2"><strong>Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)</strong></p>
                  <p className="mb-2">Kavalleriestraße 2–4, 40213 Düsseldorf</p>
                  <p className="mb-2"><strong>Web:</strong> www.ldi.nrw.de</p>
                </div>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SSL- bzw. TLS-Verschlüsselung</h3>
                <p className="text-muted-foreground mb-4">
                  Diese Seite nutzt aus Sicherheitsgründen und zum Schutz vertraulicher Inhalte eine SSL-/TLS-Verschlüsselung.
                  Eine verschlüsselte Verbindung erkennen Sie an „https://" und dem Schloss-Symbol in der Browserzeile.
                </p>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Website-Hosting</h3>
                <p className="text-muted-foreground mb-4">
                  Diese Website wird über GitHub Pages gehostet. GitHub Pages ist ein Service der GitHub, Inc.
                  (88 Colin P Kelly Jr St, San Francisco, CA 94107, USA). GitHub kann dabei technische Logdaten
                  wie IP-Adressen zur Bereitstellung und Sicherheit des Dienstes erfassen.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Datenerfassung auf dieser Website</h2>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Server-Log-Dateien</h3>
                <p className="text-muted-foreground mb-4">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an technisch fehlerfreier Darstellung).<br/>
                  <strong>Erhobene Daten:</strong> Browsertyp/-version, Betriebssystem, Referrer URL, Hostname, Uhrzeit, IP-Adresse (gekürzt).
                </p>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Kontaktformular</h3>
                <p className="text-muted-foreground mb-4">
                  <strong>Rechtsgrundlagen:</strong><br/>
                  • Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)<br/>
                  • Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Bearbeitung von Anfragen)<br/>
                  <strong>Speicherdauer:</strong> 3 Jahre nach Abschluss der Korrespondenz.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Cookies und Consent</h2>

                <p className="text-muted-foreground mb-4">
                  Unsere Website nutzt ein Consent-Management-Tool. Nicht technisch notwendige Cookies (Analyse, Marketing)
                  werden erst nach Einwilligung gesetzt. Diese können jederzeit widerrufen werden.
                </p>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Cookie-Kategorien:</h3>
                <div className="space-y-4">
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Erforderliche Cookies</h4>
                    <p className="text-muted-foreground text-sm">
                      Grundfunktionen, Sicherheit
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Analytische Cookies</h4>
                    <p className="text-muted-foreground text-sm">
                      Nur nach Einwilligung
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Marketing-Cookies</h4>
                    <p className="text-muted-foreground text-sm">
                      Nur nach Einwilligung
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Funktionale Cookies</h4>
                    <p className="text-muted-foreground text-sm">
                      Nur nach Einwilligung
                    </p>
                  </div>
                </div>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Google Analytics</h2>

                <p className="text-muted-foreground mb-4">
                  Diese Website nutzt Google Analytics (Google Ireland Limited, Dublin, Irland) mit aktivierter IP-Anonymisierung.
                  Ihre IP-Adresse wird vor der Speicherung gekürzt. Wir haben mit Google einen Auftragsverarbeitungsvertrag
                  gemäß Art. 28 DSGVO geschlossen.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).<br/>
                  <strong>Speicherdauer:</strong> 26 Monate.<br/>
                  <strong>Empfänger:</strong> Google Ireland Limited; Datenübertragung in die USA möglich, auf Basis von EU-Standardvertragsklauseln.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Social Media & externe Dienste</h2>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Links zu Instagram, Facebook, TikTok, SoundCloud:</h3>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                  <li>Keine automatische Datenübertragung vor Klick.</li>
                  <li>Beim Aufruf der Plattformen gelten deren Datenschutzrichtlinien.</li>
                </ul>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. WhatsApp Business</h2>

                <p className="text-muted-foreground mb-4">
                  Wenn Sie uns über WhatsApp kontaktieren, werden personenbezogene Daten (z. B. Telefonnummer, Nachrichteninhalt,
                  Metadaten) an WhatsApp LLC in den USA übermittelt. Hierauf haben wir keinen Einfluss.
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) oder Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung).
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">8. Ihre Rechte</h2>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium mb-2">Auskunft (Art. 15 DSGVO)</h4>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">Berichtigung (Art. 16 DSGVO)</h4>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">Löschung (Art. 17 DSGVO)</h4>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">Einschränkung (Art. 18 DSGVO)</h4>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">Widerspruch (Art. 21 DSGVO)</h4>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO)</h4>
                  </div>
                </div>

                <div className="bg-secondary/20 p-4 rounded-lg mt-6">
                  <p className="mb-2"><strong>Kontakt für Datenschutzanfragen:</strong></p>
                  <p className="mb-2">NION Events</p>
                  <p className="mb-2">Dobacher Str. 126</p>
                  <p className="mb-2">52146 Würselen</p>
                  <p className="mb-2"><strong>E-Mail:</strong> datenschutz@nion-events.de</p>
                </div>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
  );
};

export default Datenschutz;