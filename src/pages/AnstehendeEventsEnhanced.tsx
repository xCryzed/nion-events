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
import { Calendar, Clock, MapPin, Users, UserPlus, UserMinus, Info, ChevronLeft, ChevronRight, List, X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { WorkContractDialog } from '@/components/WorkContractDialog';

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
        qualificationRequirements?: Array<{
            category: string;
            qualifications: string[];
        }>;
        pricingStructure?: Array<{
            category: string;
            hourly_rate?: number;
            fixed_rate?: number;
        }>;
        status?: string;
        notes?: string;
        contractRequired?: boolean;
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

interface UserQualification {
    id: string;
    user_id: string;
    qualification_id: string;
    qualifications?: {
        id: string;
        name: string;
        description?: string;
    };
}

const AnstehendeEventsEnhanced = () => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isEmployee, setIsEmployee] = useState(false);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
    const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([]);
    const [showEventDialog, setShowEventDialog] = useState(false);
    const [userQualifications, setUserQualifications] = useState<UserQualification[]>([]);
    const [showContractDialog, setShowContractDialog] = useState(false);
    const [contractEvent, setContractEvent] = useState<Event | null>(null);
    const [contractStaffCategory, setContractStaffCategory] = useState<string>('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 5;

    // Tab and filter state
    const [activeTab, setActiveTab] = useState('calendar');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');

    useEffect(() => {
        document.title = 'Anstehende Events - DJ Aachen & Eventtechnik | NION Events Mitarbeiterbereich';
    }, []);

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
        if (isEmployee) {
            fetchEvents();
        }
    }, [isEmployee]);

    useEffect(() => {
        if (user && isEmployee) {
            fetchUserRegistrations();
            fetchUserQualifications(user.id);
        }
    }, [user, isEmployee]);

    const checkEmployeeRole = async (userId: string) => {
        try {
            const { data, error } = await supabase.rpc('has_role', {
                _user_id: userId,
                _role: 'employee'
            });

            if (error) {
                console.error('Error checking employee role:', error);
                setIsEmployee(false);
            } else {
                const isAdmin = await supabase.rpc('has_role', {
                    _user_id: userId,
                    _role: 'administrator'
                });
                setIsEmployee(data || isAdmin.data);
            }
        } catch (error) {
            console.error('Error in checkEmployeeRole:', error);
            setIsEmployee(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserQualifications = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('employee_qualifications')
                .select(`
                    id,
                    user_id,
                    qualification_id,
                    qualifications (
                        id,
                        name,
                        description
                    )
                `)
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching user qualifications:', error);
                return;
            }

            setUserQualifications(data || []);
        } catch (error) {
            console.error('Error fetching user qualifications:', error);
        }
    };

    const fetchEvents = async () => {
        if (!isEmployee) return;

        try {
            // Get start of current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            
            const { data, error } = await supabase
                .from('internal_events')
                .select('*')
                .gte('event_date', startOfMonth)
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
                // Calculate actual status based on current time
                const getActualStatus = (eventDate: string, endDate: string | null, originalStatus: string) => {
                    // "abgesagt" always wins
                    if (originalStatus === 'abgesagt') return 'abgesagt';
                    
                    const now = new Date();
                    const eventStart = new Date(eventDate);
                    const eventEnd = endDate ? new Date(endDate) : new Date(eventStart.getTime() + (4 * 60 * 60 * 1000)); // Default 4h if no end time
                    
                    // If event is completely in the past
                    if (eventEnd < now) return 'abgeschlossen';
                    
                    // If event is currently running
                    if (eventStart <= now && now <= eventEnd) return 'laufend';
                    
                    // If event is in the future
                    return 'geplant';
                };

                const actualStatus = getActualStatus(event.event_date, event.end_date, event.status);
                
                const getEventColor = (status: string) => {
                    switch (status) {
                        case 'geplant': return { bg: '#3b82f6', border: '#2563eb' };
                        case 'laufend': return { bg: '#f59e0b', border: '#d97706' };
                        case 'abgeschlossen': return { bg: '#22c55e', border: '#16a34a' };
                        case 'abgesagt': return { bg: '#ef4444', border: '#dc2626' };
                        default: return { bg: '#8b5cf6', border: '#7c3aed' };
                    }
                };

                const colors = getEventColor(actualStatus);

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
                        qualificationRequirements: (() => {
                            let qualReqs = [];
                            if (event.qualification_requirements) {
                                if (typeof event.qualification_requirements === 'string') {
                                    try {
                                        qualReqs = JSON.parse(event.qualification_requirements);
                                    } catch (e) {
                                        console.error('Error parsing qualification_requirements:', e);
                                        qualReqs = [];
                                    }
                                } else if (Array.isArray(event.qualification_requirements)) {
                                    qualReqs = event.qualification_requirements;
                                }
                            }
                            return qualReqs;
                        })(),
                        pricingStructure: (() => {
                            let pricingStructure = [];
                            if (event.pricing_structure) {
                                if (typeof event.pricing_structure === 'string') {
                                    try {
                                        pricingStructure = JSON.parse(event.pricing_structure);
                                    } catch (e) {
                                        console.error('Error parsing pricing_structure:', e);
                                        pricingStructure = [];
                                    }
                                } else if (Array.isArray(event.pricing_structure)) {
                                    pricingStructure = event.pricing_structure;
                                }
                            }
                            // Normalize to a consistent shape used in the UI
                            return pricingStructure.map((p: any) => ({
                                category: p.category,
                                hourly_rate: p.hourly_rate ?? p.amount ?? p.hourlyRate ?? p.rate ?? undefined,
                                fixed_rate: p.fixed_rate ?? p.fixedRate ?? undefined,
                            }));
                        })(),
                        status: actualStatus,
                        notes: event.notes,
                        contractRequired: event.contract_required
                    }
                };
            });

            setEvents(formattedEvents);
            // Keep the opened dialog in sync with latest counts/pricing
            if (selectedEvent) {
                const updated = formattedEvents.find(e => e.id === selectedEvent.id);
                if (updated) setSelectedEvent(updated);
            }
        } catch (error) {
            toast.error('Fehler beim Laden der Events');
        }
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
            const { data: registrations, error } = await supabase
                .from('event_registrations')
                .select('*')
                .eq('event_id', eventId);

            if (error) {
                console.error('Error fetching event registrations:', error);
                return;
            }

            // Fetch profiles separately to avoid join issues
            const userIds = registrations?.map(reg => reg.user_id) || [];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('user_id, first_name, last_name')
                .in('user_id', userIds);

            const registrationsWithProfiles = registrations?.map(reg => ({
                ...reg,
                profiles: profiles?.find(p => p.user_id === reg.user_id) || null
            })) || [];

            setEventRegistrations(registrationsWithProfiles);
        } catch (error) {
            console.error('Error fetching event registrations:', error);
        }
    };

    const handleEventClick = (clickInfo: any) => {
        const event = clickInfo.event;
        const eventData: Event = {
            id: event.id,
            title: event.title,
            start: event.start.toISOString(),
            end: event.end?.toISOString(),
            backgroundColor: event.backgroundColor,
            borderColor: event.borderColor,
            extendedProps: event.extendedProps
        };
        setSelectedEvent(eventData);
        fetchEventRegistrations(event.id);
        setShowEventDialog(true);
    };

    const canRegisterForPosition = (requirements: any[], category: string): boolean => {
        if (!requirements || requirements.length === 0) {
            return true; // No requirements means anyone can register
        }

        const categoryRequirement = requirements.find(req => req.category === category);
        if (!categoryRequirement || !categoryRequirement.qualifications) {
            return true; // No specific qualification requirements for this category
        }

        // Check if user has all required qualifications for this category
        const requiredQualifications = categoryRequirement.qualifications;
        const userQualificationNames = userQualifications.map(uq => uq.qualifications?.name).filter(Boolean);

        return requiredQualifications.every((reqQual: any) => {
            const qualName = typeof reqQual === 'string' ? reqQual : reqQual.name;
            return userQualificationNames.includes(qualName);
        });
    };

    const getMissingQualifications = (requirements: any[], category: string): string[] => {
        if (!requirements || requirements.length === 0) {
            return [];
        }

        const categoryRequirement = requirements.find(req => req.category === category);
        if (!categoryRequirement || !categoryRequirement.qualifications) {
            return [];
        }

        const requiredQualifications = categoryRequirement.qualifications;
        const userQualificationNames = userQualifications.map(uq => uq.qualifications?.name).filter(Boolean);

        return requiredQualifications.filter((reqQual: any) => {
            const qualName = typeof reqQual === 'string' ? reqQual : reqQual.name;
            return !userQualificationNames.includes(qualName);
        }).map((reqQual: any) => typeof reqQual === 'string' ? reqQual : reqQual.name);
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
            .filter(location => location && location.trim() !== '')
            .filter((location, index, array) => array.indexOf(location) === index);
        return locations;
    };

    const handleRegister = async (eventId: string, category: string) => {
        if (!user) {
            toast.error('Sie müssen angemeldet sein, um sich zu registrieren');
            return;
        }

        // Check if this event requires a contract for this staff category
        const event = events.find(e => e.id === eventId);
        const requiresContract = event?.extendedProps?.contractRequired;

        if (requiresContract) {
            // Open contract dialog instead of direct registration
            setContractEvent(event);
            setContractStaffCategory(category);
            setShowContractDialog(true);
            return;
        }

        try {
            // First, check if user is already registered for another position in this event
            const existingRegistration = userRegistrations.find(reg => reg.event_id === eventId);
            
            if (existingRegistration) {
                // Unregister from existing position first
                await supabase
                    .from('event_registrations')
                    .delete()
                    .eq('id', existingRegistration.id);
            }

            // Register for new position
            const { error } = await supabase
                .from('event_registrations')
                .insert({
                    event_id: eventId,
                    user_id: user.id,
                    staff_category: category,
                    status: 'angemeldet'
                });

            if (error) {
                console.error('Error registering for event:', error);
                toast.error('Fehler bei der Anmeldung');
                return;
            }

            if (existingRegistration) {
                toast.success(`Position geändert zu ${category}!`);
            } else {
                toast.success('Erfolgreich angemeldet!');
            }
            
            fetchUserRegistrations();
            fetchEvents(); // Refresh to update filled counts
            if (selectedEvent) {
                fetchEventRegistrations(selectedEvent.id);
            }
        } catch (error) {
            console.error('Error registering for event:', error);
            toast.error('Fehler bei der Anmeldung');
        }
    };

    const handleUnregister = async (registrationId: string) => {
        try {
            const { error } = await supabase
                .from('event_registrations')
                .delete()
                .eq('id', registrationId);

            if (error) {
                console.error('Error unregistering from event:', error);
                toast.error('Fehler bei der Abmeldung');
                return;
            }

            toast.success('Erfolgreich abgemeldet!');
            fetchUserRegistrations();
            fetchEvents(); // Refresh to update filled counts
            if (selectedEvent) {
                fetchEventRegistrations(selectedEvent.id);
            }
        } catch (error) {
            console.error('Error unregistering from event:', error);
            toast.error('Fehler bei der Abmeldung');
        }
    };

    const getUserRegistration = (eventId: string, category: string): EventRegistration | undefined => {
        return userRegistrations.find(
            reg => reg.event_id === eventId && reg.staff_category === category
        );
    };

    const getFilledCount = (category: string): number => {
        // Prefer live data from eventRegistrations for the selected event
        return eventRegistrations.filter(
            (r) => r.staff_category === category && r.status === 'angemeldet'
        ).length;
    };

    const getPricing = (pricingStructure: any, category: string) => {
        if (!pricingStructure || !Array.isArray(pricingStructure)) return null;
        return pricingStructure.find(p => p.category === category);
    };

    const isEventEditable = (status: string): boolean => {
        return status === 'geplant';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Lade Events...</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!session || !isEmployee) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Zugriff verweigert</h1>
                        <p className="text-muted-foreground">
                            Diese Seite ist nur für Mitarbeiter zugänglich. 
                            Bitte melden Sie sich mit Ihrem Mitarbeiterkonto an.
                        </p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Get all current month events (already filtered by fetchEvents)
    const currentMonthEvents = events;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 pt-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Anstehende Events</h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-full">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <span className="font-bold text-primary text-lg">{currentMonthEvents.length}</span>
                            </div>
                            <span className="text-sm text-muted-foreground font-medium hidden xs:inline">Events diesen Monat</span>
                            <span className="text-sm text-muted-foreground font-medium xs:hidden">Events</span>
                        </div>
                        
                        {/* Event Legend */}
                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                                <span>Geplant</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
                                <span>Laufend</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
                                <span>Abgeschlossen</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                                <span>Abgesagt</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant={activeTab === 'calendar' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('calendar')}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <Calendar className="w-4 h-4" />
                                <span className="hidden sm:inline">Kalender</span>
                            </Button>
                            <Button
                                variant={activeTab === 'list' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('list')}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <List className="w-4 h-4" />
                                <span className="hidden sm:inline">Liste</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {activeTab === 'calendar' && (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="calendar-container">
                                    <FullCalendar
                                        plugins={[dayGridPlugin, interactionPlugin]}
                                        initialView="dayGridMonth"
                        events={currentMonthEvents}
                                        eventClick={handleEventClick}
                                        headerToolbar={{
                                            left: 'prev,next',
                                            center: 'title',
                                            right: 'today'
                                        }}
                                        locale="de"
                                        firstDay={1}
                                        buttonText={{
                                            today: 'Heute',
                                            month: 'Monat',
                                            week: 'Woche'
                                        }}
                                        height="auto"
                                        eventDisplay="block"
                                        dayMaxEvents={3}
                                        moreLinkText="weitere"
                                        eventTimeFormat={{
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Remove old legend placement */}
                    </div>
                )}

                {activeTab === 'list' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="space-y-4">
                            <Input
                                placeholder="Events durchsuchen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Status Filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Alle Status</SelectItem>
                                        <SelectItem value="geplant">Geplant</SelectItem>
                                        <SelectItem value="laufend">Laufend</SelectItem>
                                        <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                                        <SelectItem value="abgesagt">Abgesagt</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={locationFilter} onValueChange={setLocationFilter}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Standort Filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Alle Standorte</SelectItem>
                                        {getUniqueLocations().map((location, index) => (
                                            <SelectItem key={index} value={location || ''}>
                                                {location}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(searchTerm || statusFilter !== 'all' || locationFilter !== 'all') && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('all');
                                            setLocationFilter('all');
                                            setCurrentPage(1);
                                        }}
                                        className="flex items-center gap-2 w-full sm:w-auto"
                                        size="sm"
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sm:hidden">Zurücksetzen</span>
                                        <span className="hidden sm:inline">Filter zurücksetzen</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Event List */}
                        <div className="space-y-4">
                            {getPaginatedFilteredEvents().map((event, eventIndex) => (
                                <Card 
                                    key={event.id} 
                                    className="w-full cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        fetchEventRegistrations(event.id);
                                        setShowEventDialog(true);
                                    }}
                                >
                                    <CardHeader>
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span>{event.title}</span>
                                                            <Badge 
                                                                className={`text-white border-0 ${
                                                                    event.extendedProps?.status === 'geplant' ? 'bg-blue-500' :
                                                                    event.extendedProps?.status === 'laufend' ? 'bg-orange-500' :
                                                                    event.extendedProps?.status === 'abgeschlossen' ? 'bg-green-500' :
                                                                    event.extendedProps?.status === 'abgesagt' ? 'bg-red-500' :
                                                                    'bg-purple-500'
                                                                }`}
                                                            >
                                                                {event.extendedProps?.status?.charAt(0).toUpperCase() + event.extendedProps?.status?.slice(1)}
                                                            </Badge>
                                                        </CardTitle>
                                        <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {event.start ? format(new Date(event.start), 'dd.MM.yyyy HH:mm', { locale: de }) : 'Kein Datum'}
                                                {event.end && (
                                                    <span className="text-muted-foreground">
                                                        {' - '}{format(new Date(event.end), 'dd.MM.yyyy HH:mm', { locale: de })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {event.extendedProps?.location}
                                            </div>
                                            {event.extendedProps?.guestCount && (
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {event.extendedProps.guestCount} Gäste
                                                </div>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {event.extendedProps?.description && (
                                            <p className="text-sm text-muted-foreground mb-4">{event.extendedProps.description}</p>
                                        )}
                                        
                                        {event.extendedProps?.staffRequirements && event.extendedProps.staffRequirements.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm">Personalanforderungen:</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {event.extendedProps.staffRequirements.map((requirement, index) => {
                                                        const userRegistration = getUserRegistration(event.id, requirement.category);
                                                        const filledCount = requirement.filled || 0;
                                                        const isFullyBooked = filledCount >= requirement.count;
                                                        const pricing = getPricing(event.extendedProps?.pricingStructure, requirement.category);

                                                         return (
                                                             <div key={index} className="border rounded-lg p-3 space-y-2">
                                                                 <div className="flex items-center justify-between">
                                                                     <span className="font-medium text-sm">{requirement.category}</span>
                                                                     <Badge variant={isFullyBooked ? 'destructive' : 'outline'}>
                                                                         {filledCount}/{requirement.count}
                                                                     </Badge>
                                                                 </div>
                                                                 
                                                                  {pricing && (pricing.hourly_rate || pricing.fixed_rate) && (
                                                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                          <span className="font-medium">€</span>
                                                                          {pricing.hourly_rate ? `${pricing.hourly_rate} €/h` : ''}
                                                                          {pricing.hourly_rate && pricing.fixed_rate ? ' + ' : ''}
                                                                          {pricing.fixed_rate ? `${pricing.fixed_rate}€ fix` : ''}
                                                                      </div>
                                                                  )}

                                                                 {userRegistration && (
                                                                     <div className="flex items-center gap-1 text-xs text-green-600">
                                                                         <CheckCircle className="h-3 w-3" />
                                                                         <span>Sie sind angemeldet</span>
                                                                     </div>
                                                                 )}
                                                             </div>
                                                         );
                                                     })}
                                                </div>
                                                
                                                <div className="pt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEvent(event);
                                                            fetchEventRegistrations(event.id);
                                                            setShowEventDialog(true);
                                                        }}
                                                        className="w-full"
                                                    >
                                                        <Info className="h-4 w-4 mr-2" />
                                                        Details & Anmeldung
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {getPaginatedFilteredEvents().length === 0 && !loading && (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <h3 className="text-lg font-semibold mb-2">Keine Events gefunden</h3>
                                        <p className="text-muted-foreground">
                                            {searchTerm || statusFilter !== 'all' || locationFilter !== 'all'
                                                ? 'Keine Events entsprechen den aktuellen Filterkriterien.'
                                                : 'Derzeit sind keine Events geplant.'
                                            }
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Pagination */}
                        {getTotalFilteredEvents() > eventsPerPage && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Zeige {((currentPage - 1) * eventsPerPage) + 1} bis{' '}
                                    {Math.min(currentPage * eventsPerPage, getTotalFilteredEvents())} von{' '}
                                    {getTotalFilteredEvents()} Events
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Zurück
                                    </Button>
                                    <span className="text-sm">
                                        Seite {currentPage} von {getFilteredTotalPages()}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(getFilteredTotalPages(), currentPage + 1))}
                                        disabled={currentPage === getFilteredTotalPages()}
                                        className="flex items-center gap-1"
                                    >
                                        Weiter
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Event Detail Dialog */}
                {selectedEvent && (
                    <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="border-b pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <DialogTitle className="text-2xl font-bold">
                                                {selectedEvent.title}
                                            </DialogTitle>
                                            <Badge 
                                                className={`text-xs border-0 text-white ${
                                                    selectedEvent.extendedProps?.status === 'geplant' ? 'bg-blue-500' :
                                                    selectedEvent.extendedProps?.status === 'laufend' ? 'bg-orange-500' :
                                                    selectedEvent.extendedProps?.status === 'abgeschlossen' ? 'bg-green-500' :
                                                    selectedEvent.extendedProps?.status === 'abgesagt' ? 'bg-red-500' :
                                                    'bg-purple-500'
                                                }`}
                                            >
                                                {selectedEvent.extendedProps?.status?.charAt(0).toUpperCase() + selectedEvent.extendedProps?.status?.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-8 py-2">
                                {/* Event Overview */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Main Info */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Event Details Card */}
                                        <Card className="border-none shadow-sm bg-muted/20">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Info className="h-5 w-5" />
                                                    Event Details
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                                                        <div className="p-2 bg-primary/10 rounded-md">
                                                            <Calendar className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-xs text-muted-foreground font-medium">START</div>
                                                            <div className="font-medium">
                                                                {format(new Date(selectedEvent.start), 'dd.MM.yyyy', { locale: de })}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {format(new Date(selectedEvent.start), 'HH:mm', { locale: de })} Uhr
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                                                        <div className="p-2 bg-orange-500/10 rounded-md">
                                                            <Clock className="h-4 w-4 text-orange-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-xs text-muted-foreground font-medium">ENDE</div>
                                                            <div className="font-medium">
                                                                {selectedEvent.end ? format(new Date(selectedEvent.end), 'dd.MM.yyyy', { locale: de }) : 'Nicht angegeben'}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {selectedEvent.end ? `${format(new Date(selectedEvent.end), 'HH:mm', { locale: de })} Uhr` : '-'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                                                        <div className="p-2 bg-blue-500/10 rounded-md">
                                                            <MapPin className="h-4 w-4 text-blue-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-xs text-muted-foreground font-medium">LOCATION</div>
                                                            <div className="font-medium">{selectedEvent.extendedProps?.location}</div>
                                                        </div>
                                                    </div>

                                                    {selectedEvent.extendedProps?.guestCount && (
                                                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                                                            <div className="p-2 bg-green-500/10 rounded-md">
                                                                <Users className="h-4 w-4 text-green-500" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-xs text-muted-foreground font-medium">GÄSTE</div>
                                                                <div className="font-medium">{selectedEvent.extendedProps.guestCount} Personen</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {selectedEvent.extendedProps?.description && (
                                                    <div className="p-4 bg-background rounded-lg border">
                                                        <div className="text-xs text-muted-foreground font-medium mb-2">BESCHREIBUNG</div>
                                                        <p className="text-sm leading-relaxed">{selectedEvent.extendedProps.description}</p>
                                                    </div>
                                                )}

                                                {selectedEvent.extendedProps?.notes && (
                                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                        <div className="text-xs text-amber-700 font-medium mb-2">NOTIZEN</div>
                                                        <p className="text-sm text-amber-800">{selectedEvent.extendedProps.notes}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Quick Stats Sidebar */}
                                    <div className="space-y-4">
                                        <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
                                            <CardContent className="p-4">
                                                <div className="text-center space-y-2">
                                                    <div className="text-2xl font-bold">
                                                        {selectedEvent.extendedProps?.staffRequirements?.reduce((acc, req) => acc + (req.count || 0), 0) || 0}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-medium">
                                                        BENÖTIGTE MITARBEITER
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-none shadow-sm bg-gradient-to-br from-green-500/5 to-green-500/10">
                                            <CardContent className="p-4">
                                                <div className="text-center space-y-2">
                                                                    <div className={"text-2xl font-bold text-green-600"}>
                                                                        {selectedEvent.extendedProps?.staffRequirements?.reduce((acc, req) => acc + (req.filled || 0), 0) || 0}
                                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-medium">
                                                        ANGEMELDETE MITARBEITER
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {eventRegistrations.length > 0 && (
                                            <Card className="border-none shadow-sm">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm font-medium">Anmeldungen</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    {eventRegistrations.slice(0, 3).map((registration) => (
                                                        <div key={registration.id} className="flex items-center gap-2 text-xs">
                                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                            <span className="flex-1 truncate">
                                                                {registration.profiles?.first_name} {registration.profiles?.last_name}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs px-1 py-0">
                                                                {registration.staff_category}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                    {eventRegistrations.length > 3 && (
                                                        <div className="text-xs text-muted-foreground text-center pt-1">
                                                            +{eventRegistrations.length - 3} weitere
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </div>

                                {/* Staff Requirements */}
                                {selectedEvent.extendedProps?.staffRequirements && selectedEvent.extendedProps.staffRequirements.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <UserPlus className="h-5 w-5" />
                                            <h3 className="text-xl font-semibold">Personalanforderungen</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {selectedEvent.extendedProps.staffRequirements.map((requirement, index) => {
                                                const userRegistration = getUserRegistration(selectedEvent.id, requirement.category);
                                                const filledCount = getFilledCount(requirement.category);
                                                const isFullyBooked = filledCount >= requirement.count;
                                                                const canRegister = canRegisterForPosition(selectedEvent.extendedProps?.qualificationRequirements || [], requirement.category);
                                                                const missingQuals = getMissingQualifications(selectedEvent.extendedProps?.qualificationRequirements || [], requirement.category);
                                                                const pricing = getPricing(selectedEvent.extendedProps?.pricingStructure, requirement.category);
                                                                const isEditable = isEventEditable(selectedEvent.extendedProps?.status || '');

                                                return (
                                                    <Card key={index} className="transition-all duration-200 hover:shadow-md border-2 hover:border-primary/20">
                                                        <CardHeader className="pb-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <CardTitle className="text-lg font-semibold">
                                                                    {requirement.category}
                                                                </CardTitle>
                                                                <Badge 
                                                                    variant={isFullyBooked ? 'destructive' : filledCount > 0 ? 'secondary' : 'outline'}
                                                                    className="font-medium"
                                                                >
                                                                    {filledCount}/{requirement.count}
                                                                </Badge>
                                                            </div>
                                                            
                                                            {/* Progress Bar */}
                                                            <div className="w-full bg-muted rounded-full h-2">
                                                                <div 
                                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                                        isFullyBooked ? 'bg-red-500' : 'bg-primary'
                                                                    }`}
                                                                    style={{ width: `${Math.min((filledCount / requirement.count) * 100, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </CardHeader>
                                                        
                                                        <CardContent className="space-y-4">
                                                            {/* Pricing */}
                                                            {pricing && (pricing.hourly_rate || pricing.fixed_rate) && (
                                                                <div className="flex items-center gap-3 p-3 bg-card border rounded-lg">
                                                                    <div className="p-2 bg-green-500/10 rounded-md">
                                                                        <span className="text-xl text-green-600">€</span>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="font-semibold text-foreground">
                                                                            {pricing.hourly_rate ? `${pricing.hourly_rate} €/h` : ''}
                                                                            {pricing.hourly_rate && pricing.fixed_rate ? ' + ' : ''}
                                                                            {pricing.fixed_rate ? `${pricing.fixed_rate}€ fix` : ''}
                                                                        </div>
                                                                        <div className="text-xs text-green-600 font-medium">Vergütung</div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Missing Qualifications */}
                                                            {!canRegister && missingQuals.length > 0 && (
                                                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                                    <div className="flex items-center gap-2 mb-2 text-orange-700">
                                                                        <AlertTriangle className="h-4 w-4" />
                                                                        <span className="font-medium text-sm">Qualifikationen erforderlich</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {missingQuals.map((qual, qIndex) => (
                                                                            <Badge key={qIndex} variant="outline" className="text-xs border-orange-300 text-orange-700">
                                                                                {qual}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Registration Status & Button */}
                                                            <div className="space-y-3">
                                                                {userRegistration ? (
                                                                    <>
                                                                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                                            <span className="text-green-800 font-medium text-sm">Sie sind angemeldet</span>
                                                                        </div>
                                                                        {isEditable && (
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => handleUnregister(userRegistration.id)}
                                                                                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                                                            >
                                                                                <UserMinus className="h-4 w-4 mr-2" />
                                                                                Abmelden
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                ) : isEditable ? (
                                                                    <Button
                                                                        onClick={() => handleRegister(selectedEvent.id, requirement.category)}
                                                                        disabled={isFullyBooked || !canRegister}
                                                                        className="w-full"
                                                                        size="sm"
                                                                    >
                                                                        <UserPlus className="h-4 w-4 mr-2" />
                                                                        {isFullyBooked ? 'Ausgebucht' : !canRegister ? 'Qualifikation fehlt' : 'Anmelden'}
                                                                    </Button>
                                                                ) : null}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </main>
            <Footer />

            {/* Work Contract Dialog */}
            {contractEvent && contractStaffCategory && (
                <WorkContractDialog
                    isOpen={showContractDialog}
                    onClose={() => {
                        setShowContractDialog(false);
                        setContractEvent(null);
                        setContractStaffCategory('');
                        // Refresh data after contract creation
                        fetchUserRegistrations();
                        fetchEvents();
                        if (selectedEvent) {
                            fetchEventRegistrations(selectedEvent.id);
                        }
                    }}
                    eventId={contractEvent.id}
                    eventTitle={contractEvent.title}
                    eventStartDate={contractEvent.start}
                    eventEndDate={contractEvent.end || contractEvent.start}
                    staffCategory={contractStaffCategory}
                    userId={user?.id || ''}
                    userName={`${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim()}
                />
            )}
        </div>
    );
};

export default AnstehendeEventsEnhanced;