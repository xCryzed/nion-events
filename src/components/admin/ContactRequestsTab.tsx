import { useState, useEffect } from 'react';
import { trackError } from '@/hooks/use-google-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Mail, Phone, Building, Calendar, MapPin, MessageSquare, Reply, Send } from 'lucide-react';
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
  status?: string;
  response_message?: string;
  responded_at?: string;
  responded_by?: string;
}

const ContactRequestsTab = () => {
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
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
        trackError(error.message, 'data_fetch', 'contact_requests_tab', {
          query_type: 'fetch_all_contact_requests'
        });
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
      trackError(error instanceof Error ? error : 'Contact requests fetch failed', 'data_fetch', 'contact_requests_tab');
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'eingegangen':
        return 'default';
      case 'geantwortet':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'eingegangen':
        return 'Eingegangen';
      case 'geantwortet':
        return 'Beantwortet';
      default:
        return status;
    }
  };

  const handleOpenResponse = (request: ContactRequest) => {
    setSelectedRequest(request);
    setResponseMessage('');
    setIsDialogOpen(true);
  };

  const handleSendResponse = async () => {
    if (!selectedRequest || !responseMessage.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Antwort ein.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-response', {
        body: {
          requestId: selectedRequest.id,
          responseMessage: responseMessage.trim(),
          customerName: selectedRequest.name,
          customerEmail: selectedRequest.email
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Antwort gesendet",
        description: "Die Antwort wurde erfolgreich an den Kunden gesendet.",
      });

      setIsDialogOpen(false);
      fetchContactRequests(); // Refresh the list
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Fehler beim Senden",
        description: "Die Antwort konnte nicht gesendet werden.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
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
                    <CardTitle className="text-lg flex items-center gap-2">
                      {request.name}
                      <Badge variant="outline" className="text-xs font-mono" title={request.id}>
                        ID: {request.id}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: de })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(request.status || 'eingegangen')}>
                      {getStatusLabel(request.status || 'eingegangen')}
                    </Badge>
                    {request.event_type && (
                      <Badge variant="secondary">
                        {getEventTypeLabel(request.event_type)}
                      </Badge>
                    )}
                  </div>
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
                
                {request.response_message && (
                  <div className="pt-4 border-t bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Antwort gesendet:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">
                      {request.response_message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.responded_at && `Gesendet am: ${formatDistanceToNow(new Date(request.responded_at), { addSuffix: true, locale: de })}`}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t flex justify-end">
                  <Button 
                    variant={request.status === 'geantwortet' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleOpenResponse(request)}
                    className="flex items-center gap-2"
                  >
                    <Reply className="h-4 w-4" />
                    {request.status === 'geantwortet' ? 'Erneut antworten' : 'Antworten'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Antwort auf Kontaktanfrage</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Antwort an {selectedRequest.name} ({selectedRequest.email})
                  <br />
                  <span className="font-mono text-xs">ID: {selectedRequest.id}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Ursprüngliche Nachricht:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedRequest.message}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Ihre Antwort:</label>
                <Textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Geben Sie hier Ihre Antwort ein..."
                  rows={6}
                  className="w-full"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSendResponse} disabled={isSending || !responseMessage.trim()}>
              {isSending ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-spin" />
                  Senden...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Antwort senden
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactRequestsTab;