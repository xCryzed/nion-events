import { useState, useEffect } from 'react';
import { trackError } from '@/hooks/use-google-analytics';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, formatDistanceToNow } from 'date-fns';
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
    Phone,
    Info,
    HelpCircle,
    Search,
    Filter
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
    status: 'ANGEFRAGT' | 'IN_BEARBEITUNG' | 'ABGESCHLOSSEN' | 'RÜCKFRAGEN_OFFEN';
    created_at: string;
    updated_at: string;
}

const EventRequestsTable = () => {
    const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<EventRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const isMobile = useIsMobile();
    const { toast } = useToast();

    const fetchEventRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('event_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching event requests:', error);
                trackError(error.message, 'data_fetch', 'event_requests_table', {
                    query_type: 'fetch_all_requests'
                });
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
            trackError(error instanceof Error ? error : 'Event requests fetch failed', 'data_fetch', 'event_requests_table');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventRequests();
    }, []);

    useEffect(() => {
        let filtered = eventRequests;
        if (searchTerm) {
            filtered = filtered.filter((req) =>
                req.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.offer_number.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter((req) => req.status === statusFilter);
        }
        setFilteredRequests(filtered);
    }, [eventRequests, searchTerm, statusFilter]);

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    const updateStatus = async (requestId: string, newStatus: 'ANGEFRAGT' | 'IN_BEARBEITUNG' | 'ABGESCHLOSSEN' | 'RÜCKFRAGEN_OFFEN') => {
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
                trackError(error.message, 'data_update', 'event_requests_table', {
                    request_id: requestId,
                    new_status: newStatus,
                    error_code: error.code || 'unknown'
                });
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
            trackError(error instanceof Error ? error : 'Status update failed', 'data_update', 'event_requests_table', {
                request_id: requestId,
                new_status: newStatus
            });
            toast({
                title: 'Fehler beim Aktualisieren',
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
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'IN_BEARBEITUNG':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'RÜCKFRAGEN_OFFEN':
                return 'bg-orange-100 text-orange-800 border-orange-200';
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
            case 'RÜCKFRAGEN_OFFEN':
                return <HelpCircle className="w-4 h-4" />;
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

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
        } catch {
            return '-';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Angebotsanfragen durchsuchen..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status filtern" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border shadow-lg z-50">
                                <SelectItem value="all">Alle Status</SelectItem>
                                <SelectItem value="ANGEFRAGT">Angefragt</SelectItem>
                                <SelectItem value="IN_BEARBEITUNG">In Bearbeitung</SelectItem>
                                <SelectItem value="RÜCKFRAGEN_OFFEN">Rückfragen offen</SelectItem>
                                <SelectItem value="ABGESCHLOSSEN">Abgeschlossen</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isMobile ? (
                        <div className="space-y-4">
                            {filteredRequests.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Keine Angebotsanfragen gefunden.</p>
                                </div>
                            )}
                            {filteredRequests.map((request) => (
                                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                                    <Collapsible
                                        open={expandedItems.has(request.id)}
                                        onOpenChange={() => toggleExpanded(request.id)}
                                    >
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="font-mono">{request.offer_number}</Badge>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                                            {getStatusIcon(request.status)}
                                                            <span>{request.status.replace('_', ' ')}</span>
                                                        </span>
                                                    </div>
                                                    <div className="font-medium truncate">{request.event_title}</div>
                                                    <div className="text-xs text-muted-foreground flex flex-wrap gap-3 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(request.event_date)}
                                                            {request.end_date && ` - ${formatDate(request.end_date)}`}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {request.location}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: de })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Select
                                                        value={request.status}
                                                        onValueChange={(value: 'ANGEFRAGT' | 'IN_BEARBEITUNG' | 'ABGESCHLOSSEN' | 'RÜCKFRAGEN_OFFEN') => updateStatus(request.id, value)}
                                                        disabled={updatingStatus.has(request.id)}
                                                    >
                                                        <SelectTrigger className="w-40">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover border shadow-lg z-50">
                                                            <SelectItem value="ANGEFRAGT">Angefragt</SelectItem>
                                                            <SelectItem value="IN_BEARBEITUNG">In Bearbeitung</SelectItem>
                                                            <SelectItem value="RÜCKFRAGEN_OFFEN">Rückfragen offen</SelectItem>
                                                            <SelectItem value="ABGESCHLOSSEN">Abgeschlossen</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            {expandedItems.has(request.id) ? (
                                                                <>
                                                                    <ChevronUp className="h-4 w-4 mr-2" />
                                                                    Weniger
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown className="h-4 w-4 mr-2" />
                                                                    Details
                                                                </>
                                                            )}
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </div>
                                            </div>

                                            <CollapsibleContent>
                                                <div className="pt-3 border-t mt-3">
                                                    <div className="text-xs text-muted-foreground">
                                                        Kontakt: {request.contact_name} · {request.contact_email}
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </CardContent>
                                    </Collapsible>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vorgang</TableHead>
                                        <TableHead>Titel</TableHead>
                                        <TableHead>Datum</TableHead>
                                        <TableHead>Ort</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Kontakt</TableHead>
                                        <TableHead className="text-right">Aktion</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <FileText className="h-12 w-12 mb-2 opacity-50" />
                                                    Keine Angebotsanfragen gefunden.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRequests.map((request) => (
                                            <TableRow key={request.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="font-mono">{request.offer_number}</Badge>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                                            {getStatusIcon(request.status)}
                                                            <span>{request.status.replace('_', ' ')}</span>
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[320px] truncate">{request.event_title}</TableCell>
                                                <TableCell>
                                                    {formatDate(request.event_date)}
                                                    {request.end_date && ` - ${formatDate(request.end_date)}`}
                                                </TableCell>
                                                <TableCell>{request.location}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={request.status}
                                                        onValueChange={(value: 'ANGEFRAGT' | 'IN_BEARBEITUNG' | 'ABGESCHLOSSEN' | 'RÜCKFRAGEN_OFFEN') => updateStatus(request.id, value)}
                                                        disabled={updatingStatus.has(request.id)}
                                                    >
                                                        <SelectTrigger className="w-44">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover border shadow-lg z-50">
                                                            <SelectItem value="ANGEFRAGT">Angefragt</SelectItem>
                                                            <SelectItem value="IN_BEARBEITUNG">In Bearbeitung</SelectItem>
                                                            <SelectItem value="RÜCKFRAGEN_OFFEN">Rückfragen offen</SelectItem>
                                                            <SelectItem value="ABGESCHLOSSEN">Abgeschlossen</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="font-medium">{request.contact_name}</div>
                                                        <div className="text-xs text-muted-foreground">{request.contact_email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: de })}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EventRequestsTable;