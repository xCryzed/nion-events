import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import EventRequestsTable from '@/components/EventRequestsTable';
import ContactRequestsTab from '@/components/admin/ContactRequestsTab';
import UsersTab from '@/components/admin/UsersTab';
import SettingsTab from '@/components/admin/SettingsTab';
import { Session } from '@supabase/supabase-js';
import AdminDashboard from '@/components/AdminDashboard';
import { Menu } from 'lucide-react';

const Administration = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [contactRequestsCount, setContactRequestsCount] = useState<number>(0);
    const [eventRequestsCount, setEventRequestsCount] = useState<number>(0);
    const [usersCount, setUsersCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
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
                await Promise.all([fetchCounts()]);
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

    const fetchCounts = async () => {
        try {
            // Fetch contact requests count
            const { count: contactCount, error: contactError } = await supabase
                .from('contact_requests')
                .select('*', { count: 'exact', head: true });

            if (!contactError) {
                setContactRequestsCount(contactCount || 0);
            }

            // Fetch event requests count
            const { count: eventCount, error: eventError } = await supabase
                .from('event_requests')
                .select('*', { count: 'exact', head: true });

            if (!eventError) {
                setEventRequestsCount(eventCount || 0);
            }

            // Fetch users count
            const { count: userCount, error: userError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (!userError) {
                setUsersCount(userCount || 0);
            }
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Lade Administration...</p>
                </div>
            </div>
        );
    }

    if (!session || !isAdmin) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md mx-4">
                    <CardHeader>
                        <CardTitle>Zugriff verweigert</CardTitle>
                        <CardDescription>
                            Sie haben keine Berechtigung für die Administration.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'event-requests':
                return <EventRequestsTable />;
            case 'contacts':
                return <ContactRequestsTab />;
            case 'users':
                return <UsersTab />;
            case 'settings':
                return <SettingsTab />;
            default:
                return <AdminDashboard />;
        }
    };

    const getPageTitle = () => {
        switch (activeTab) {
            case 'dashboard':
                return 'Dashboard';
            case 'event-requests':
                return 'Angebotsanfragen';
            case 'contacts':
                return 'Kontaktanfragen';
            case 'users':
                return 'Benutzerverwaltung';
            case 'settings':
                return 'Einstellungen';
            default:
                return 'Dashboard';
        }
    };

    const getPageDescription = () => {
        switch (activeTab) {
            case 'dashboard':
                return 'Übersicht über wichtige Statistiken und Aktivitäten';
            case 'event-requests':
                return 'Verwaltung eingehender Angebotsanfragen';
            case 'contacts':
                return 'Verwaltung von Kontaktanfragen';
            case 'users':
                return 'Benutzer und Berechtigungen verwalten';
            case 'settings':
                return 'App-Einstellungen und Konfiguration verwalten';
            default:
                return 'Zentrale Verwaltung und Übersicht';
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <AdminSidebar
                    eventRequestsCount={eventRequestsCount}
                    contactRequestsCount={contactRequestsCount}
                    usersCount={usersCount}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                        <div className="flex h-16 items-center px-4 gap-4">
                            <SidebarTrigger className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </SidebarTrigger>

                            <div className="flex-1">
                                <h1 className="text-xl font-semibold">
                                    {getPageTitle()}
                                </h1>
                                <p className="text-sm text-muted-foreground hidden sm:block">
                                    {getPageDescription()}
                                </p>
                            </div>

                            <Badge variant="outline" className="hidden sm:flex">
                                Administrator
                            </Badge>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Administration;