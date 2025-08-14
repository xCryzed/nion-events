import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Mail, Phone, Building, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
}

const ContactRequestsTab = () => {
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchContactRequests();
  }, []);

  const fetchContactRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contact requests:', error);
        toast({
          title: "Fehler beim Laden",
          description: "Die Kontaktanfragen konnten nicht geladen werden.",
          variant: "destructive"
        });
        return;
      }

      setContactRequests(data || []);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    const eventTypes: { [key: string]: string } = {
      'hochzeit': 'Hochzeit',
      'firmenveranstaltung': 'Firmenveranstaltung',
      'konferenz': 'Konferenz',
      'gala': 'Gala-Event',
      'geburtstag': 'Geburtstag',
      'abschlussfeier': 'Abschlussfeier',
      'abiball': 'Abiball',
      'produktpräsentation': 'Produktpräsentation',
      'messe': 'Messe',
      'sonstiges': 'Sonstiges'
    };
    return eventTypes[eventType] || eventType;
  };

  const getCallbackTimeLabel = (callbackTime: string) => {
    const callbackTimes: { [key: string]: string } = {
      'morgens': 'Morgens (08:00 - 12:00 Uhr)',
      'mittags': 'Mittags (12:00 - 15:00 Uhr)',
      'nachmittags': 'Nachmittags (15:00 - 18:00 Uhr)',
      'abends': 'Abends (18:00 - 20:00 Uhr)',
      'wochenende': 'Am Wochenende',
      'flexibel': 'Flexibel'
    };
    return callbackTimes[callbackTime] || callbackTime;
  };

  return (
    <div className="space-y-6">
      {contactRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Kontaktanfragen vorhanden.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {contactRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{request.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: de })}
                    </CardDescription>
                  </div>
                  {request.event_type && (
                    <Badge variant="secondary">
                      {getEventTypeLabel(request.event_type)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${request.email}`} className="text-primary hover:underline">
                        {request.email}
                      </a>
                    </div>
                    {request.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${request.phone}`} className="text-primary hover:underline">
                          {request.phone}
                        </a>
                      </div>
                    )}
                    {request.mobile && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${request.mobile}`} className="text-primary hover:underline">
                          {request.mobile} (Mobil)
                        </a>
                      </div>
                    )}
                    {request.company && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{request.company}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {request.venue && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{request.venue}</span>
                      </div>
                    )}
                    {request.callback_time && (
                      <div className="text-sm">
                        <span className="font-medium">Rückruf gewünscht:</span>{' '}
                        {getCallbackTimeLabel(request.callback_time)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Nachricht:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {request.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactRequestsTab;