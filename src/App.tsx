import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useGoogleAnalytics, trackPageView } from "@/hooks/use-google-analytics";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useEffect } from "react";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";
import Datenschutz from "./pages/Datenschutz";
import Impressum from "./pages/Impressum";
import AGB from "./pages/AGB";
import Presse from "./pages/Presse";
import Auth from "./pages/Auth";
import Administration from "./pages/Administration";
import Angebot from "./pages/Angebot";
import MeineAngebote from "./pages/MeineAngebote";
import AnstehendeEvents from "./pages/AnstehendeEvents";
import PersonaldatenStepper from "./pages/PersonaldatenStepper";

const queryClient = new QueryClient();

const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when location changes
    const pageTitles: { [key: string]: string } = {
      '/': 'DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events',
      '/angebot': 'Angebot anfordern - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events',
      '/portfolio': 'Portfolio - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events',
      '/presse': 'Presse - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events',
      '/impressum': 'Impressum - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events',
      '/datenschutz': 'Datenschutz - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events',
      '/agb': 'AGB - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events',
      '/anmelden': 'Anmelden - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events Kundenbereich',
      '/meine-angebote': 'Meine Angebote - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events Kundenbereich',
      '/anstehende-events': 'Anstehende Events - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events Mitarbeiterbereich',
      '/personaldaten': 'Personaldaten - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events Mitarbeiterbereich',
      '/administration': 'Administration - DJ Aachen & Eventtechnik | Hochzeiten, Firmenfeiern & Partys | NION Events Mitarbeiterbereich'
    };

    const title = pageTitles[location.pathname] || `${location.pathname} | NION Events`;
    trackPageView(location.pathname, title);
  }, [location]);

  return null;
};

const App = () => {
  return (
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
  );
};

const AppContent = () => {
  useGoogleAnalytics();

  return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PageTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/angebot" element={<Angebot />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/presse" element={<Presse />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/agb" element={<AGB />} />
              <Route path="/anmelden" element={<Auth />} />
              <Route path="/meine-angebote" element={<MeineAngebote />} />
              <Route path="/anstehende-events" element={<AnstehendeEvents />} />
              <Route path="/personaldaten" element={<PersonaldatenStepper />} />
              <Route path="/administration" element={<Administration />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
  );
};

export default App;