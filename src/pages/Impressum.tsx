import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Impressum = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Impressum</h1>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
              <div className="glass-card p-6 rounded-lg">
                <p className="mb-2"><strong>NION Events</strong></p>
                <p className="mb-2">Musterstraße 123</p>
                <p className="mb-2">10115 Berlin</p>
                <p className="mb-2">Deutschland</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>
              <div className="glass-card p-6 rounded-lg">
                <p className="mb-2"><strong>Telefon:</strong> +49 1575 2046096</p>
                <p className="mb-2"><strong>E-Mail:</strong> info@nion-events.de</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Geschäftsführung</h2>
              <div className="glass-card p-6 rounded-lg">
                <p>Max Mustermann</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Handelsregister</h2>
              <div className="glass-card p-6 rounded-lg">
                <p className="mb-2"><strong>Registergericht:</strong> Amtsgericht Berlin</p>
                <p className="mb-2"><strong>Registernummer:</strong> HRB 12345</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Umsatzsteuer-ID</h2>
              <div className="glass-card p-6 rounded-lg">
                <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:</p>
                <p><strong>DE123456789</strong></p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <div className="glass-card p-6 rounded-lg">
                <p className="mb-2">Max Mustermann</p>
                <p className="mb-2">Musterstraße 123</p>
                <p>10115 Berlin</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Haftungsausschluss</h2>
              <h3 className="text-xl font-medium mb-2">Haftung für Inhalte</h3>
              <p className="text-muted-foreground mb-4">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
                allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
                Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>

              <h3 className="text-xl font-medium mb-2">Haftung für Links</h3>
              <p className="text-muted-foreground">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
                Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
                verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
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