import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Impressum = () => {
  useEffect(() => {
    document.title = "Impressum - DJ Aachen & Eventtechnik | NION Events";
  }, []);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Impressum</h1>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="glass-card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Angaben gemäß § 5 TMG
              </h2>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
                <p className="mb-2 text-lg">
                  <strong className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    NION Events
                  </strong>
                </p>
                <p className="mb-2">Geschäftsführung: Nino Bergen</p>
                <p className="mb-2">Dobacher Str. 126</p>
                <p className="mb-2">52146 Würselen</p>
                <p className="mb-2">Deutschland</p>
              </div>
            </section>

            <section className="glass-card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Kontakt
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Telefon
                  </h3>
                  <p className="text-foreground">+49 1575 2046096</p>
                  <p className="text-sm text-muted-foreground">
                    Montag - Freitag: 9:00 - 18:00 Uhr
                  </p>
                </div>
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    E-Mail
                  </h3>
                  <p className="text-foreground">info@nion-events.de</p>
                  <p className="text-sm text-muted-foreground">
                    Antwort innerhalb von 24 Stunden
                  </p>
                </div>
              </div>
            </section>

            <section className="glass-card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Berufsbezeichnung und berufsrechtliche Regelungen
              </h2>
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Berufsbezeichnung:</h4>
                <p className="text-muted-foreground mb-4">
                  Eventmanagement, DJ-Services, Technikverleih
                </p>
                <h4 className="font-semibold mb-2">Zuständige Kammer:</h4>
                <p className="text-muted-foreground">
                  Industrie- und Handelskammer Aachen
                </p>
              </div>
            </section>

            <section className="glass-card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </h2>
              <div className="bg-secondary/20 p-4 rounded-lg">
                <p className="mb-2">
                  <strong>Nino Bergen</strong>
                </p>
                <p className="mb-2">Dobacher Str. 126</p>
                <p className="mb-2">52146 Würselen</p>
                <p className="mb-2">Deutschland</p>
              </div>
            </section>

            <section className="glass-card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                EU-Streitschlichtung
              </h2>
              <p className="text-muted-foreground mb-4">
                Die Europäische Kommission stellt eine Plattform zur
                Online-Streitbeilegung (OS) bereit:
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-accent transition-colors ml-1"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="text-muted-foreground">
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </section>

            <section className="glass-card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Verbraucherstreitbeilegung/Universalschlichtungsstelle
              </h2>
              <p className="text-muted-foreground mb-4">
                Wir sind nicht bereit oder verpflichtet, an
                Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section className="glass-card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Haftungsausschluss
              </h2>

              <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Haftung für Inhalte
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
                Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                Diensteanbieter jedoch nicht unter der Verpflichtung,
                übermittelte oder gespeicherte fremde Informationen zu
                überwachen oder nach Umständen zu forschen, die auf eine
                rechtswidrige Tätigkeit hinweisen.
              </p>
              <p className="text-muted-foreground mb-4">
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
                Informationen nach den allgemeinen Gesetzen bleiben hiervon
                unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
                Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
              </p>

              <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Haftung für Links
              </h3>
              <p className="text-muted-foreground mb-4">
                Unser Angebot enthält Links zu externen Websites Dritter, auf
                deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
                diese fremden Inhalte auch keine Gewähr übernehmen. Für die
                Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
                oder Betreiber der Seiten verantwortlich.
              </p>
              <p className="text-muted-foreground mb-4">
                Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
                mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren
                zum Zeitpunkt der Verlinkung nicht erkennbar.
              </p>

              <h3 className="text-xl font-medium mb-3 text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Urheberrecht
              </h3>
              <p className="text-muted-foreground">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
                diesen Seiten unterliegen dem deutschen Urheberrecht. Die
                Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
                Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
                schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impressum;
