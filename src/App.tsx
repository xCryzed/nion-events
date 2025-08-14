import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useGoogleAnalytics } from "@/hooks/use-google-analytics";
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

const queryClient = new QueryClient();

const App = () => {
  useGoogleAnalytics();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/agb" element={<AGB />} />
            <Route path="/presse" element={<Presse />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/administration" element={<Administration />} />
            <Route path="/angebot" element={<Angebot />} />
            <Route path="/meine-angebote" element={<MeineAngebote />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;