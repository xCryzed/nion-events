import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      {/* Main 404 Content */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-destructive rounded-full mr-3 animate-pulse"></span>
              <span className="text-sm font-medium">Seite nicht gefunden</span>
            </div>

            {/* 404 Display */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-display text-gradient mb-4">404</h1>
              <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mb-8"></div>
            </div>

            {/* Error Message */}
            <div className="mb-12 animate-fade-in-up">
              <h2 className="text-headline mb-6">
                Diese Seite konnte nicht gefunden werden
              </h2>
              <p className="text-body-large text-muted-foreground max-w-2xl mx-auto mb-4">
                Die angeforderte Seite <span className="text-primary font-mono bg-muted px-2 py-1 rounded">{location.pathname}</span> existiert nicht oder wurde verschoben.
              </p>
              <p className="text-body text-muted-foreground max-w-xl mx-auto">
                Möglicherweise haben Sie einen veralteten Link verwendet oder sich bei der URL vertippt.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
              <Link to="/">
                <Button className="btn-hero group">
                  <Home className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                  Zur Startseite
                </Button>
              </Link>

              <Button
                variant="outline"
                className="group bg-transparent border-border/50 hover:bg-card/50 backdrop-blur-sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Zurück
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="mt-16 glass-card p-8 max-w-2xl mx-auto animate-scale-in">
              <h3 className="text-title mb-6">Beliebte Seiten</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/"
                  onClick={() => {
                    setTimeout(() => {
                      const target = document.getElementById('services');
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="flex items-center p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary/30 transition-colors">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Unsere Leistungen</div>
                    <div className="text-sm text-muted-foreground">Event Services entdecken</div>
                  </div>
                </Link>

                <Link
                  to="/"
                  onClick={() => {
                    setTimeout(() => {
                      const target = document.getElementById('contact');
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="flex items-center p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-accent/30 transition-colors">
                    <Search className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Kontakt</div>
                    <div className="text-sm text-muted-foreground">Projekt besprechen</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NotFound;