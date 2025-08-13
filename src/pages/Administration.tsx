import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import {
    Mail,
    Phone,
    Building,
    Calendar,
    MapPin,
    MessageSquare,
    Users,
    Save,
    X,
    BarChart3,
    Settings
} from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import AdminDashboard from '@/components/AdminDashboard';

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

interface UserProfile {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    created_at: string;
    user_roles?: Array<{ role: string }>;
}

const Administration = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{first_name: string; last_name: string; role: string}>({
        first_name: '',
        last_name: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Check authentication and admin role
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) {
                toast({
                    title: "Zugriff verweigert",
                    description: "Sie müssen angemeldet sein, um auf die Administration zuzugreifen.",
                    variant: "destructive"
                });
                setLoading(false);
            } else {
                checkAdminRole(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                if (session) {
                    checkAdminRole(session.user.id);
                } else {
                    setIsAdmin(false);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const checkAdminRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .eq('role', 'administrator')
                .single();

            if (!error && data) {
                setIsAdmin(true);
                await Promise.all([fetchContactRequests(), fetchUsers()]);
            } else {
                setIsAdmin(false);
                toast({
                    title: "Zugriff verweigert",
                    description: "Sie haben keine Berechtigung für die Administration.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            setIsAdmin(false);
            toast({
                title: "Fehler",
                description: "Fehler beim Überprüfen der Berechtigungen.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

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

    const fetchUsers = async () => {
        try {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select(`
          id,
          user_id,
          first_name,
          last_name,
          created_at
        `)
                .order('created_at', { ascending: false });

            if (profilesError) {
                console.error('Error fetching profiles:', profilesError);
                return;
            }

            // Fetch roles for each user
            const usersWithRoles = await Promise.all(
                (profiles || []).map(async (profile) => {
                    const { data: roles } = await supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', profile.user_id);

                    return {
                        ...profile,
                        user_roles: roles || []
                    };
                })
            );

            setUsers(usersWithRoles);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const startEditing = (user: UserProfile) => {
        setEditingUser(user.id);
        setEditForm({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            role: user.user_roles?.[0]?.role || 'user'
        });
    };

    const cancelEditing = () => {
        setEditingUser(null);
        setEditForm({ first_name: '', last_name: '', role: 'user' });
    };

    const saveUser = async (userId: string) => {
        try {
            // Update profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    first_name: editForm.first_name,
                    last_name: editForm.last_name
                })
                .eq('id', editingUser);

            if (profileError) {
                throw profileError;
            }

            // Update role
            const user = users.find(u => u.id === editingUser);
            if (user) {
                // Use upsert to update or insert the role
                const { error: roleError } = await supabase
                    .from('user_roles')
                    .upsert({
                        user_id: user.user_id,
                        role: editForm.role as 'administrator' | 'user'
                    }, {
                        onConflict: 'user_id'
                    });

                if (roleError) {
                    throw roleError;
                }
            }

            toast({
                title: "Benutzer aktualisiert",
                description: "Die Benutzerdaten wurden erfolgreich gespeichert.",
            });

            setEditingUser(null);
            await fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            toast({
                title: "Fehler",
                description: "Fehler beim Speichern der Benutzerdaten.",
                variant: "destructive"
            });
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

    const getRoleLabel = (role: string) => {
        const roleLabels: { [key: string]: string } = {
            'administrator': 'Administrator',
            'user': 'Benutzer'
        };
        return roleLabels[role] || role;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Lade Administration...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!session || !isAdmin) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex items-center justify-center min-h-screen">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Zugriff verweigert</CardTitle>
                            <CardDescription>
                                Sie haben keine Berechtigung für die Administration.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-headline mb-4">
                                        <span className="text-gradient">Administration</span>
                                    </h1>
                                    <p className="text-body-large text-muted-foreground">
                                        Zentrale Verwaltung und Übersicht
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="px-3 py-1">
                                        Administrator
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Tabs defaultValue="dashboard" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Dashboard
                                </TabsTrigger>
                                <TabsTrigger value="contacts" className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Kontaktanfragen ({contactRequests.length})
                                </TabsTrigger>
                                <TabsTrigger value="users" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Benutzer ({users.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="dashboard" className="space-y-6">
                                <AdminDashboard />
                            </TabsContent>

                            <TabsContent value="contacts" className="space-y-6">
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
                                                    <div className="grid md:grid-cols-2 gap-4">
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
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                    <span>{getCallbackTimeLabel(request.callback_time)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="border-t pt-4">
                                                        <h4 className="font-medium mb-2">Nachricht:</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.message}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="users" className="space-y-6">
                                {users.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">Noch keine Benutzer vorhanden.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {users.map((user) => (
                                            <Card key={user.id} className="hover:shadow-lg transition-shadow">
                                                <CardContent className="p-6">
                                                    {editingUser === user.id ? (
                                                        <div className="space-y-4">
                                                            <div className="grid md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-sm font-medium">Vorname</label>
                                                                    <Input
                                                                        value={editForm.first_name}
                                                                        onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                                                                        placeholder="Vorname"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium">Nachname</label>
                                                                    <Input
                                                                        value={editForm.last_name}
                                                                        onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                                                                        placeholder="Nachname"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium">Rolle</label>
                                                                <Select
                                                                    value={editForm.role}
                                                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="user">Benutzer</SelectItem>
                                                                        <SelectItem value="administrator">Administrator</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button onClick={() => saveUser(user.user_id)} size="sm">
                                                                    <Save className="h-4 w-4 mr-2" />
                                                                    Speichern
                                                                </Button>
                                                                <Button onClick={cancelEditing} variant="outline" size="sm">
                                                                    <X className="h-4 w-4 mr-2" />
                                                                    Abbrechen
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-4">
                                                                    <h3 className="font-semibold">
                                                                        {user.first_name && user.last_name
                                                                            ? `${user.first_name} ${user.last_name}`
                                                                            : 'Unbekannter Benutzer'}
                                                                    </h3>
                                                                    <Badge variant={user.user_roles?.[0]?.role === 'administrator' ? 'default' : 'secondary'}>
                                                                        {getRoleLabel(user.user_roles?.[0]?.role || 'user')}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Registriert: {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: de })}
                                                                </p>
                                                            </div>
                                                            <Button onClick={() => startEditing(user)} variant="outline" size="sm">
                                                                Bearbeiten
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Administration;