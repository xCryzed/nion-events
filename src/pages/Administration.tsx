import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ProfessionalAdminSidebar } from '@/components/admin/ProfessionalAdminSidebar';
import EventRequestsTable from '@/components/EventRequestsTable';
import ProfessionalContactRequestsTab from '@/components/admin/ProfessionalContactRequestsTab';
import ProfessionalUsersTab from '@/components/admin/ProfessionalUsersTab';
import SettingsTab from '@/components/admin/SettingsTab';
import EventsTab from '@/components/admin/EventsTab';
import PersonnelTab from '@/components/admin/PersonnelTab';
import InvitationsTab from '@/components/admin/InvitationsTab';
import ProfessionalDashboard from '@/components/admin/ProfessionalDashboard';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import SystemLogsTab from '@/components/admin/SystemLogsTab';
import { Session } from '@supabase/supabase-js';
import { Menu, Shield, AlertTriangle, Loader2 } from 'lucide-react';

const Administration = () => {
    const [session, setSession] = useState<Session | null>(null);
    
    useEffect(() => {
        document.title = 'Administration - DJ Aachen & Eventtechnik | NION Events Mitarbeiterbereich';
    }, []);
    const [counts, setCounts] = useState({
        contactRequests: 0,
        eventRequests: 0,
        users: 0,
        internalEvents: 0,
        personnel: 0,
        invitations: 0,
    });
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        // Initialize tab from URL parameter
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl) {
            setActiveTab(tabFromUrl);
        }

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
    }, [searchParams]);

    useEffect(() => {
        if (isAdmin) {
            fetchCounts();
        }
    }, [isAdmin]);

    const checkAdminRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error checking admin role:', error);
                setIsAdmin(false);
            } else if (data?.role === 'administrator') {
                setIsAdmin(true);
                fetchCounts();
            } else {
                setIsAdmin(false);
                toast({
                    title: "Zugriff verweigert",
                    description: "Sie haben keine Berechtigung für die Administration.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error in checkAdminRole:', error);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            // Fetch contact requests count
            const { count: contactCount, error: contactError } = await supabase
                .from('contact_requests')
                .select('*', { count: 'exact', head: true });

            if (contactError) throw contactError;

            // Fetch event requests count
            const { count: eventCount, error: eventError } = await supabase
                .from('event_requests')
                .select('*', { count: 'exact', head: true });

            if (eventError) throw eventError;

            // Fetch users count (profiles with roles)
            const { count: userCount, error: userError } = await supabase
                .from('user_roles')
                .select('*', { count: 'exact', head: true });

            if (userError) throw userError;

            // Fetch internal events count
            const { count: internalEventCount, error: internalEventError } = await supabase
                .from('internal_events')
                .select('*', { count: 'exact', head: true });

            if (internalEventError) throw internalEventError;

            // Fetch personnel count (users with administrator or employee roles)
            const { count: personnelCount, error: personnelError } = await supabase
                .from('user_roles')
                .select('*', { count: 'exact', head: true })
                .in('role', ['administrator', 'employee']);

            if (personnelError) throw personnelError;

            // Fetch invitations count
            const { count: invitationsCount, error: invitationsError } = await supabase
                .from('employee_invitations')
                .select('*', { count: 'exact', head: true });

            if (invitationsError) throw invitationsError;

            setCounts({
                contactRequests: contactCount || 0,
                eventRequests: eventCount || 0,
                users: userCount || 0,
                internalEvents: internalEventCount || 0,
                personnel: personnelCount || 0,
                invitations: invitationsCount || 0,
            });
        } catch (error) {
            console.error('Error fetching counts:', error);
            toast({
                title: 'Fehler',
                description: 'Statistiken konnten nicht geladen werden.',
                variant: 'destructive',
            });
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <ProfessionalDashboard />;
            case 'analytics':
                return <AnalyticsTab />;
            case 'event-requests':
                return (
                    <EventRequestsTable />
                );
            case 'contacts':
                return <ProfessionalContactRequestsTab />;
            case 'events':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold">Veranstaltungen</h1>
                            <p className="text-muted-foreground">Interne Events und Personal-Planung</p>
                        </div>
                        <EventsTab />
                    </div>
                );
            case 'users':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>
                            <p className="text-muted-foreground">Benutzer und Berechtigungen verwalten</p>
                        </div>
                        <ProfessionalUsersTab />
                    </div>
                );
            case 'invitations':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold">Einladungen</h1>
                            <p className="text-muted-foreground">Mitarbeiter-Einladungen verwalten</p>
                        </div>
                        <InvitationsTab />
                    </div>
                );
            case 'personnel':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold">Personalverwaltung</h1>
                            <p className="text-muted-foreground">Mitarbeiter-Personalakten verwalten</p>
                        </div>
                        <PersonnelTab />
                    </div>
                );
            case 'settings':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold">Einstellungen</h1>
                            <p className="text-muted-foreground">Systemkonfiguration verwalten</p>
                        </div>
                        <SettingsTab />
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold">Sicherheit</h1>
                            <p className="text-muted-foreground">Sicherheitsrichtlinien und Zugriffskontrollen</p>
                        </div>
                        <Card className="p-8">
                            <div className="text-center">
                                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium mb-2">Sicherheitseinstellungen</h3>
                                <p className="text-muted-foreground">Erweiterte Sicherheitsfeatures werden hier konfiguriert.</p>
                            </div>
                        </Card>
                    </div>
                );
            case 'logs':
                return <SystemLogsTab />;
            default:
                return <ProfessionalDashboard />;
        }
    };

    const getPageTitle = () => {
        switch (activeTab) {
            case 'dashboard':
                return 'Dashboard';
            case 'analytics':
                return 'Analytics';
            case 'event-requests':
                return 'Angebotsanfragen';
            case 'contacts':
                return 'Kontaktanfragen';
            case 'events':
                return 'Veranstaltungen';
            case 'users':
                return 'Benutzerverwaltung';
            case 'invitations':
                return 'Einladungen';
            case 'personnel':
                return 'Personalverwaltung';
            case 'settings':
                return 'Einstellungen';
            case 'security':
                return 'Sicherheit';
            case 'logs':
                return 'System-Logs';
            default:
                return 'Dashboard';
        }
    };

    const getPageDescription = () => {
        switch (activeTab) {
            case 'dashboard':
                return 'Übersicht über wichtige Statistiken und Aktivitäten';
            case 'analytics':
                return 'Detaillierte Auswertungen und Berichte';
            case 'event-requests':
                return 'Verwaltung eingehender Angebotsanfragen';
            case 'contacts':
                return 'Verwaltung von Kontaktanfragen';
            case 'events':
                return 'Verwaltung interner Events, Personal-Planung und Anmeldungen';
            case 'users':
                return 'Benutzer und Berechtigungen verwalten';
            case 'invitations':
                return 'Mitarbeiter-Einladungen verwalten und überwachen';
            case 'personnel':
                return 'Mitarbeiter-Personalakten verwalten und einsehen';
            case 'settings':
                return 'App-Einstellungen und Konfiguration verwalten';
            case 'security':
                return 'Sicherheitsrichtlinien und Zugriffskontrollen';
            case 'logs':
                return 'Systemereignisse und Audit-Protokolle';
            default:
                return 'Zentrale Verwaltung und Übersicht';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="text-muted-foreground">Lade Administration...</p>
                </div>
            </div>
        );
    }

    if (!session || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
                        <CardTitle>Zugriff verweigert</CardTitle>
                        <CardDescription>
                            Sie haben keine Berechtigung für die Administration. 
                            Wenden Sie sich an einen Administrator, um Zugriff zu erhalten.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <ProfessionalAdminSidebar
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    eventRequestsCount={counts.eventRequests}
                    contactRequestsCount={counts.contactRequests}
                    usersCount={counts.users}
                    internalEventsCount={counts.internalEvents}
                    personnelCount={counts.personnel}
                    invitationsCount={counts.invitations}
                />

                <div className="flex-1 flex flex-col min-w-0">
                    {/* Global Header with Sidebar Trigger (mobile + desktop) */}
                    <header className="h-12 flex items-center border-b px-3 md:px-6 sticky top-0 bg-background z-30">
                        <SidebarTrigger className="mr-2 md:mr-4" />
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 p-6 overflow-auto">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Administration;