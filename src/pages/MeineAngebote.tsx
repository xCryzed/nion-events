import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Badge, Timer, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface EventRequest {
  id: string;
  event_title: string;
  event_date: string;
  location: string;
  guest_count: string;
  status: 'ANGEFRAGT' | 'IN_BEARBEITUNG' | 'ABGESCHLOSSEN';
  offer_number: string;
  created_at: string;
  tech_requirements: string[];
  dj_genres: string[];
  photographer: boolean;
  videographer: boolean;
  light_operator: boolean;
  additional_wishes?: string;
  contact_phone: string;
}

const MeineAngebote = () => {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth';
        return;
      }
      setUser(user);
      fetchRequests(user.id);
    };

    checkUser();
  }, []);

  // Update timer every minute for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async (userId: string) => {
    try {
      // Get user details to check email verification and get email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if email is verified
      const isEmailVerified = !!user.email_confirmed_at;

      // First, get requests by user_id
      const { data: userRequests, error: userError } = await supabase
          .from('event_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

      if (userError) throw userError;

      let allRequests = userRequests || [];

      // If email is verified, also look for requests by email that don't have a user_id
      if (isEmailVerified && user.email) {
        const { data: emailRequests, error: emailError } = await supabase
            .from('event_requests')
            .select('*')
            .eq('contact_email', user.email)
            .is('user_id', null)
            .order('created_at', { ascending: false });

        if (!emailError && emailRequests && emailRequests.length > 0) {
          // Update these requests to link them to the current user
          const requestIds = emailRequests.map(req => req.id);
          const { error: updateError } = await supabase
              .from('event_requests')
              .update({ user_id: userId })
              .in('id', requestIds);

          if (!updateError) {
            // Add the updated requests to our list
            const updatedRequests = emailRequests.map(req => ({ ...req, user_id: userId }));
            allRequests = [...allRequests, ...updatedRequests];

            // Sort by created_at again
            allRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            toast({
              title: 'Anfragen verknüpft',
              description: `${emailRequests.length} bestehende Anfrage(n) wurden mit Ihrem Account verknüpft.`,
            });
          }
        }
      }

      setRequests(allRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Fehler beim Laden',
        description: 'Ihre Anfragen konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ANGEFRAGT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_BEARBEITUNG':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ABGESCHLOSSEN':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ANGEFRAGT':
        return <Info className="w-4 h-4" />;
      case 'IN_BEARBEITUNG':
        return <Loader2 className="w-4 h-4" />;
      case 'ABGESCHLOSSEN':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const calculateTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const hoursElapsed = (currentTime.getTime() - created.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, 24 - hoursElapsed);

    const hours = Math.floor(hoursRemaining);
    const minutes = Math.floor((hoursRemaining - hours) * 60);

    return {
      display: `${hours}h ${minutes}m`,
      expired: hoursRemaining === 0,
      isUrgent: hoursRemaining <= 2 // Mark as urgent if less than 2 hours remaining
    };
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

  return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-display mb-6">
                  Meine <span className="text-gradient">Angebote</span>
                </h1>
                <p className="text-body-large text-muted-foreground">
                  Verfolgen Sie den Status Ihrer Angebotsanfragen
                </p>
              </div>

              {requests.length === 0 ? (
                  <Card className="glass-card text-center py-12">
                    <CardContent>
                      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-title mb-2">Keine Anfragen gefunden</h3>
                      <p className="text-muted-foreground mb-6">
                        Sie haben noch keine Angebotsanfragen gestellt.
                      </p>
                      <Button onClick={() => window.location.href = '/angebot'} className="btn-hero">
                        Angebot anfordern
                      </Button>
                    </CardContent>
                  </Card>
              ) : (
                  <div className="space-y-6">
                    {requests.map((request) => (
                        <Card key={request.id} className="glass-card">
                          <CardHeader>
                            <div className="flex flex-col space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-title mb-2">
                                    {request.event_title}
                                  </CardTitle>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Badge className="w-4 h-4 mr-2" />
                                {request.offer_number}
                              </span>
                                    <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                      {format(new Date(request.event_date), 'dd. MMMM yyyy', { locale: de })}
                              </span>
                                  </div>
                                </div>

                                <div className="flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span>{request.status.replace('_', ' ')}</span>
                            </span>
                                </div>
                              </div>

                              {(request.status === 'ANGEFRAGT' || request.status === 'IN_BEARBEITUNG') && (() => {
                                const timeInfo = calculateTimeRemaining(request.created_at);
                                return (
                                    <div className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3 border-l-4 border-primary/20">
                                      <div className="flex items-center space-x-3">
                                        <Timer className={`w-5 h-5 ${timeInfo.isUrgent ? 'text-destructive' : timeInfo.expired ? 'text-muted-foreground' : 'text-primary'}`} />
                                        <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground font-medium">
                                    Antwortzeit verbleibend
                                  </span>
                                          <span className={`text-sm font-semibold ${timeInfo.isUrgent ? 'text-destructive' : timeInfo.expired ? 'text-muted-foreground' : 'text-foreground'}`}>
                                    {timeInfo.display}
                                  </span>
                                        </div>
                                      </div>
                                      <div className="text-xs text-muted-foreground hidden sm:block">
                                        24h Service-Garantie
                                      </div>
                                    </div>
                                );
                              })()}
                            </div>
                          </CardHeader>

                          <CardContent>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground">Event Details</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center text-sm">
                                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span>{request.location}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span>{request.guest_count === 'Noch nicht bekannt' ? request.guest_count : `${request.guest_count} Gäste`}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span>Angefragt am {format(new Date(request.created_at), 'dd.MM.yyyy', { locale: de })}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground">Gewünschte Technik</h4>
                                <div className="flex flex-wrap gap-2">
                                  {request.tech_requirements.map((tech, index) => (
                                      <span key={index} className="bg-muted/50 text-xs px-2 py-1 rounded">
                                {tech}
                              </span>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground">Services</h4>
                                <div className="space-y-1 text-sm">
                                  {request.photographer && <span className="block">📷 Fotograf</span>}
                                  {request.videographer && <span className="block">🎥 Videograf</span>}
                                  {request.light_operator && <span className="block">💡 Lichtoperator</span>}
                                  {request.dj_genres.length > 0 && (
                                      <span className="block">🎵 {request.dj_genres.join(', ')}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {request.additional_wishes && (
                                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Zusatzwünsche</h4>
                                  <p className="text-sm">{request.additional_wishes}</p>
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

export default MeineAngebote;