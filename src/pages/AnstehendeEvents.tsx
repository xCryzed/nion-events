import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, Users, UserPlus, UserMinus, Info, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Event {
    id: string;
    title: string;
    start: string;
    end?: string;
    backgroundColor?: string;
    borderColor?: string;
    extendedProps?: {
        location?: string;
        guestCount?: number;
        description?: string;
        staffRequirements?: Array<{
            category: string;
            count: number;
            filled: number;
        }>;
        status?: string;
        notes?: string;
    };
}

interface EventRegistration {
    id: string;
    event_id: string;
    user_id: string;
    staff_category: string;
    status: string;
    notes?: string;
    created_at: string;
    profiles?: {
        first_name: string;
        last_name: string;
    };
}

const AnstehendeEvents = () => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isEmployee, setIsEmployee] = useState(false);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
    const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([]);
    const [showEventDialog, setShowEventDialog] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 5;

    // Tab and filter state
    const [activeTab, setActiveTab] = useState('calendar');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');

    // Demo events data - 15 upcoming events
    const demoEvents: Event[] = [
        {
            id: '1',
            title: 'Hochzeit Müller',
            start: '2025-08-20T18:00:00',
            end: '2025-08-21T02:00:00',
            backgroundColor: '#22c55e',
            borderColor: '#16a34a',
            extendedProps: {
                location: 'Hotel Zur Post, München',
                guestCount: 120,
                description: 'Hochzeitsfeier mit DJ und Lichtshow'
            }
        },
        {
            id: '2',
            title: 'Firmenfeier TechCorp',
            start: '2025-08-25T19:00:00',
            end: '2025-08-25T23:30:00',
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            extendedProps: {
                location: 'Eventlocation Maximilianstraße',
                guestCount: 80,
                description: 'Jahresabschlussfeier mit Live-Musik'
            }
        },
        {
            id: '3',
            title: 'Geburtstag Schmidt',
            start: '2025-09-02T20:00:00',
            end: '2025-09-03T01:00:00',
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            extendedProps: {
                location: 'Privat, Hamburg',
                guestCount: 50,
                description: '50. Geburtstag mit DJ Set'
            }
        },
        {
            id: '4',
            title: 'Vereinsfest SV Blau-Weiß',
            start: '2025-09-08T17:00:00',
            end: '2025-09-08T22:00:00',
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            extendedProps: {
                location: 'Vereinsheim, Dortmund',
                guestCount: 200,
                description: 'Jahresfeier mit DJ und Fotografin'
            }
        },
        {
            id: '5',
            title: 'Messe-Event BusinessExpo',
            start: '2025-09-15T09:00:00',
            end: '2025-09-15T18:00:00',
            backgroundColor: '#8b5cf6',
            borderColor: '#7c3aed',
            extendedProps: {
                location: 'Messe Frankfurt',
                guestCount: 500,
                description: 'Ganztägiges Event mit Technik-Support'
            }
        },
        {
            id: '6',
            title: 'Hochzeit Weber',
            start: '2025-09-22T16:00:00',
            end: '2025-09-23T01:00:00',
            backgroundColor: '#22c55e',
            borderColor: '#16a34a',
            extendedProps: {
                location: 'Schloss Heidelberg',
                guestCount: 150,
                description: 'Romantische Hochzeit mit DJ und Fotografie'
            }
        },
        {
            id: '7',
            title: 'Oktoberfest Privat',
            start: '2025-10-05T18:00:00',
            end: '2025-10-05T23:00:00',
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            extendedProps: {
                location: 'Biergarten München',
                guestCount: 75,
                description: 'Private Oktoberfest-Feier'
            }
        },
        {
            id: '8',
            title: 'Corporate Event BMW',
            start: '2025-10-12T19:00:00',
            end: '2025-10-12T24:00:00',
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            extendedProps: {
                location: 'BMW Welt München',
                guestCount: 300,
                description: 'Produktpräsentation mit Live-Entertainment'
            }
        },
        {
            id: '9',
            title: 'Geburtstag Hoffmann',
            start: '2025-10-18T20:00:00',
            end: '2025-10-19T02:00:00',
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            extendedProps: {
                location: 'Villa Starnberg',
                guestCount: 90,
                description: '60. Geburtstag mit Tanzband und DJ'
            }
        },
        {
            id: '10',
            title: 'Sportgala TSV 1860',
            start: '2025-10-25T19:30:00',
            end: '2025-10-25T23:30:00',
            backgroundColor: '#8b5cf6',
            borderColor: '#7c3aed',
            extendedProps: {
                location: 'Olympiahalle München',
                guestCount: 400,
                description: 'Jährliche Sportgala mit Ehrungen'
            }
        },
        {
            id: '11',
            title: 'Halloween Party Club',
            start: '2025-10-31T21:00:00',
            end: '2025-11-01T03:00:00',
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            extendedProps: {
                location: 'Maxclub Berlin',
                guestCount: 250,
                description: 'Halloween-Party mit Special Effects'
            }
        },
        {
            id: '12',
            title: 'Hochzeit Schneider',
            start: '2025-11-08T17:00:00',
            end: '2025-11-09T02:00:00',
            backgroundColor: '#22c55e',
            borderColor: '#16a34a',
            extendedProps: {
                location: 'Gut Aiderbichl',
                guestCount: 180,
                description: 'Winterhochzeit mit DJ und Liveband'
            }
        },
        {
            id: '13',
            title: 'Weihnachtsfeier Siemens',
            start: '2025-12-15T18:00:00',
            end: '2025-12-15T23:00:00',
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            extendedProps: {
                location: 'Hotel Bayerischer Hof',
                guestCount: 220,
                description: 'Weihnachtsfeier mit festlichem Programm'
            }
        },
        {
            id: '14',
            title: 'Silvesterparty Premium',
            start: '2025-12-31T20:00:00',
            end: '2026-01-01T04:00:00',
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            extendedProps: {
                location: 'Penthouse Frankfurt',
                guestCount: 100,
                description: 'Exklusiver Silvesterabend mit DJ und Show'
            }
        },
        {
            id: '15',
            title: 'Neujahrsempfang Rathaus',
            start: '2026-01-10T18:00:00',
            end: '2026-01-10T22:00:00',
            backgroundColor: '#8b5cf6',
            borderColor: '#7c3aed',
            extendedProps: {
                location: 'Neues Rathaus München',
                guestCount: 350,
                description: 'Offizieller Neujahrsempfang der Stadt'
            }
        }
    ];

    useEffect(() => {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    setTimeout(() => {
                        checkEmployeeRole(session.user.id);
                    }, 0);
                } else {
                    setIsEmployee(false);
                    setLoading(false);
                }
            }
        );

        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                checkEmployeeRole(session.user.id);
            } else {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        // Load events from database
        fetchEventsFromDatabase();
    }, [isEmployee]);

    useEffect(() => {
        if (user && isEmployee) {
            fetchUserRegistrations();
        }
    }, [user, isEmployee]);

    const fetchEventsFromDatabase = async () => {
        if (!isEmployee) return;

        try {
            const { data, error } = await supabase
                .from('internal_events')
                .select('*')
                .order('event_date', { ascending: true });

            if (error) {
                console.error('Error fetching events:', error);
                toast.error('Fehler beim Laden der Events');
                return;
            }

            // Fetch all registrations for all events at once
            const { data: registrationsData, error: registrationsError } = await supabase
                .from('event_registrations')
                .select('event_id, staff_category, status')
                .eq('status', 'angemeldet');

            if (registrationsError) {
                console.error('Error fetching registrations:', registrationsError);
            }

            // Create a map of registrations by event_id and staff_category
            const registrationMap: { [key: string]: { [category: string]: number } } = {};
            if (registrationsData) {
                registrationsData.forEach(reg => {
                    if (!registrationMap[reg.event_id]) {
                        registrationMap[reg.event_id] = {};
                    }
                    if (!registrationMap[reg.event_id][reg.staff_category]) {
                        registrationMap[reg.event_id][reg.staff_category] = 0;
                    }
                    registrationMap[reg.event_id][reg.staff_category]++;
                });
            }

            const formattedEvents: Event[] = data.map(event => {
                const getEventColor = (status: string) => {
                    switch (status) {
                        case 'geplant': return { bg: '#3b82f6', border: '#2563eb' };
                        case 'laufend': return { bg: '#f59e0b', border: '#d97706' };
                        case 'abgeschlossen': return { bg: '#22c55e', border: '#16a34a' };
                        case 'abgesagt': return { bg: '#ef4444', border: '#dc2626' };
                        default: return { bg: '#8b5cf6', border: '#7c3aed' };
                    }
                };

                const colors = getEventColor(event.status);

                return {
                    id: event.id,
                    title: event.title,
                    start: event.event_date,
                    end: event.end_date || undefined,
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    extendedProps: {
                        location: event.location,
                        guestCount: event.guest_count,
                        description: event.description,
                        staffRequirements: (() => {
                            let staffReqs = [];
                            if (event.staff_requirements) {
                                if (typeof event.staff_requirements === 'string') {
                                    try {
                                        staffReqs = JSON.parse(event.staff_requirements);
                                    } catch (e) {
                                        console.error('Error parsing staff_requirements:', e);
                                        staffReqs = [];
                                    }
                                } else if (Array.isArray(event.staff_requirements)) {
                                    staffReqs = event.staff_requirements;
                                } else if (typeof event.staff_requirements === 'object') {
                                    staffReqs = Array.isArray(event.staff_requirements) ? event.staff_requirements : [event.staff_requirements];
                                }
                            }
                            return staffReqs.map((req: any) => ({
                                category: req.category || '',
                                count: req.count || 0,
                                filled: registrationMap[event.id]?.[req.category] || 0
                            }));
                        })(),
                        status: event.status,
                        notes: event.notes
                    }
                };
            });

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Fehler beim Laden der Events');
        }
    };

    // Get filtered upcoming events for list view
    const getFilteredUpcomingEvents = () => {
        const now = new Date();
        let filteredEvents = events
            .filter(event => new Date(event.start) > now)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        // Apply search filter
        if (searchTerm) {
            filteredEvents = filteredEvents.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.extendedProps?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.extendedProps?.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event =>
                event.extendedProps?.status === statusFilter
            );
        }

        // Apply location filter
        if (locationFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event =>
                event.extendedProps?.location?.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }

        return filteredEvents;
    };

    // Get paginated filtered events
    const getPaginatedFilteredEvents = () => {
        const filtered = getFilteredUpcomingEvents();
        const startIndex = (currentPage - 1) * eventsPerPage;
        const endIndex = startIndex + eventsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    // Get total filtered events count
    const getTotalFilteredEvents = () => {
        return getFilteredUpcomingEvents().length;
    };

    // Get filtered total pages
    const getFilteredTotalPages = () => {
        const total = getTotalFilteredEvents();
        return total > 0 ? Math.ceil(total / eventsPerPage) : 1;
    };

    // Get unique locations for filter dropdown
    const getUniqueLocations = () => {
        const locations = events
            .map(event => event.extendedProps?.location)
            .filter(location => location)
            .map(location => location as string);
        return [...new Set(locations)].sort();
    };

    // Get unique statuses for filter dropdown
    const getUniqueStatuses = () => {
        const statuses = events
            .map(event => event.extendedProps?.status)
            .filter(status => status)
            .map(status => status as string);
        return [...new Set(statuses)].sort();
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setLocationFilter('all');
        setCurrentPage(1);
    };

    // Get total number of upcoming events for pagination
    const getTotalUpcomingEvents = () => {
        if (!events || events.length === 0) return 0;
        const now = new Date();
        return events.filter(event => new Date(event.start) > now).length;
    };

    // Get total pages
    const getTotalPages = () => {
        const total = getTotalUpcomingEvents();
        return total > 0 ? Math.ceil(total / eventsPerPage) : 1;
    };

    // Get next 5 upcoming events (for sidebar)
    const getUpcomingEvents = () => {
        const now = new Date();
        const upcomingEvents = events
            .filter(event => new Date(event.start) > now)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 5);
        return upcomingEvents;
    };

    // Get the very next upcoming event
    const getNextEvent = () => {
        const now = new Date();
        const nextEvent = events
            .filter(event => new Date(event.start) > now)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];
        return nextEvent;
    };

    const fetchUserRegistrations = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('event_registrations')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching user registrations:', error);
                return;
            }

            setUserRegistrations(data || []);
        } catch (error) {
            console.error('Error fetching user registrations:', error);
        }
    };

    const fetchEventRegistrations = async (eventId: string) => {
        try {
            // First get registrations
            const { data: registrationsData, error: regError } = await supabase
                .from('event_registrations')
                .select('*')
                .eq('event_id', eventId);

            if (regError) {
                console.error('Error fetching event registrations:', regError);
                return;
            }

            // Then get user profiles
            const userIds = [...new Set(registrationsData?.map(reg => reg.user_id) || [])];
            if (userIds.length > 0) {
                const { data: profilesData, error: profileError } = await supabase
                    .from('profiles')
                    .select('user_id, first_name, last_name')
                    .in('user_id', userIds);

                // Combine data
                const enrichedRegistrations = registrationsData?.map(reg => ({
                    ...reg,
                    profiles: profilesData?.find(p => p.user_id === reg.user_id)
                })) || [];

                setEventRegistrations(enrichedRegistrations);
            } else {
                setEventRegistrations([]);
            }
        } catch (error) {
            console.error('Error fetching event registrations:', error);
        }
    };

    const checkEmployeeRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .in('role', ['employee', 'administrator']);

            setIsEmployee(!error && !!data && data.length > 0);
        } catch (error) {
            console.error('Error checking employee role:', error);
            setIsEmployee(false);
        } finally {
            setLoading(false);
        }
    };

    const handleEventClick = (clickInfo: any) => {
        const event = clickInfo.event;
        const eventData = events.find(e => e.id === event.id);
        if (eventData) {
            setSelectedEvent(eventData);
            fetchEventRegistrations(eventData.id);
            setShowEventDialog(true);
        }
    };

    const registerForEvent = async (eventId: string, staffCategory: string) => {
        if (!user) return;

        // Check if event is in the future
        const event = events.find(e => e.id === eventId);
        if (!event || new Date(event.start) <= new Date()) {
            toast.error('Anmeldung nur für zukünftige Events möglich');
            return;
        }

        try {
            // Check if user is already registered for this event
            const existingRegistration = userRegistrations.find(reg =>
                reg.event_id === eventId && reg.status !== 'zurückgezogen'
            );

            if (existingRegistration) {
                // Update existing registration to change role
                const { error } = await supabase
                    .from('event_registrations')
                    .update({
                        staff_category: staffCategory,
                        status: 'angemeldet'
                    })
                    .eq('id', existingRegistration.id);

                if (error) throw error;

                toast.success(`Rolle erfolgreich geändert zu ${staffCategory}`);
            } else {
                // Create new registration
                const { error } = await supabase
                    .from('event_registrations')
                    .insert({
                        event_id: eventId,
                        user_id: user.id,
                        staff_category: staffCategory,
                        status: 'angemeldet'
                    });

                if (error) {
                    if (error.code === '23505') {
                        toast.error('Sie sind bereits für dieses Event angemeldet');
                    } else {
                        throw error;
                    }
                    return;
                }

                toast.success(`Erfolgreich für ${staffCategory} angemeldet`);
            }

            fetchUserRegistrations();
            fetchEventRegistrations(eventId);
            // Refresh events to update staff requirement counts
            fetchEventsFromDatabase();
        } catch (error) {
            console.error('Error registering for event:', error);
            toast.error('Fehler bei der Anmeldung');
        }
    };

    const unregisterFromEvent = async (registrationId: string, eventId: string) => {
        try {
            const { error } = await supabase
                .from('event_registrations')
                .delete()
                .eq('id', registrationId);

            if (error) throw error;

            toast.success('Anmeldung erfolgreich zurückgezogen');
            fetchUserRegistrations();
            fetchEventRegistrations(eventId);
            // Refresh events to update staff requirement counts
            fetchEventsFromDatabase();
        } catch (error) {
            console.error('Error unregistering from event:', error);
            toast.error('Fehler beim Zurückziehen der Anmeldung');
        }
    };

    const isUserRegisteredForEvent = (eventId: string) => {
        return userRegistrations.some(reg =>
            reg.event_id === eventId &&
            reg.status !== 'zurückgezogen'
        );
    };

    const getUserRegistrationForEvent = (eventId: string) => {
        return userRegistrations.find(reg =>
            reg.event_id === eventId &&
            reg.status !== 'zurückgezogen'
        );
    };

    const isUserRegisteredForCategory = (eventId: string, category: string) => {
        const userReg = getUserRegistrationForEvent(eventId);
        return userReg?.staff_category === category;
    };

    const getRegistrationsForCategory = (category: string) => {
        return eventRegistrations.filter(reg =>
            reg.staff_category === category &&
            reg.status !== 'zurückgezogen'
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-hero">
                <Header />
                <div className="container mx-auto px-4 py-20">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-hero">
                <Header />
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <Card className="max-w-md mx-auto text-center">
                            <CardHeader>
                                <CardTitle>Anmeldung erforderlich</CardTitle>
                                <CardDescription>
                                    Bitte melden Sie sich an, um die anstehenden Events zu sehen.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }

    if (!isEmployee) {
        return (
            <div className="min-h-screen bg-gradient-hero">
                <Header />
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <Card className="max-w-md mx-auto text-center">
                            <CardHeader>
                                <CardTitle>Zugriff verweigert</CardTitle>
                                <CardDescription>
                                    Sie benötigen Mitarbeiter-Rechte, um die anstehenden Events zu sehen.
                                </CardDescription>
                            </CardHeader>
                        </Card>
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
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">Anstehende Events</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Überblick über alle geplanten Veranstaltungen und Termine
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Column - Statistics and Upcoming Events */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Kommende Events
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">
                                        {events.length}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => {
                                    const nextEvent = getNextEvent();
                                    if (nextEvent) {
                                        setSelectedEvent(nextEvent);
                                        fetchEventRegistrations(nextEvent.id);
                                        setShowEventDialog(true);
                                    }
                                }}
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Nächstes Event
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {(() => {
                                            const nextEvent = getNextEvent();
                                            return nextEvent ? (
                                                <>
                                                    <div className="font-semibold text-sm">
                                                        {nextEvent.title}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(nextEvent.start), 'dd.MM.yyyy HH:mm', { locale: de })}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        {nextEvent.extendedProps?.location}
                                                    </div>
                                                    <div className="text-xs text-primary mt-2">
                                                        Klicken für Personalanmeldung →
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="font-semibold text-sm">Kein Event</div>
                                            );
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Event-Typen
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span>Hochzeiten</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span>Firmenfeiern</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                            <span>Geburtstage</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span>Vereinsfeste</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                            <span>Messen</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabs for Calendar and List View */}
                        <div className="lg:col-span-3">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="calendar" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Kalender
                                    </TabsTrigger>
                                    <TabsTrigger value="list" className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Liste
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="calendar" className="mt-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                Kalenderansicht
                                            </CardTitle>
                                            <CardDescription>
                                                Klicken Sie auf ein Event für weitere Details
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="calendar-container">
                                                <FullCalendar
                                                    plugins={[dayGridPlugin, interactionPlugin]}
                                                    initialView="dayGridMonth"
                                                    events={events}
                                                    eventClick={handleEventClick}
                                                    headerToolbar={{
                                                        left: 'prev,next',
                                                        center: 'title',
                                                        right: 'today dayGridMonth,dayGridWeek'
                                                    }}
                                                    locale="de"
                                                    firstDay={1}
                                                    height="auto"
                                                    eventDisplay="block"
                                                    dayMaxEvents={3}
                                                    moreLinkClick="popover"
                                                    eventTimeFormat={{
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false
                                                    }}
                                                    buttonText={{
                                                        today: 'Heute',
                                                        month: 'Monat',
                                                        week: 'Woche',
                                                        day: 'Tag'
                                                    }}
                                                    customButtons={{
                                                        customToday: {
                                                            text: 'Heute',
                                                            click: function() {
                                                                this.today();
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="list" className="mt-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5" />
                                                    Alle anstehenden Veranstaltungen
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {getTotalFilteredEvents()} Events
                                                </div>
                                            </CardTitle>
                                            <CardDescription>
                                                Filterbare Liste aller bevorstehenden Events
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {/* Filter Section */}
                                                <div className="border rounded-lg p-4 bg-muted/20">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Filter className="h-4 w-4" />
                                                        <span className="font-medium">Filter</span>
                                                        {(searchTerm || statusFilter !== 'all' || locationFilter !== 'all') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={clearFilters}
                                                                className="h-6 px-2 text-xs"
                                                            >
                                                                <X className="h-3 w-3 mr-1" />
                                                                Zurücksetzen
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium mb-2 block">
                                                                Suche
                                                            </label>
                                                            <Input
                                                                placeholder="Event-Titel, Ort oder Beschreibung..."
                                                                value={searchTerm}
                                                                onChange={(e) => {
                                                                    setSearchTerm(e.target.value);
                                                                    setCurrentPage(1);
                                                                }}
                                                                className="h-8"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-sm font-medium mb-2 block">
                                                                Status
                                                            </label>
                                                            <Select
                                                                value={statusFilter}
                                                                onValueChange={(value) => {
                                                                    setStatusFilter(value);
                                                                    setCurrentPage(1);
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-8">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-background border z-50">
                                                                    <SelectItem value="all">Alle Status</SelectItem>
                                                                    {getUniqueStatuses().map((status) => (
                                                                        <SelectItem key={status} value={status}>
                                                                            {status}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div>
                                                            <label className="text-sm font-medium mb-2 block">
                                                                Stadt/Ort
                                                            </label>
                                                            <Select
                                                                value={locationFilter}
                                                                onValueChange={(value) => {
                                                                    setLocationFilter(value);
                                                                    setCurrentPage(1);
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-8">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-background border z-50">
                                                                    <SelectItem value="all">Alle Orte</SelectItem>
                                                                    {getUniqueLocations().map((location) => (
                                                                        <SelectItem key={location} value={location}>
                                                                            {location}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Events List */}
                                                <div className="grid gap-4">
                                                    {getPaginatedFilteredEvents().map((event, index) => {
                                                        const isUserRegisteredForEventAny = isUserRegisteredForEvent(event.id);
                                                        const userEventRegistration = getUserRegistrationForEvent(event.id);
                                                        const isEventInPast = new Date(event.start) <= new Date();
                                                        const hasStaffRequirements = event.extendedProps?.staffRequirements && event.extendedProps.staffRequirements.length > 0;
                                                        const availableSpots = hasStaffRequirements ? event.extendedProps.staffRequirements.filter(staff => (staff.count - (staff.filled || 0)) > 0) : [];

                                                        return (
                                                            <Card key={event.id} className="hover:shadow-md transition-shadow">
                                                                <CardContent className="p-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                                                        <div
                                                                            className="md:col-span-2 cursor-pointer"
                                                                            onClick={() => {
                                                                                setSelectedEvent(event);
                                                                                fetchEventRegistrations(event.id);
                                                                                setShowEventDialog(true);
                                                                            }}
                                                                        >
                                                                            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                                                                <Clock className="h-4 w-4" />
                                                                                <span>
                                          {format(new Date(event.start), 'dd.MM.yyyy HH:mm', { locale: de })}
                                                                                    {event.end &&
                                                                                        ` - ${format(new Date(event.end), 'HH:mm', { locale: de })}`
                                                                                    }
                                        </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                                <MapPin className="h-4 w-4" />
                                                                                <span>{event.extendedProps?.location}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            className="text-center cursor-pointer"
                                                                            onClick={() => {
                                                                                setSelectedEvent(event);
                                                                                fetchEventRegistrations(event.id);
                                                                                setShowEventDialog(true);
                                                                            }}
                                                                        >
                                                                            {event.extendedProps?.guestCount && (
                                                                                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                                                                                    <Users className="h-4 w-4" />
                                                                                    <span>{event.extendedProps.guestCount} Gäste</span>
                                                                                </div>
                                                                            )}
                                                                            <Badge variant="outline" className="mt-1">
                                                                                {event.extendedProps?.status || 'geplant'}
                                                                            </Badge>
                                                                        </div>

                                                                        <div className="text-right">
                                                                            <div className="flex flex-col items-end gap-3">
                                                                                {event.extendedProps?.staffRequirements && (
                                                                                    <div className="text-sm text-muted-foreground">
                                                                                        <div className="font-medium mb-1">Personal benötigt:</div>
                                                                                        <div className="space-y-1">
                                                                                            {event.extendedProps.staffRequirements.map((staff, staffIndex) => (
                                                                                                <div key={staffIndex} className="flex items-center justify-end gap-2">
                                                                                                    <span>{staff.category}:</span>
                                                                                                    <Badge variant="secondary">
                                                                                                        {staff.filled || 0}/{staff.count}
                                                                                                    </Badge>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Anmelde-Button */}
                                                                                {isEventInPast ? (
                                                                                    <Badge variant="outline" className="text-muted-foreground">
                                                                                        Event beendet
                                                                                    </Badge>
                                                                                ) : !hasStaffRequirements ? (
                                                                                    <Badge variant="outline" className="text-muted-foreground">
                                                                                        Kein Personal benötigt
                                                                                    </Badge>
                                                                                ) : isUserRegisteredForEventAny ? (
                                                                                    <Button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setSelectedEvent(event);
                                                                                            fetchEventRegistrations(event.id);
                                                                                            setShowEventDialog(true);
                                                                                        }}
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="text-destructive hover:text-destructive"
                                                                                    >
                                                                                        <UserMinus className="h-4 w-4 mr-1" />
                                                                                        Abmelden
                                                                                    </Button>
                                                                                ) : availableSpots.length > 0 ? (
                                                                                    <Button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setSelectedEvent(event);
                                                                                            fetchEventRegistrations(event.id);
                                                                                            setShowEventDialog(true);
                                                                                        }}
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                    >
                                                                                        <UserPlus className="h-4 w-4 mr-1" />
                                                                                        Anmelden
                                                                                    </Button>
                                                                                ) : (
                                                                                    <Badge variant="destructive">
                                                                                        Ausgebucht
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {event.extendedProps?.description && (
                                                                        <div
                                                                            className="mt-3 pt-3 border-t border-muted cursor-pointer"
                                                                            onClick={() => {
                                                                                setSelectedEvent(event);
                                                                                fetchEventRegistrations(event.id);
                                                                                setShowEventDialog(true);
                                                                            }}
                                                                        >
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {event.extendedProps.description}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>

                                                {/* Pagination Controls */}
                                                {getFilteredTotalPages() > 1 && (
                                                    <div className="flex items-center justify-between pt-4 border-t border-muted">
                                                        <div className="text-sm text-muted-foreground">
                                                            Seite {currentPage} von {getFilteredTotalPages()}
                                                            ({getTotalFilteredEvents()} Events)
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                                disabled={currentPage === 1}
                                                            >
                                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                                Zurück
                                                            </Button>

                                                            <div className="flex gap-1">
                                                                {Array.from({ length: getFilteredTotalPages() }, (_, i) => i + 1).map((page) => (
                                                                    <Button
                                                                        key={page}
                                                                        variant={currentPage === page ? "default" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => setCurrentPage(page)}
                                                                        className="w-8 h-8 p-0"
                                                                    >
                                                                        {page}
                                                                    </Button>
                                                                ))}
                                                            </div>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCurrentPage(prev => Math.min(getFilteredTotalPages(), prev + 1))}
                                                                disabled={currentPage === getFilteredTotalPages()}
                                                            >
                                                                Weiter
                                                                <ChevronRight className="h-4 w-4 ml-1" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* No Events Message */}
                                                {getTotalFilteredEvents() === 0 && (
                                                    <div className="text-center py-8">
                                                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                        <h3 className="text-lg font-semibold mb-2">
                                                            {searchTerm || statusFilter !== 'all' || locationFilter !== 'all'
                                                                ? 'Keine Events gefunden'
                                                                : 'Keine anstehenden Events'
                                                            }
                                                        </h3>
                                                        <p className="text-muted-foreground">
                                                            {searchTerm || statusFilter !== 'all' || locationFilter !== 'all'
                                                                ? 'Versuchen Sie andere Filterkriterien.'
                                                                : 'Derzeit sind keine Events geplant.'
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Details Dialog */}
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {selectedEvent?.title}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedEvent && (
                        <div className="space-y-6">
                            {/* Event Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                      {format(new Date(selectedEvent.start), 'dd.MM.yyyy HH:mm', { locale: de })}
                                            {selectedEvent.end &&
                                                ` - ${format(new Date(selectedEvent.end), 'dd.MM.yyyy HH:mm', { locale: de })}`
                                            }
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedEvent.extendedProps?.location}</span>
                                    </div>
                                    {selectedEvent.extendedProps?.guestCount && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedEvent.extendedProps.guestCount} Gäste</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Status:</span>
                                        <Badge variant="outline">
                                            {selectedEvent.extendedProps?.status}
                                        </Badge>
                                    </div>
                                    {selectedEvent.extendedProps?.description && (
                                        <div>
                                            <span className="text-sm font-medium">Beschreibung:</span>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {selectedEvent.extendedProps.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Staff Requirements & Registration */}
                            {selectedEvent.extendedProps?.staffRequirements &&
                                selectedEvent.extendedProps.staffRequirements.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-4">Personal-Anforderungen & Anmeldung</h3>
                                        <div className="grid gap-4">
                                            {selectedEvent.extendedProps.staffRequirements.map((staff, index) => {
                                                const registrations = getRegistrationsForCategory(staff.category);
                                                const isUserRegisteredForEventAny = isUserRegisteredForEvent(selectedEvent.id);
                                                const userEventRegistration = getUserRegistrationForEvent(selectedEvent.id);
                                                const isRegisteredForThisCategory = isUserRegisteredForCategory(selectedEvent.id, staff.category);
                                                const spotsLeft = staff.count - registrations.length;
                                                const isEventInPast = new Date(selectedEvent.start) <= new Date();

                                                return (
                                                    <Card key={index} className="p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-medium">{staff.category}</h4>
                                                                <Badge variant={spotsLeft > 0 ? "outline" : "destructive"}>
                                                                    {registrations.length}/{staff.count} belegt
                                                                </Badge>
                                                                {spotsLeft > 0 && (
                                                                    <Badge variant="secondary">
                                                                        {spotsLeft} Plätze frei
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex gap-2">
                                                                {isEventInPast ? (
                                                                    <Badge variant="outline" className="text-muted-foreground">
                                                                        Event bereits beendet
                                                                    </Badge>
                                                                ) : isUserRegisteredForEventAny ? (
                                                                    <>
                                                                        {isRegisteredForThisCategory ? (
                                                                            <Button
                                                                                onClick={() => userEventRegistration && unregisterFromEvent(userEventRegistration.id, selectedEvent.id)}
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="text-destructive hover:text-destructive"
                                                                            >
                                                                                <UserMinus className="h-4 w-4 mr-1" />
                                                                                Abmelden
                                                                            </Button>
                                                                        ) : (
                                                                            <Button
                                                                                onClick={() => registerForEvent(selectedEvent.id, staff.category)}
                                                                                variant="outline"
                                                                                size="sm"
                                                                                disabled={spotsLeft <= 0}
                                                                            >
                                                                                Stelle ändern
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <Button
                                                                        onClick={() => registerForEvent(selectedEvent.id, staff.category)}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        disabled={spotsLeft <= 0}
                                                                    >
                                                                        <UserPlus className="h-4 w-4 mr-1" />
                                                                        Anmelden
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Show registered users */}
                                                        {registrations.length > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-muted-foreground">Angemeldet:</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {registrations.map((reg, regIndex) => (
                                                                        <Badge key={regIndex} variant="secondary" className="text-xs">
                                                                            {reg.profiles?.first_name} {reg.profiles?.last_name}
                                                                            {reg.user_id === user?.id && " (Sie)"}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                            {/* Notes */}
                            {selectedEvent.extendedProps?.notes && (
                                <div className="p-4 bg-muted/30 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        Zusätzliche Informationen
                                    </h4>
                                    <p className="text-sm">{selectedEvent.extendedProps.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};

export default AnstehendeEvents;