import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Badge,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  company?: string;
  event_type?: string;
  callback_time?: string;
  venue?: string;
  message: string;
  created_at: string;
  status?: string;
  response_message?: string;
  responded_at?: string;
}

const MeineAnfragen = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title =
      "Meine Anfragen - DJ Aachen & Eventtechnik | NION Events Kundenbereich";
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/anmelden";
        return;
      }
      setUser(user);
      fetchRequests(user);
    };

    checkUser();
  }, []);

  const fetchRequests = async (user: any) => {
    try {
      // Check if email is verified
      const isEmailVerified = !!user.email_confirmed_at;

      if (!isEmailVerified) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Fetch contact requests by email
      const { data: contactRequests, error } = await supabase
        .from("contact_requests")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(contactRequests || []);

      if (contactRequests && contactRequests.length > 0) {
        toast({
          title: "Anfragen geladen",
          description: `${contactRequests.length} Kontaktanfrage(n) gefunden.`,
        });
      }
    } catch (error) {
      console.error("Error fetching contact requests:", error);
      toast({
        title: "Fehler beim Laden",
        description: "Ihre Kontaktanfragen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeLabel = (eventType?: string) => {
    const labels: { [key: string]: string } = {
      hochzeit: "Hochzeit",
      geburtstag: "Geburtstag",
      firmenfeier: "Firmenfeier",
      jubilaeum: "Jubiläum",
      sonstige: "Sonstige Feier",
    };
    return eventType ? labels[eventType] || eventType : "Nicht angegeben";
  };

  const getCallbackTimeLabel = (callbackTime?: string) => {
    const labels: { [key: string]: string } = {
      sofort: "Sofort",
      heute: "Heute",
      morgen: "Morgen",
      "diese-woche": "Diese Woche",
      "naechste-woche": "Nächste Woche",
    };
    return callbackTime
      ? labels[callbackTime] || callbackTime
      : "Nicht angegeben";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Lade Ihre Anfragen...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-title mb-2">
                    E-Mail-Bestätigung erforderlich
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Um Ihre Kontaktanfragen einsehen zu können, müssen Sie
                    zunächst Ihre E-Mail-Adresse bestätigen. Bitte überprüfen
                    Sie Ihr E-Mail-Postfach und klicken Sie auf den
                    Bestätigungslink.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-display mb-6">
                Meine <span className="text-gradient">Anfragen</span>
              </h1>
              <p className="text-body-large text-muted-foreground">
                Übersicht über Ihre Kontaktanfragen
              </p>
            </div>

            {requests.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-title mb-2">Keine Anfragen gefunden</h3>
                  <p className="text-muted-foreground mb-6">
                    Sie haben noch keine Kontaktanfragen gestellt oder Ihre
                    E-Mail-Adresse ist noch nicht bestätigt.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/#contact")}
                    className="btn-hero"
                  >
                    Kontakt aufnehmen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {requests.map((request) => (
                  <Card key={request.id} className="glass-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-title mb-2">
                            Kontaktanfrage vom{" "}
                            {format(
                              new Date(request.created_at),
                              "dd. MMMM yyyy",
                              { locale: de },
                            )}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Badge className="w-4 h-4 mr-2" />
                              ID: {request.id}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {format(new Date(request.created_at), "HH:mm", {
                                locale: de,
                              })}{" "}
                              Uhr
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            Kontaktdaten
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span>{request.email}</span>
                            </div>
                            {request.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span>{request.phone}</span>
                              </div>
                            )}
                            {request.mobile && (
                              <div className="flex items-center text-sm">
                                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span>{request.mobile} (Mobil)</span>
                              </div>
                            )}
                            {request.company && (
                              <div className="flex items-center text-sm">
                                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span>{request.company}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            Event Details
                          </h4>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">Art:</span>{" "}
                              <span>
                                {getEventTypeLabel(request.event_type)}
                              </span>
                            </div>
                            {request.venue && (
                              <div className="flex items-center text-sm">
                                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span>{request.venue}</span>
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="font-medium">Rückruf:</span>{" "}
                              <span>
                                {getCallbackTimeLabel(request.callback_time)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-1 space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            Status
                          </h4>
                          <div className="space-y-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                request.status === "geantwortet"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {request.status === "geantwortet"
                                ? "Beantwortet"
                                : "Eingegangen"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {request.message && (
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">
                            Nachricht
                          </h4>
                          <p className="text-sm whitespace-pre-wrap">
                            {request.message}
                          </p>
                        </div>
                      )}

                      {request.response_message && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-sm text-green-800 mb-2">
                            Antwort von NION Events
                          </h4>
                          <p className="text-sm text-green-700 whitespace-pre-wrap">
                            {request.response_message}
                          </p>
                          {request.responded_at && (
                            <p className="text-xs text-green-600 mt-2">
                              Beantwortet am:{" "}
                              {format(
                                new Date(request.responded_at),
                                "dd. MMMM yyyy, HH:mm",
                                { locale: de },
                              )}{" "}
                              Uhr
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MeineAnfragen;
