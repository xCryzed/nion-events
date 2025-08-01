import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setShowBanner(false);
  };

  const rejectAll = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t animate-slide-up">
      <div className="container mx-auto max-w-6xl">
        <div className="glass-card p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Cookie className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Cookie-Einstellungen</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
                Einige Cookies sind für die Funktionalität der Website erforderlich, während andere uns helfen, 
                die Nutzung zu analysieren und Inhalte zu personalisieren.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" onClick={acceptAll}>
                  Alle akzeptieren
                </Button>
                <Button variant="outline" size="sm" onClick={acceptEssential}>
                  Nur erforderliche
                </Button>
                <Button variant="ghost" size="sm" onClick={rejectAll}>
                  Alle ablehnen
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/datenschutz" className="text-xs">
                    Datenschutz
                  </a>
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={rejectAll}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;