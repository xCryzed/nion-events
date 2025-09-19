import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { trackError } from '@/hooks/use-google-analytics';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users, Search, Filter, Eye, EyeOff } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';

interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  staff_category: string;
  status: string;
  notes: string | null;
  created_at: string;
  internal_events: {
    id: string;
    title: string;
    event_date: string;
    end_date: string | null;
    location: string;
    guest_count: number | null;
    description: string | null;
    status: string;
    staff_requirements: any[];
    pricing_structure: any[];
    notes: string | null;
  };
}

const MeineEvents = () => {
  const [user, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [categoryFilter, setCategoryFilter] = useState('alle');
  const [activeTab, setActiveTab] = useState('upcoming');
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchMyEvents(session.user.id);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMyEvents(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMyEvents = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          user_id,
          event_id,
          staff_category,
          status,
          notes,
          created_at,
          internal_events (
            id,
            title,
            event_date,
            end_date,
            location,
            guest_count,
            description,
            status,
            staff_requirements,
            pricing_structure,
            notes
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistrations(data as EventRegistration[] || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      trackError(error.message, 'data_fetch', 'meine_events', { user_id: userId });
      toast({
        title: "Fehler beim Laden",
        description: "Die Events konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = registrations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.internal_events.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.internal_events.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'alle') {
      filtered = filtered.filter(reg => reg.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'alle') {
      filtered = filtered.filter(reg => reg.staff_category === categoryFilter);
    }

    // Filter by time (past/upcoming)
    const now = new Date();
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(reg => isAfter(new Date(reg.internal_events.event_date), now));
    } else if (activeTab === 'past') {
      filtered = filtered.filter(reg => isBefore(new Date(reg.internal_events.event_date), now));
    }

    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm, statusFilter, categoryFilter, activeTab]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'angemeldet': { label: 'Angemeldet', variant: 'default' as const },
      'bestätigt': { label: 'Bestätigt', variant: 'default' as const },
      'abgemeldet': { label: 'Abgemeldet', variant: 'secondary' as const },
      'abgeschlossen': { label: 'Abgeschlossen', variant: 'outline' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getEventStatusBadge = (status: string) => {
    const statusMap = {
      'geplant': { label: 'Geplant', variant: 'default' as const },
      'bestätigt': { label: 'Bestätigt', variant: 'default' as const },
      'laufend': { label: 'Läuft', variant: 'destructive' as const },
      'abgeschlossen': { label: 'Abgeschlossen', variant: 'outline' as const },
      'abgesagt': { label: 'Abgesagt', variant: 'secondary' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap = {
      'dj': 'DJ',
      'techniker': 'Techniker',
      'fotograf': 'Fotograf',
      'kameramann': 'Kameramann',
      'lichtoperator': 'Lichtoperator',
      'aufbau': 'Aufbau',
      'service': 'Service'
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  const formatEventDate = (dateStr: string, endDateStr?: string) => {
    const date = new Date(dateStr);
    const endDate = endDateStr ? new Date(endDateStr) : null;
    
    if (endDate && format(date, 'yyyy-MM-dd') !== format(endDate, 'yyyy-MM-dd')) {
      return `${format(date, 'dd.MM.yyyy', { locale: de })} - ${format(endDate, 'dd.MM.yyyy', { locale: de })}`;
    }
    return format(date, 'dd.MM.yyyy', { locale: de });
  };

  const formatEventTime = (dateStr: string, endDateStr?: string) => {
    const date = new Date(dateStr);
    const endDate = endDateStr ? new Date(endDateStr) : null;
    
    if (endDate) {
      return `${format(date, 'HH:mm')} - ${format(endDate, 'HH:mm')} Uhr`;
    }
    return `ab ${format(date, 'HH:mm')} Uhr`;
  };

  const upcomingEvents = registrations.filter(reg => isAfter(new Date(reg.internal_events.event_date), new Date()));
  const pastEvents = registrations.filter(reg => isBefore(new Date(reg.internal_events.event_date), new Date()));

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <p>Bitte melden Sie sich an, um Ihre Events zu sehen.</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Meine Events</h1>
            <p className="text-muted-foreground">
              Übersicht über alle Events, für die Sie sich angemeldet haben.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                    <p className="text-sm text-muted-foreground">Anstehende Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pastEvents.length}</p>
                    <p className="text-sm text-muted-foreground">Vergangene Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{registrations.length}</p>
                    <p className="text-sm text-muted-foreground">Gesamt Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nach Event oder Ort suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Status</SelectItem>
                    <SelectItem value="angemeldet">Angemeldet</SelectItem>
                    <SelectItem value="bestätigt">Bestätigt</SelectItem>
                    <SelectItem value="abgemeldet">Abgemeldet</SelectItem>
                    <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Kategorie filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Kategorien</SelectItem>
                    <SelectItem value="dj">DJ</SelectItem>
                    <SelectItem value="techniker">Techniker</SelectItem>
                    <SelectItem value="fotograf">Fotograf</SelectItem>
                    <SelectItem value="kameramann">Kameramann</SelectItem>
                    <SelectItem value="lichtoperator">Lichtoperator</SelectItem>
                    <SelectItem value="aufbau">Aufbau</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Events Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upcoming">Anstehende Events ({upcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="past">Vergangene Events ({pastEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Events werden geladen...</p>
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {activeTab === 'upcoming' ? 'Keine anstehenden Events gefunden.' : 'Keine vergangenen Events gefunden.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <Card key={registration.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-foreground">
                                {registration.internal_events.title}
                              </h3>
                              {getEventStatusBadge(registration.internal_events.status)}
                              {getStatusBadge(registration.status)}
                              <Badge variant="outline">{getCategoryLabel(registration.staff_category)}</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatEventDate(registration.internal_events.event_date, registration.internal_events.end_date || undefined)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatEventTime(registration.internal_events.event_date, registration.internal_events.end_date || undefined)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{registration.internal_events.location}</span>
                              </div>
                            </div>

                            {registration.internal_events.guest_count && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>ca. {registration.internal_events.guest_count} Gäste</span>
                              </div>
                            )}

                            {registration.notes && (
                              <div className="mt-3 p-3 bg-muted rounded-lg">
                                <p className="text-sm"><strong>Meine Notizen:</strong> {registration.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="past">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Events werden geladen...</p>
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Keine vergangenen Events gefunden.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <Card key={registration.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-foreground">
                                {registration.internal_events.title}
                              </h3>
                              {getEventStatusBadge(registration.internal_events.status)}
                              {getStatusBadge(registration.status)}
                              <Badge variant="outline">{getCategoryLabel(registration.staff_category)}</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatEventDate(registration.internal_events.event_date, registration.internal_events.end_date || undefined)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatEventTime(registration.internal_events.event_date, registration.internal_events.end_date || undefined)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{registration.internal_events.location}</span>
                              </div>
                            </div>

                            {registration.internal_events.guest_count && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>ca. {registration.internal_events.guest_count} Gäste</span>
                              </div>
                            )}

                            {registration.notes && (
                              <div className="mt-3 p-3 bg-muted rounded-lg">
                                <p className="text-sm"><strong>Meine Notizen:</strong> {registration.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MeineEvents;