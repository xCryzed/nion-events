import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Datenschutz = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Datenschutzerklärung</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Datenschutz auf einen Blick</h2>
              <h3 className="text-xl font-medium mb-2">Allgemeine Hinweise</h3>
              <p className="text-muted-foreground mb-4">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
                persönlich identifiziert werden können.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Allgemeine Hinweise und Pflichtinformationen</h2>
              <h3 className="text-xl font-medium mb-2">Datenschutz</h3>
              <p className="text-muted-foreground mb-4">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre 
                personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie 
                dieser Datenschutzerklärung.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Datenerfassung auf dieser Website</h2>
              <h3 className="text-xl font-medium mb-2">Kontaktformular</h3>
              <p className="text-muted-foreground mb-4">
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular 
                inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall 
                von Anschlussfragen bei uns gespeichert.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Diese Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät 
                speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Ihre Rechte</h2>
              <p className="text-muted-foreground mb-4">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer 
                gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung 
                oder Löschung dieser Daten zu verlangen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Kontakt</h2>
              <p className="text-muted-foreground">
                Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten, bei Auskünften, 
                Berichtigung, Sperrung oder Löschung von Daten wenden Sie sich bitte an uns über die im Impressum 
                angegebenen Kontaktdaten.
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