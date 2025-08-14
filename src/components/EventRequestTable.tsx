import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
    Mail,
    Building,
    Calendar,
    MapPin,
    MessageSquare,
    Users,
    Music,
    Camera,
    Video,
    Lightbulb,
    Volume2,
    Mic,
    Monitor,
    ChevronDown,
    ChevronUp,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Save,
    Phone
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EventRequest {
    id: string;
    offer_number: string;
    event_title: string;
    event_date: string;
    end_date?: string;
    location: string;
    guest_count: string;
    tech_requirements: string[];
    dj_genres: string[];
    photographer: boolean;
    videographer: boolean;
    light_operator: boolean;
    additional_wishes?: string;
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    contact_company?: string;
    contact_street: string;
    contact_house_number: string;
    contact_postal_code: string;
    contact_city: string;
    status: 'ANGEFRAGT' | 'IN_BEARBEITUNG' | 'ABGESCHLOSSEN';
    created_at: string;
    updated_at: string;
}

const EventRequestsTable = () => {
    const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const fetchEventRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('event_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching event requests:', error);
                toast({
                    title: "Fehler beim Laden",
                    description: "Die Angebotsanfragen konnten nicht geladen werden.",
                    variant: "destructive"
                });
                return;
            }

            setEventRequests(data || []);
        } catch (error) {
            console.error('Error fetching event requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventRequests();
    }, []);

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    const updateStatus = async (requestId: string, newStatus: 'ANGEFRAGT' | 'IN_BEARBEITUNG' | 'ABGESCHLOSSEN') => {
        setUpdatingStatus(prev => new Set(prev).add(requestId));

        try {
            console.log('Updating status for request:', requestId, 'to:', newStatus);

            const { data, error } = await supabase
                .from('event_requests')
                .update({ status: newStatus })
                .eq('id', requestId)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Status update successful:', data);

            // Update local state
            setEventRequests(prev =>
                prev.map(request =>
                    request.id === requestId
                        ? { ...request, status: newStatus }
                        : request
                )
            );

            toast({
                title: 'Status aktualisiert',
                description: `Der Status wurde erfolgreich auf "${newStatus.replace('_', ' ')}" geändert.`,
            });

        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: 'Fehler beim Status-Update',
                description: `Der Status konnte nicht aktualisiert werden: ${error?.message || 'Unbekannter Fehler'}`,
                variant: 'destructive',
            });
        } finally {
            setUpdatingStatus(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ANGEFRAGT':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
                return <AlertCircle className="w-4 h-4" />;
            case 'IN_BEARBEITUNG':
                return <Loader2 className="w-4 h-4" />;
            case 'ABGESCHLOSSEN':
                return <CheckCircle2 className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getTechIcon = (tech: string) => {
        const icons: { [key: string]: any } = {
            'sound': Volume2,
            'licht': Lightbulb,
            'buehne': Mic,
            'led': Monitor,
            'projektion': Camera
        };
        const IconComponent = icons[tech] || Volume2;
        return <IconComponent className="h-4 w-4" />;
    };

    const getTechLabel = (tech: string) => {
        const labels: { [key: string]: string } = {
            'sound': 'Soundsystem',
            'licht': 'Lichttechnik',
            'buehne': 'Bühnentechnik',
            'led': 'LED-Wände',
            'projektion': 'Projektion'
        };
        return labels[tech] || tech;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (eventRequests.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Noch keine Angebotsanfragen vorhanden.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6">
            {eventRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <Collapsible
                        open={expandedItems.has(request.id)}
                        onOpenChange={() => toggleExpanded(request.id)}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="outline" className="font-mono">
                                            {request.offer_number}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {request.guest_count === 'Noch nicht bekannt' ? request.guest_count : `${request.guest_count} Gäste`}
                                        </Badge>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                            <span>{request.status.replace('_', ' ')}</span>
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg">{request.event_title}</CardTitle>
                                    <CardDescription className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {format(new Date(request.event_date), 'dd.MM.yyyy', { locale: de })}
                                            {request.end_date && (
                                                <span> - {format(new Date(request.end_date), 'dd.MM.yyyy', { locale: de })}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {request.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: de })}
                                        </div>
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={request.status}
                                        onValueChange={(value: 'ANGEFRAGT' | 'IN_BEARBEITUNG' | 'ABGESCHLOSSEN') => updateStatus(request.id, value)}
                                        disabled={updatingStatus.has(request.id)}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ANGEFRAGT">Angefragt</SelectItem>
                                            <SelectItem value="IN_BEARBEITUNG">In Bearbeitung</SelectItem>
                                            <SelectItem value="ABGESCHLOSSEN">Abgeschlossen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            {expandedItems.has(request.id) ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                            </div>
                        </CardHeader>

                        <CollapsibleContent>
                            <CardContent className="pt-0 space-y-6">
                                {/* Kontaktinformationen */}
                                <div>
                                    <h4 className="font-semibold mb-3">Kontaktinformationen</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <a href={`mailto:${request.contact_email}`} className="text-primary hover:underline">
                                                    {request.contact_email}
                                                </a>
                                            </div>
                                            {request.contact_phone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <a href={`tel:${request.contact_phone}`} className="text-primary hover:underline">
                                                        {request.contact_phone}
                                                    </a>
                                                </div>
                                            )}
                                            <div className="text-sm">
                                                <strong>{request.contact_name}</strong>
                                            </div>
                                            {request.contact_company && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building className="h-4 w-4 text-muted-foreground" />
                                                    {request.contact_company}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <div>{request.contact_street} {request.contact_house_number}</div>
                                            <div>{request.contact_postal_code} {request.contact_city}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Veranstaltungstechnik */}
                                <div>
                                    <h4 className="font-semibold mb-3">Gewünschte Technik</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {request.tech_requirements.map((tech) => (
                                            <Badge key={tech} variant="outline" className="flex items-center gap-1">
                                                {getTechIcon(tech)}
                                                {getTechLabel(tech)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* DJ & Service */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {request.dj_genres.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <Music className="h-4 w-4" />
                                                DJ Genres
                                            </h4>
                                            <div className="flex flex-wrap gap-1">
                                                {request.dj_genres.map((genre) => (
                                                    <Badge key={genre} variant="secondary" className="text-xs">
                                                        {genre}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-semibold mb-3">Zusätzliche Services</h4>
                                        <div className="space-y-2">
                                            {request.photographer && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Camera className="h-4 w-4 text-primary" />
                                                    Fotograf
                                                </div>
                                            )}
                                            {request.videographer && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Video className="h-4 w-4 text-primary" />
                                                    Videograf
                                                </div>
                                            )}
                                            {request.light_operator && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Lightbulb className="h-4 w-4 text-primary" />
                                                    Lichtoperator
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Zusatzwünsche */}
                                {request.additional_wishes && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Zusatzwünsche
                                        </h4>
                                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                            {request.additional_wishes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>
            ))}
        </div>
    );
};

export default EventRequestsTable;