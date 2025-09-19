import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, X, Award, FileText, Calendar, AlertTriangle, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface QualificationRequest {
    id: string;
    user_id: string;
    qualification_id: string;
    status: 'pending' | 'approved' | 'rejected';
    requested_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
    notes?: string;
    admin_notes?: string;
    proof_files?: any[];
    qualifications?: {
        id: string;
        name: string;
        description?: string;
        requires_proof?: boolean;
        proof_types?: string[];
        validity_period_months?: number;
        is_expirable?: boolean;
    };
    profiles?: {
        first_name: string;
        last_name: string;
    };
    reviewed_by_profile?: {
        first_name: string;
        last_name: string;
    };
}

interface UserQualification {
    id: string;
    user_id: string;
    qualification_id: string;
    acquired_date?: string;
    expires_at?: string;
    qualifications?: {
        name: string;
        is_expirable?: boolean;
        validity_period_months?: number;
    };
}

const QualificationRequestsTab = () => {
    const [pendingRequests, setPendingRequests] = useState<QualificationRequest[]>([]);
    const [processedRequests, setProcessedRequests] = useState<QualificationRequest[]>([]);
    const [expiringQualifications, setExpiringQualifications] = useState<UserQualification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<QualificationRequest | null>(null);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [customExpiryDate, setCustomExpiryDate] = useState('');
    const [validityStartDate, setValidityStartDate] = useState('');
    const [validityEndDate, setValidityEndDate] = useState('');
    const [reviewing, setReviewing] = useState(false);

    useEffect(() => {
        fetchQualificationRequests();
        fetchExpiringQualifications();
    }, []);

    const fetchQualificationRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('qualification_requests')
                .select(`
                    id,
                    user_id,
                    qualification_id,
                    status,
                    requested_at,
                    reviewed_at,
                    reviewed_by,
                    notes,
                    admin_notes,
                    proof_files
                `)
                .order('requested_at', { ascending: false });

            if (error) throw error;

            // Fetch related data
            const userIds = [...new Set(data?.map(req => req.user_id) || [])];
            const qualificationIds = [...new Set(data?.map(req => req.qualification_id) || [])];
            const reviewerIds = [...new Set(data?.map(req => req.reviewed_by).filter(Boolean) || [])];

            const [profilesData, qualificationsData, reviewerProfilesData] = await Promise.all([
                userIds.length > 0 ? supabase
                    .from('profiles')
                    .select('user_id, first_name, last_name')
                    .in('user_id', userIds) : Promise.resolve({ data: [] }),
                qualificationIds.length > 0 ? supabase
                    .from('qualifications')
                    .select('id, name, description, requires_proof, proof_types, validity_period_months, is_expirable')
                    .in('id', qualificationIds) : Promise.resolve({ data: [] }),
                reviewerIds.length > 0 ? supabase
                    .from('profiles')
                    .select('user_id, first_name, last_name')
                    .in('user_id', reviewerIds) : Promise.resolve({ data: [] })
            ]);

            const requestsWithData = (data || []).map(request => ({
                ...request,
                profiles: profilesData.data?.find(p => p.user_id === request.user_id),
                qualifications: qualificationsData.data?.find(q => q.id === request.qualification_id),
                reviewed_by_profile: request.reviewed_by ? 
                    reviewerProfilesData.data?.find(p => p.user_id === request.reviewed_by) : undefined
            })) as QualificationRequest[];

            setPendingRequests(requestsWithData.filter(req => req.status === 'pending'));
            setProcessedRequests(requestsWithData.filter(req => req.status !== 'pending'));
        } catch (error) {
            console.error('Error fetching qualification requests:', error);
            toast.error('Fehler beim Laden der Qualifikationsanfragen');
        } finally {
            setLoading(false);
        }
    };

    const fetchExpiringQualifications = async () => {
        try {
            const { data, error } = await supabase
                .from('employee_qualifications')
                .select(`
                    id,
                    user_id,
                    qualification_id,
                    acquired_date,
                    expires_at,
                    qualifications (
                        name,
                        is_expirable,
                        validity_period_months
                    ),
                    profiles (
                        first_name,
                        last_name
                    )
                `)
                .not('expires_at', 'is', null)
                .gte('expires_at', new Date().toISOString().split('T')[0])
                .lte('expires_at', addDays(new Date(), 60).toISOString().split('T')[0])
                .order('expires_at', { ascending: true });

            if (error) throw error;

            setExpiringQualifications(data || []);
        } catch (error) {
            console.error('Error fetching expiring qualifications:', error);
        }
    };

    const handleReviewRequest = (request: QualificationRequest) => {
        setSelectedRequest(request);
        setAdminNotes('');

        const todayStr = new Date().toISOString().split('T')[0];
        setValidityStartDate(todayStr);
        
        // Standard-Ablaufdatum setzen, wenn die Qualifikation eine Gültigkeitsdauer hat
        if (request.qualifications?.is_expirable && request.qualifications?.validity_period_months) {
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + request.qualifications.validity_period_months);
            const expiryStr = expiryDate.toISOString().split('T')[0];
            setCustomExpiryDate(expiryStr);
            setValidityEndDate(expiryStr);
        } else {
            setCustomExpiryDate('');
            setValidityEndDate('');
        }
        
        setShowReviewDialog(true);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        setReviewing(true);
        try {
            // Validierung des Gültigkeitszeitraums für ablaufende Qualifikationen
            if (selectedRequest.qualifications?.is_expirable) {
                if (!validityStartDate || !validityEndDate) {
                    toast.error('Bitte wählen Sie einen gültigen Zeitraum (von/bis).');
                    setReviewing(false);
                    return;
                }
                if (new Date(validityEndDate) < new Date(validityStartDate)) {
                    toast.error('Das Enddatum darf nicht vor dem Startdatum liegen.');
                    setReviewing(false);
                    return;
                }
            }

            const { error } = await supabase
                .from('qualification_requests')
                .update({
                    status: 'approved',
                    admin_notes: adminNotes || null,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: (await supabase.auth.getUser()).data.user?.id
                })
                .eq('id', selectedRequest.id);

            if (error) throw error;

            // Immer eine employee_qualifications Zuordnung erstellen oder aktualisieren
            const qualificationData: any = {
                user_id: selectedRequest.user_id,
                qualification_id: selectedRequest.qualification_id,
                proof_files: selectedRequest.proof_files || []
            };

            // Gültigkeitszeitraum setzen, wenn die Qualifikation ablaufen kann
            if (selectedRequest.qualifications?.is_expirable) {
                qualificationData.acquired_date = validityStartDate;
                qualificationData.expires_at = validityEndDate;
            } else {
                qualificationData.acquired_date = new Date().toISOString().split('T')[0];
                qualificationData.expires_at = null;
            }

            // Erst prüfen, ob bereits ein Eintrag existiert
            const { data: existingQualification, error: checkError } = await supabase
                .from('employee_qualifications')
                .select('id')
                .eq('user_id', selectedRequest.user_id)
                .eq('qualification_id', selectedRequest.qualification_id)
                .single();

            let qualificationError = null;

            if (existingQualification) {
                // Update existierenden Eintrag
                const { error: updateError } = await supabase
                    .from('employee_qualifications')
                    .update(qualificationData)
                    .eq('id', existingQualification.id);
                qualificationError = updateError;
            } else {
                // Neuen Eintrag erstellen
                const { error: insertError } = await supabase
                    .from('employee_qualifications')
                    .insert(qualificationData);
                qualificationError = insertError;
            }

            if (qualificationError) {
                console.error('Error managing employee qualification:', qualificationError);
                toast.error('Qualifikation genehmigt, aber Zuordnung konnte nicht gespeichert werden');
            } else {
                if (selectedRequest.qualifications?.is_expirable) {
                    toast.success('Qualifikation genehmigt und Gültigkeitszeitraum gesetzt!');
                } else {
                    toast.success('Qualifikation erfolgreich genehmigt!');
                }
            }

            setShowReviewDialog(false);
            fetchQualificationRequests();
            fetchExpiringQualifications();
        } catch (error) {
            console.error('Error approving request:', error);
            toast.error('Fehler beim Genehmigen der Anfrage');
        } finally {
            setReviewing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        setReviewing(true);
        try {
            const { error } = await supabase
                .from('qualification_requests')
                .update({
                    status: 'rejected',
                    admin_notes: adminNotes || null,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: (await supabase.auth.getUser()).data.user?.id
                })
                .eq('id', selectedRequest.id);

            if (error) throw error;

            toast.success('Anfrage abgelehnt');
            setShowReviewDialog(false);
            fetchQualificationRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error('Fehler beim Ablehnen der Anfrage');
        } finally {
            setReviewing(false);
        }
    };

    const downloadProofFile = async (filePath: string, fileName: string) => {
        try {
            const { data, error } = await supabase.storage
                .from('personalakten')
                .download(filePath);

            if (error) throw error;

            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Fehler beim Herunterladen der Datei');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Genehmigt
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="destructive">
                        <X className="w-3 h-3 mr-1" />
                        Abgelehnt
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Ausstehend
                    </Badge>
                );
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Qualifikationsanfragen</h2>
                <p className="text-muted-foreground">
                    Bearbeiten Sie Qualifikationsanfragen von Mitarbeitern und verwalten Sie Ablaufdaten
                </p>
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Ausstehend ({pendingRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="processed" className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Bearbeitet ({processedRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="expiring" className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Ablaufend ({expiringQualifications.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pendingRequests.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">Keine ausstehenden Anfragen</h3>
                                <p className="text-muted-foreground">
                                    Alle Qualifikationsanfragen wurden bearbeitet.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map((request) => (
                                <Card key={request.id} className="border-l-4 border-l-orange-400">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">
                                                    {request.qualifications?.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    Angefragt von {request.profiles?.first_name} {request.profiles?.last_name}
                                                    <br />
                                                    am {format(new Date(request.requested_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(request.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {request.qualifications?.description && (
                                            <div className="p-3 bg-muted rounded-lg">
                                                <p className="text-sm">
                                                    <strong>Qualifikation:</strong> {request.qualifications.description}
                                                </p>
                                            </div>
                                        )}

                                        {request.notes && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Mitarbeiter-Notiz:</strong> {request.notes}
                                                </p>
                                            </div>
                                        )}

                                        {request.qualifications?.requires_proof && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <FileText className="w-4 h-4" />
                                                    <span>Erforderliche Nachweise:</span>
                                                </div>
                                                {request.qualifications.proof_types && (
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {request.qualifications.proof_types.map((type, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {type}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                 {request.proof_files && request.proof_files.length > 0 ? (
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium">Hochgeladene Dateien:</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {request.proof_files.map((file: any, index: number) => (
                                                                <div key={index} className="flex items-center gap-2 p-2 bg-background border border-border rounded">
                                                                    <FileText className="w-4 h-4 text-primary" />
                                                                    <span className="flex-1 text-sm truncate text-foreground">{file.name}</span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => downloadProofFile(file.path, file.name)}
                                                                        className="h-6 w-6 p-0"
                                                                    >
                                                                        <Download className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                        <p className="text-sm text-amber-800">
                                                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                                                            Keine Nachweise hochgeladen
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {request.qualifications?.is_expirable && (
                                            <div className="p-3 bg-accent/20 border border-accent rounded-lg">
                                                <div className="flex items-center gap-2 text-foreground">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        Ablaufende Qualifikation - Gültigkeitsdauer: {request.qualifications.validity_period_months} Monate
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleReviewRequest(request)}
                                                className="flex-1"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Bearbeiten
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="processed" className="space-y-4">
                    {processedRequests.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">Keine bearbeiteten Anfragen</h3>
                                <p className="text-muted-foreground">
                                    Hier erscheinen bearbeitete Qualifikationsanfragen.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {processedRequests.map((request) => (
                                <Card key={request.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">
                                                    {request.qualifications?.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    Angefragt von {request.profiles?.first_name} {request.profiles?.last_name}
                                                    <br />
                                                    Bearbeitet am {request.reviewed_at && format(new Date(request.reviewed_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                                                    {request.reviewed_by_profile && (
                                                        <> von {request.reviewed_by_profile.first_name} {request.reviewed_by_profile.last_name}</>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(request.status)}
                                        </div>
                                    </CardHeader>
                                    {request.admin_notes && (
                                        <CardContent>
                                            <div className={`p-3 rounded-lg ${
                                                request.status === 'approved' ? 'bg-green-50 border border-green-200' : 
                                                'bg-red-50 border border-red-200'
                                            }`}>
                                                <p className={`text-sm ${
                                                    request.status === 'approved' ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                    <strong>Administrator-Notiz:</strong> {request.admin_notes}
                                                </p>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="expiring" className="space-y-4">
                    {expiringQualifications.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">Keine ablaufenden Qualifikationen</h3>
                                <p className="text-muted-foreground">
                                    Alle Qualifikationen sind aktuell gültig.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {expiringQualifications.map((qualification: any) => {
                                const isExpiringSoon = qualification.expires_at && 
                                    isBefore(new Date(qualification.expires_at), addDays(new Date(), 30));
                                
                                return (
                                    <Card key={qualification.id} className={`${
                                        isExpiringSoon ? 'border-l-4 border-l-orange-400' : 'border-l-4 border-l-yellow-400'
                                    }`}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-lg">
                                                        {qualification.qualifications?.name}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Mitarbeiter: {qualification.profiles?.first_name} {qualification.profiles?.last_name}
                                                        <br />
                                                        Läuft ab am {format(new Date(qualification.expires_at), 'dd.MM.yyyy', { locale: de })}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant={isExpiringSoon ? "destructive" : "outline"} className={
                                                    isExpiringSoon ? "" : "bg-yellow-100 text-yellow-700 border-yellow-300"
                                                }>
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    {isExpiringSoon ? 'Bald abgelaufen' : 'Läuft ab'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Review Dialog */}
            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Qualifikationsanfrage bearbeiten</DialogTitle>
                    </DialogHeader>
                    
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold">{selectedRequest.qualifications?.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Angefragt von {selectedRequest.profiles?.first_name} {selectedRequest.profiles?.last_name}
                                </p>
                                {selectedRequest.qualifications?.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {selectedRequest.qualifications.description}
                                    </p>
                                )}
                            </div>

                            {selectedRequest.notes && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Mitarbeiter-Notiz:</strong> {selectedRequest.notes}
                                    </p>
                                </div>
                            )}

                                {selectedRequest.qualifications?.is_expirable && (
                                    <div className="space-y-2">
                                        <Label>Gültigkeitszeitraum festlegen</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="valid-from" className="text-xs text-muted-foreground">Gültig ab</Label>
                                                <Input
                                                    id="valid-from"
                                                    type="date"
                                                    value={validityStartDate}
                                                    onChange={(e) => setValidityStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="valid-until" className="text-xs text-muted-foreground">Gültig bis</Label>
                                                <Input
                                                    id="valid-until"
                                                    type="date"
                                                    value={validityEndDate}
                                                    onChange={(e) => setValidityEndDate(e.target.value)}
                                                    min={validityStartDate || undefined}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Standard-Gültigkeit: {selectedRequest.qualifications.validity_period_months} Monate
                                        </p>
                                    </div>
                                )}

                            <div className="space-y-2">
                                <Label htmlFor="admin-notes">Administrator-Notiz (optional)</Label>
                                <Textarea
                                    id="admin-notes"
                                    placeholder="Notiz zur Entscheidung..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowReviewDialog(false)}
                                    className="flex-1"
                                    disabled={reviewing}
                                >
                                    Abbrechen
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleReject}
                                    className="flex-1"
                                    disabled={reviewing}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Ablehnen
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    className="flex-1"
                                    disabled={reviewing}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Genehmigen
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default QualificationRequestsTab;