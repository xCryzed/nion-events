import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, Users, Plus, Minus, Trash2, Edit, Eye, UserCheck, UserX, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface InternalEvent {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    end_date: string | null;
    location: string;
    guest_count: number | null;
    status: string;
    staff_requirements: any; // Allow any type for JSON data
    notes: string | null;
    created_at: string;
}

interface StaffRequirement {
    category: string;
    count: number;
    filled: number;
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

const STAFF_CATEGORIES = [
    'DJ',
    'Kellner',
    'Lichtoperator',
    'Aufbauhelfer',
    'Einlasspersonal',
    'Fotografin',
    'Videograf',
    'Techniker',
    'Standbetreuung',
    'Sicherheitspersonal',
    'Barkeeper',
    'Service',
    'Moderator'
];

const EventsTab = () => {
    const [events, setEvents] = useState<InternalEvent[]>([]);
    const [archivedEvents, setArchivedEvents] = useState<InternalEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<InternalEvent | null>(null);
    const [eventRegistrations, setEventRegistrations] = useState<Record<string, EventRegistration[]>>({});
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        end_date: '',
        location: '',
        guest_count: '',
        status: 'geplant',
        notes: ''
    });

    const [staffRequirements, setStaffRequirements] = useState<StaffRequirement[]>([
        { category: 'DJ', count: 1, filled: 0 }
    ]);

    // Personal assignment state
    const [showPersonalDialog, setShowPersonalDialog] = useState(false);
    const [selectedEventForPersonal, setSelectedEventForPersonal] = useState<string>('');
    const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedStaffCategory, setSelectedStaffCategory] = useState('');

    useEffect(() => {
        fetchEvents();
        fetchArchivedEvents();
        fetchAllRegistrations();
        fetchAvailableEmployees();
    }, []);

    const fetchEvents = async () => {
        try {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from('internal_events')
                .select('*')
                .gte('event_date', now)
                .order('event_date', { ascending: true });

            if (error) throw error;
            const formattedEvents = data?.map(event => {
                let staffRequirements = [];
                if (event.staff_requirements) {
                    if (typeof event.staff_requirements === 'string') {
                        try {
                            staffRequirements = JSON.parse(event.staff_requirements);
                        } catch (e) {
                            console.error('Error parsing staff_requirements:', e);
                            staffRequirements = [];
                        }
                    } else if (Array.isArray(event.staff_requirements)) {
                        staffRequirements = event.staff_requirements;
                    }
                }
                return {
                    ...event,
                    staff_requirements: staffRequirements
                };
            }) || [];
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Fehler beim Laden der Events');
        } finally {
            setLoading(false);
        }
    };

    const fetchArchivedEvents = async () => {
        try {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from('internal_events')
                .select('*')
                .lt('event_date', now)
                .order('event_date', { ascending: false });

            if (error) throw error;
            const formattedEvents = data?.map(event => {
                let staffRequirements = [];
                if (event.staff_requirements) {
                    if (typeof event.staff_requirements === 'string') {
                        try {
                            staffRequirements = JSON.parse(event.staff_requirements);
                        } catch (e) {
                            console.error('Error parsing staff_requirements:', e);
                            staffRequirements = [];
                        }
                    } else if (Array.isArray(event.staff_requirements)) {
                        staffRequirements = event.staff_requirements;
                    }
                }
                return {
                    ...event,
                    staff_requirements: staffRequirements
                };
            }) || [];
            setArchivedEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching archived events:', error);
            toast.error('Fehler beim Laden der archivierten Events');
        }
    };

    const fetchAllRegistrations = async () => {
        try {
            // Get all registrations
            const { data: registrationsData, error: regError } = await supabase
                .from('event_registrations')
                .select('*')
                .order('created_at', { ascending: false });

            if (regError) throw regError;

            // Get user profiles
            const userIds = [...new Set(registrationsData?.map(reg => reg.user_id) || [])];
            let profilesData: any[] = [];
            if (userIds.length > 0) {
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('user_id, first_name, last_name')
                    .in('user_id', userIds);

                if (!profileError) {
                    profilesData = profiles || [];
                }
            }

            // Group registrations by event and enrich with user data
            const registrationsByEvent: Record<string, EventRegistration[]> = {};
            registrationsData?.forEach(reg => {
                if (!registrationsByEvent[reg.event_id]) {
                    registrationsByEvent[reg.event_id] = [];
                }
                registrationsByEvent[reg.event_id].push({
                    ...reg,
                    profiles: profilesData.find(p => p.user_id === reg.user_id)
                });
            });

            setEventRegistrations(registrationsByEvent);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    };

    const fetchAvailableEmployees = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    user_id,
                    first_name,
                    last_name,
                    user_roles!inner(role)
                `)
                .in('user_roles.role', ['employee', 'administrator']);

            if (error) throw error;
            setAvailableEmployees(data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const addPersonalToEvent = (eventId: string) => {
        setSelectedEventForPersonal(eventId);
        setSelectedEmployee('');
        setSelectedStaffCategory('DJ');
        setShowPersonalDialog(true);
    };

    const assignPersonalToEvent = async () => {
        if (!selectedEmployee || !selectedStaffCategory || !selectedEventForPersonal) return;

        try {
            // Check if this person is already assigned to this event
            const { data: existingRegistration, error: checkError } = await supabase
                .from('event_registrations')
                .select('id')
                .eq('event_id', selectedEventForPersonal)
                .eq('user_id', selectedEmployee)
                .eq('staff_category', selectedStaffCategory)
                .single();

            if (existingRegistration) {
                toast.error('Diese Person ist bereits für diese Kategorie zugewiesen');
                return;
            }

            const { error } = await supabase
                .from('event_registrations')
                .insert({
                    event_id: selectedEventForPersonal,
                    user_id: selectedEmployee,
                    staff_category: selectedStaffCategory,
                    status: 'bestätigt'
                });

            if (error) throw error;

            toast.success('Personal erfolgreich zugewiesen');
            setShowPersonalDialog(false);
            fetchAllRegistrations();
        } catch (error) {
            console.error('Error assigning personal:', error);
            toast.error('Fehler beim Zuweisen des Personals');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            event_date: '',
            end_date: '',
            location: '',
            guest_count: '',
            status: 'geplant',
            notes: ''
        });
        setStaffRequirements([{ category: 'DJ', count: 1, filled: 0 }]);
        setEditingEvent(null);
        setShowForm(false);
    };

    const startEditing = (event: InternalEvent) => {
        setFormData({
            title: event.title,
            description: event.description || '',
            event_date: event.event_date.slice(0, 16), // Format for datetime-local
            end_date: event.end_date ? event.end_date.slice(0, 16) : '',
            location: event.location,
            guest_count: event.guest_count?.toString() || '',
            status: event.status,
            notes: event.notes || ''
        });

        // Parse staff requirements properly
        let staffReqs = [];
        if (event.staff_requirements) {
            if (typeof event.staff_requirements === 'string') {
                try {
                    staffReqs = JSON.parse(event.staff_requirements);
                } catch (e) {
                    console.error('Error parsing staff_requirements:', e);
                    staffReqs = [{ category: 'DJ', count: 1, filled: 0 }];
                }
            } else if (Array.isArray(event.staff_requirements)) {
                staffReqs = event.staff_requirements;
            }
        }

        if (staffReqs.length === 0) {
            staffReqs = [{ category: 'DJ', count: 1, filled: 0 }];
        }

        setStaffRequirements(staffReqs);
        setEditingEvent(event);
        setShowForm(true);

        // Smooth scroll to form instead of jumping
        setTimeout(() => {
            const formElement = document.querySelector('#event-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const eventData = {
                title: formData.title,
                description: formData.description || null,
                event_date: formData.event_date,
                end_date: formData.end_date || null,
                location: formData.location,
                guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
                status: formData.status,
                staff_requirements: JSON.stringify(staffRequirements) as any,
                notes: formData.notes || null
            };

            if (editingEvent) {
                const { error } = await supabase
                    .from('internal_events')
                    .update(eventData)
                    .eq('id', editingEvent.id);

                if (error) throw error;
                toast.success('Event erfolgreich aktualisiert');
            } else {
                const { error } = await supabase
                    .from('internal_events')
                    .insert(eventData);

                if (error) throw error;
                toast.success('Event erfolgreich erstellt');
            }

            resetForm();
            fetchEvents();
            fetchArchivedEvents();
            fetchAllRegistrations();
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error('Fehler beim Speichern des Events');
        }
    };

    const deleteEvent = async (eventId: string) => {
        if (!confirm('Sind Sie sicher, dass Sie dieses Event löschen möchten?')) return;

        try {
            const { error } = await supabase
                .from('internal_events')
                .delete()
                .eq('id', eventId);

            if (error) throw error;
            toast.success('Event erfolgreich gelöscht');
            fetchEvents();
            fetchArchivedEvents();
            fetchAllRegistrations();
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Fehler beim Löschen des Events');
        }
    };

    const addStaffRequirement = () => {
        setStaffRequirements([...staffRequirements, { category: 'Kellner', count: 1, filled: 0 }]);
    };

    const removeStaffRequirement = (index: number) => {
        setStaffRequirements(staffRequirements.filter((_, i) => i !== index));
    };

    const updateStaffRequirement = (index: number, field: keyof StaffRequirement, value: string | number) => {
        const updated = [...staffRequirements];
        if (field === 'count' || field === 'filled') {
            // Ensure numeric fields are properly converted
            const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
            updated[index] = { ...updated[index], [field]: numValue };
        } else {
            updated[index] = { ...updated[index], [field]: value as string };
        }
        setStaffRequirements(updated);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'geplant': return 'bg-blue-100 text-blue-800';
            case 'laufend': return 'bg-yellow-100 text-yellow-800';
            case 'abgeschlossen': return 'bg-green-100 text-green-800';
            case 'abgesagt': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRegistrationStatusColor = (status: string) => {
        switch (status) {
            case 'angemeldet': return 'bg-blue-100 text-blue-800';
            case 'bestätigt': return 'bg-green-100 text-green-800';
            case 'abgelehnt': return 'bg-red-100 text-red-800';
            case 'zurückgezogen': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRegistrationStatusIcon = (status: string) => {
        switch (status) {
            case 'bestätigt': return <UserCheck className="w-4 h-4" />;
            case 'abgelehnt': return <UserX className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const updateRegistrationStatus = async (registrationId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('event_registrations')
                .update({ status: newStatus })
                .eq('id', registrationId);

            if (error) throw error;

            toast.success('Status erfolgreich aktualisiert');
            fetchAllRegistrations();
        } catch (error) {
            console.error('Error updating registration status:', error);
            toast.error('Fehler beim Aktualisieren des Status');
        }
    };

    const toggleEventExpansion = (eventId: string) => {
        const newExpanded = new Set(expandedEvents);
        if (newExpanded.has(eventId)) {
            newExpanded.delete(eventId);
        } else {
            newExpanded.add(eventId);
        }
        setExpandedEvents(newExpanded);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const renderEventList = (eventList: InternalEvent[], isArchived = false) => (
        <div className="grid gap-4">
            {eventList.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                            {isArchived ? 'Keine archivierten Events' : 'Keine aktuellen Events vorhanden'}
                        </h3>
                        <p className="text-muted-foreground">
                            {isArchived ? 'Alle vergangenen Events werden hier angezeigt.' : 'Erstellen Sie Ihr erstes Event über den Button oben.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                eventList.map((event) => (
                    <Card key={event.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2">
                                        {event.title}
                                        <Badge className={getStatusColor(event.status)}>
                                            {event.status}
                                        </Badge>
                                    </CardTitle>
                                    <div className="mt-2">
                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                          {format(new Date(event.event_date), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </span>
                                            <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                                                {event.location}
                      </span>
                                            {event.guest_count && (
                                                <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                                                    {event.guest_count} Gäste
                        </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => toggleEventExpansion(event.id)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        {expandedEvents.has(event.id) ? 'Weniger anzeigen' : 'Anmeldungen anzeigen'}
                                    </Button>
                                    {!isArchived && (
                                        <>
                                            <Button onClick={() => startEditing(event)} variant="outline" size="sm">
                                                <Edit className="w-4 h-4 mr-1" />
                                                Bearbeiten
                                            </Button>
                                            <Button onClick={() => deleteEvent(event.id)} variant="outline" size="sm">
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Löschen
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {event.description && (
                                <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                            )}

                            {event.staff_requirements && event.staff_requirements.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-semibold text-sm mb-2">Personal-Anforderungen:</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {event.staff_requirements.map((staff, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                                <span className="text-sm font-medium">{staff.category}</span>
                                                <Badge variant={staff.filled >= staff.count ? "default" : "outline"}>
                                                    {staff.filled}/{staff.count}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {event.notes && (
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-1">Notizen:</h4>
                                    <p className="text-sm">{event.notes}</p>
                                </div>
                            )}

                                {/* Event Registrations Section */}
                            {expandedEvents.has(event.id) && (
                                <div className="mt-6 pt-6 border-t">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-lg flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Personalzuweisung ({eventRegistrations[event.id]?.length || 0})
                                        </h4>
                                        <Button
                                            onClick={() => addPersonalToEvent(event.id)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Personal hinzufügen
                                        </Button>
                                    </div>

                                    {eventRegistrations[event.id]?.length > 0 ? (
                                        <div className="space-y-3">
                                            {eventRegistrations[event.id].map((registration) => (
                                                <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            {getRegistrationStatusIcon(registration.status)}
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {registration.profiles?.first_name} {registration.profiles?.last_name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {registration.staff_category}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <Badge className={getRegistrationStatusColor(registration.status)}>
                                                            {registration.status}
                                                        </Badge>
                                                    </div>

                                    <div className="flex items-center gap-3">
                                                        <p className="text-xs text-muted-foreground">
                                                            {format(new Date(registration.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                                                        </p>

                                                        <Select
                                                            value={registration.status}
                                                            onValueChange={(value) => updateRegistrationStatus(registration.id, value)}
                                                        >
                                                            <SelectTrigger className="w-[130px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="angemeldet">Angemeldet</SelectItem>
                                                                <SelectItem value="bestätigt">Bestätigt</SelectItem>
                                                                <SelectItem value="abgelehnt">Abgelehnt</SelectItem>
                                                                <SelectItem value="zurückgezogen">Zurückgezogen</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                     ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">
                                                {isArchived 
                                                    ? 'Kein Personal für dieses Event zugewiesen'
                                                    : 'Noch keine Anmeldungen für dieses Event'
                                                }
                                            </p>
                                        </div>
                                     )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Veranstaltungen</h2>
                    <p className="text-muted-foreground">Verwalten Sie interne Events und Personal-Anforderungen</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="btn-hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Neues Event
                </Button>
            </div>

            {showForm && (
                <Card id="event-form">
                    <CardHeader>
                        <CardTitle>{editingEvent ? 'Event bearbeiten' : 'Neues Event erstellen'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Event Titel *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="location">Location *</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="event_date">Start Datum/Zeit *</Label>
                                    <Input
                                        id="event_date"
                                        type="datetime-local"
                                        value={formData.event_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="end_date">End Datum/Zeit</Label>
                                    <Input
                                        id="end_date"
                                        type="datetime-local"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="guest_count">Anzahl Gäste</Label>
                                    <Input
                                        id="guest_count"
                                        type="number"
                                        value={formData.guest_count}
                                        onChange={(e) => setFormData(prev => ({ ...prev, guest_count: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="geplant">Geplant</SelectItem>
                                            <SelectItem value="laufend">Laufend</SelectItem>
                                            <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                                            <SelectItem value="abgesagt">Abgesagt</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Beschreibung</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="notes">Notizen</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={2}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <Label>Personal-Anforderungen</Label>
                                    <Button type="button" onClick={addStaffRequirement} variant="outline" size="sm">
                                        <Plus className="w-4 h-4 mr-1" />
                                        Hinzufügen
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {staffRequirements.map((staff, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                            <Select
                                                value={staff.category}
                                                onValueChange={(value) => updateStaffRequirement(index, 'category', value)}
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STAFF_CATEGORIES.map(category => (
                                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <div className="flex items-center gap-1">
                                                <Label className="text-xs">Benötigt:</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={staff.count}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Allow empty string for editing or valid numbers
                                                        if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                                                            updateStaffRequirement(index, 'count', value === '' ? '' : parseInt(value));
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || parseInt(value) < 1) {
                                                            updateStaffRequirement(index, 'count', 1);
                                                        }
                                                    }}
                                                    className="w-20"
                                                />
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Label className="text-xs">Besetzt:</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={staff.count}
                                                    value={staff.filled}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Allow empty string for editing or valid numbers
                                                        if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                                                            const numValue = value === '' ? 0 : parseInt(value);
                                                            if (value === '' || numValue <= staff.count) {
                                                                updateStaffRequirement(index, 'filled', numValue);
                                                            }
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        if (isNaN(value) || value < 0) {
                                                            updateStaffRequirement(index, 'filled', 0);
                                                        } else if (value > staff.count) {
                                                            updateStaffRequirement(index, 'filled', staff.count);
                                                        }
                                                    }}
                                                    className="w-20"
                                                />
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={() => removeStaffRequirement(index)}
                                                variant="outline"
                                                size="sm"
                                                disabled={staffRequirements.length <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="btn-hero">
                                    {editingEvent ? 'Event aktualisieren' : 'Event erstellen'}
                                </Button>
                                <Button type="button" onClick={resetForm} variant="outline">
                                    Abbrechen
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="current" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="current">
                        Aktuelle Events ({events.length})
                    </TabsTrigger>
                    <TabsTrigger value="archived">
                        Archivierte Events ({archivedEvents.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="current" className="mt-6">
                    {renderEventList(events, false)}
                </TabsContent>

                <TabsContent value="archived" className="mt-6">
                    {renderEventList(archivedEvents, true)}
                </TabsContent>
            </Tabs>

            {/* Personal Assignment Dialog */}
            <Dialog open={showPersonalDialog} onOpenChange={setShowPersonalDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Personal zu Event hinzufügen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="employee-select">Mitarbeiter auswählen</Label>
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Mitarbeiter auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableEmployees.map((employee) => (
                                        <SelectItem key={employee.user_id} value={employee.user_id}>
                                            {employee.first_name} {employee.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="category-select">Position</Label>
                            <Select value={selectedStaffCategory} onValueChange={setSelectedStaffCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STAFF_CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowPersonalDialog(false)}
                            >
                                Abbrechen
                            </Button>
                            <Button 
                                onClick={assignPersonalToEvent}
                                disabled={!selectedEmployee || !selectedStaffCategory}
                            >
                                Zuweisen
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventsTab;