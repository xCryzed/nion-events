import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie, Settings } from 'lucide-react';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }

    // Listen for cookie settings open event
    const handleCookieSettingsOpen = () => {
      setShowBanner(true);
      setShowSettings(true);
    };

    window.addEventListener('cookieSettingsOpen', handleCookieSettingsOpen);
    return () => window.removeEventListener('cookieSettingsOpen', handleCookieSettingsOpen);
  }, []);

  const acceptAll = () => {
    const allPreferences = { essential: true, analytics: true, marketing: true, functional: true };
    localStorage.setItem('cookieConsent', JSON.stringify(allPreferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptEssential = () => {
    const essentialOnly = { essential: true, analytics: false, marketing: false, functional: false };
    localStorage.setItem('cookieConsent', JSON.stringify(essentialOnly));
    setShowBanner(false);
    setShowSettings(false);
  };

  const rejectAll = () => {
    const rejected = { essential: true, analytics: false, marketing: false, functional: false };
    localStorage.setItem('cookieConsent', JSON.stringify(rejected));
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const handlePreferenceChange = (type: keyof typeof preferences) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
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
              {!showSettings ? (
                <>
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
                    <Button variant="ghost" size="sm" onClick={openSettings}>
                      <Settings className="w-4 h-4 mr-2" />
                      Einstellungen
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href="/datenschutz" className="text-xs">
                        Datenschutz
                      </a>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold mb-4">Cookie-Einstellungen verwalten</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Erforderliche Cookies</h4>
                        <p className="text-xs text-muted-foreground">Notwendig für die Grundfunktionen der Website</p>
                      </div>
                      <div className="text-xs text-muted-foreground">Immer aktiv</div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Analytische Cookies</h4>
                        <p className="text-xs text-muted-foreground">Helfen uns, die Website-Nutzung zu verstehen</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('analytics')}
                        className={`w-10 h-6 rounded-full ${preferences.analytics ? 'bg-primary' : 'bg-gray-300'} relative transition-colors`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${preferences.analytics ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Marketing Cookies</h4>
                        <p className="text-xs text-muted-foreground">Für personalisierte Werbung und Inhalte</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('marketing')}
                        className={`w-10 h-6 rounded-full ${preferences.marketing ? 'bg-primary' : 'bg-gray-300'} relative transition-colors`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${preferences.marketing ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Funktionale Cookies</h4>
                        <p className="text-xs text-muted-foreground">Erweiterte Website-Funktionen und Personalisierung</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('functional')}
                        className={`w-10 h-6 rounded-full ${preferences.functional ? 'bg-primary' : 'bg-gray-300'} relative transition-colors`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${preferences.functional ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" onClick={savePreferences}>
                      Einstellungen speichern
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                      Zurück
                    </Button>
                  </div>
                </>
              )}
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