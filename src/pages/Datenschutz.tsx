import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Datenschutz = () => {
  return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center">Datenschutzerklärung</h1>

            <div className="prose prose-invert max-w-none space-y-8">
              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. Datenschutz auf einen Blick</h2>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Allgemeine Hinweise</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
                  passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
                  persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen
                  Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
                </p>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Datenerfassung auf dieser Website</h3>
                <h4 className="text-lg font-medium mb-2">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h4>
                <p className="text-muted-foreground mb-4">
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
                  können Sie dem Abschnitt „Hinweis zur verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.
                </p>

                <h4 className="text-lg font-medium mb-2">Wie erfassen wir Ihre Daten?</h4>
                <p className="text-muted-foreground mb-4">
                  Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um
                  Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch oder nach Ihrer
                  Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst.
                </p>

                <h4 className="text-lg font-medium mb-2">Wofür nutzen wir Ihre Daten?</h4>
                <p className="text-muted-foreground mb-4">
                  Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten.
                  Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden (nur nach Ihrer Einwilligung).
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Allgemeine Hinweise und Pflichtinformationen</h2>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Datenschutz</h3>
                <p className="text-muted-foreground mb-4">
                  Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
                  personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie
                  dieser Datenschutzerklärung.
                </p>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Hinweis zur verantwortlichen Stelle</h3>
                <div className="bg-secondary/20 p-4 rounded-lg mb-4">
                  <p className="mb-2"><strong>NION Events</strong></p>
                  <p className="mb-2">Dobacher Str. 126</p>
                  <p className="mb-2">52146 Würselen</p>
                  <p className="mb-2">Deutschland</p>
                  <p className="mb-2"><strong>Telefon:</strong> +49 1575 2046096</p>
                  <p className="mb-2"><strong>E-Mail:</strong> datenschutz@nion-events.de</p>
                </div>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Speicherdauer</h3>
                <p className="text-muted-foreground mb-4">
                  Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben
                  Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Datenerfassung auf dieser Website</h2>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Server-Log-Dateien</h3>
                <p className="text-muted-foreground mb-4">
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien,
                  die Ihr Browser automatisch an uns übermittelt. Dies sind:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                  <li>Browsertyp und Browserversion</li>
                  <li>verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP-Adresse</li>
                </ul>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Kontaktformular</h3>
                <p className="text-muted-foreground mb-4">
                  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular
                  inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall
                  von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
                </p>
                <p className="text-muted-foreground mb-4">
                  Folgende Daten werden über unser Kontaktformular erhoben:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                  <li>Name (Pflichtfeld)</li>
                  <li>E-Mail-Adresse (Pflichtfeld)</li>
                  <li>Telefonnummer (optional)</li>
                  <li>Unternehmen (optional)</li>
                  <li>Veranstaltungsvorhaben (optional)</li>
                  <li>Gewünschte Rückrufzeit (optional)</li>
                  <li>Veranstaltungsort (optional)</li>
                  <li>Nachricht (Pflichtfeld)</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)<br/>
                  <strong>Zweck:</strong> Bearbeitung Ihrer Anfrage und Kommunikation<br/>
                  <strong>Speicherdauer:</strong> 3 Jahre nach Abschluss der Korrespondenz
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Cookies und Tracking</h2>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  Diese Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät
                  speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
                </p>

                <h4 className="text-lg font-medium mb-2">Kategorien von Cookies:</h4>
                <div className="space-y-4">
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Erforderliche Cookies</h5>
                    <p className="text-muted-foreground text-sm">
                      Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
                      Sie speichern Ihre Cookie-Einstellungen und gewährleisten die sichere Nutzung der Website.
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Analytische Cookies</h5>
                    <p className="text-muted-foreground text-sm">
                      Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem sie
                      Informationen anonym sammeln und weiterleiten.
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Marketing Cookies</h5>
                    <p className="text-muted-foreground text-sm">
                      Diese Cookies werden verwendet, um Besuchern auf Webseiten zu folgen und Werbung zu schalten,
                      die relevant und ansprechend für den einzelnen Benutzer ist.
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Funktionale Cookies</h5>
                    <p className="text-muted-foreground text-sm">
                      Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung der Website.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-medium mb-3 mt-6 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Google Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Diese Website benutzt Google Analytics, einen Webanalysedienst der Google Ireland Limited.
                  Google Analytics verwendet ebenfalls Cookies, die eine Analyse der Benutzung der Website durch Sie ermöglichen.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)<br/>
                  <strong>Zweck:</strong> Analyse des Nutzerverhaltens, Verbesserung der Website<br/>
                  <strong>Speicherdauer:</strong> 26 Monate<br/>
                  <strong>Empfänger:</strong> Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Social Media und externe Dienste</h2>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Social Media Links</h3>
                <p className="text-muted-foreground mb-4">
                  Unsere Website enthält Links zu folgenden Social Media Plattformen:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                  <li>Instagram (Meta Platforms Ireland Limited)</li>
                  <li>Facebook (Meta Platforms Ireland Limited)</li>
                  <li>TikTok (TikTok Technology Limited)</li>
                  <li>SoundCloud (SoundCloud Limited)</li>
                </ul>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">WhatsApp Business</h3>
                <p className="text-muted-foreground mb-4">
                  Auf unserer Website haben Sie die Möglichkeit, uns über WhatsApp zu kontaktieren. Hierbei werden
                  Sie auf den externen Dienst WhatsApp der Meta Platforms Ireland Limited weitergeleitet.
                </p>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Ihre Rechte nach der DSGVO</h2>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium mb-2">Auskunftsrecht (Art. 15 DSGVO)</h4>
                    <p className="text-muted-foreground text-sm">
                      Sie haben das Recht, jederzeit von uns unentgeltliche Auskunft über die zu Ihrer Person
                      gespeicherten personenbezogenen Daten und eine Kopie dieser Daten zu erhalten.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">Berichtigungsrecht (Art. 16 DSGVO)</h4>
                    <p className="text-muted-foreground text-sm">
                      Sie haben das Recht, die Berichtigung unrichtiger oder die Vervollständigung
                      unvollständiger personenbezogener Daten zu verlangen.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">Löschungsrecht (Art. 17 DSGVO)</h4>
                    <p className="text-muted-foreground text-sm">
                      Sie haben das Recht, die unverzügliche Löschung Ihrer personenbezogenen Daten zu verlangen,
                      sofern einer der gesetzlichen Gründe zutrifft.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">Widerspruchsrecht (Art. 21 DSGVO)</h4>
                    <p className="text-muted-foreground text-sm">
                      Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
                      jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten Widerspruch einzulegen.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">Widerruf der Einwilligung</h4>
                    <p className="text-muted-foreground text-sm">
                      Haben Sie in die Verarbeitung Ihrer Daten eingewilligt, können Sie diese Einwilligung
                      jederzeit widerrufen. Durch den Widerruf wird die Rechtmäßigkeit der aufgrund der
                      Einwilligung erfolgten Verarbeitung nicht berührt.
                    </p>
                  </div>
                </div>
              </section>

              <section className="glass-card p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Kontakt und Beschwerderecht</h2>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Datenschutzbeauftragter</h3>
                <p className="text-muted-foreground mb-4">
                  Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten, bei Auskünften,
                  Berichtigung, Sperrung oder Löschung von Daten sowie Widerruf erteilter Einwilligungen wenden Sie
                  sich bitte an:
                </p>
                <div className="bg-secondary/20 p-4 rounded-lg mb-4">
                  <p className="mb-2"><strong>NION Events</strong></p>
                  <p className="mb-2">Datenschutz</p>
                  <p className="mb-2">Dobacher Str. 126</p>
                  <p className="mb-2">52146 Würselen</p>
                  <p className="mb-2"><strong>E-Mail:</strong> datenschutz@nion-events.de</p>
                </div>

                <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Beschwerderecht</h3>
                <p className="text-muted-foreground">
                  Sie haben das Recht, sich bei einer Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen
                  Daten durch uns zu beschweren. Zuständige Aufsichtsbehörde ist die Berliner Beauftragte für
                  Datenschutz und Informationsfreiheit.
                </p>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
  );
};

export default Datenschutz;