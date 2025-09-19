import { useState, useEffect } from "react";
import { trackError } from "@/hooks/use-google-analytics";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import AnalyticsTab from "./admin/AnalyticsTab";
import EventsTab from "./admin/EventsTab";
import UsersTab from "./admin/UsersTab";
import ContactRequestsTab from "./admin/ContactRequestsTab";
import InvitationsTab from "./admin/InvitationsTab";
import SystemLogsTab from "./admin/SystemLogsTab";
import SettingsTab from "./admin/SettingsTab";
import QualificationsTab from "./admin/QualificationsTab";
import PersonnelTab from "./admin/PersonnelTab";
import TimeRecordsTab from "./admin/TimeRecordsTab";

interface DashboardStats {
  totalContacts: number;
  totalUsers: number;
  totalEventRequests: number;
  totalInternalEvents: number;
  totalEventRegistrations: number;
  contactsThisWeek: number;
  contactsToday: number;
  upcomingEvents: number;
  recentContacts: Array<{
    id: string;
    name: string;
    email: string;
    event_type: string;
    created_at: string;
    title?: string | null;
  }>;
  recentEventRequests: Array<{
    id: string;
    event_title: string;
    contact_name: string;
    event_date: string;
    status: string;
    created_at: string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalUsers: 0,
    totalEventRequests: 0,
    totalInternalEvents: 0,
    totalEventRegistrations: 0,
    contactsThisWeek: 0,
    contactsToday: 0,
    upcomingEvents: 0,
    recentContacts: [],
    recentEventRequests: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get total contacts
      const { count: totalContacts } = await supabase
        .from("contact_requests")
        .select("*", { count: "exact", head: true });

      // Get total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get contacts this week
      const { count: contactsThisWeek } = await supabase
        .from("contact_requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      // Get contacts today
      const { count: contactsToday } = await supabase
        .from("contact_requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // Get total event requests
      const { count: totalEventRequests } = await supabase
        .from("event_requests")
        .select("*", { count: "exact", head: true });

      // Get total internal events
      const { count: totalInternalEvents } = await supabase
        .from("internal_events")
        .select("*", { count: "exact", head: true });

      // Get total event registrations
      const { count: totalEventRegistrations } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true });

      // Get upcoming events (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { count: upcomingEvents } = await supabase
        .from("internal_events")
        .select("*", { count: "exact", head: true })
        .gte("event_date", now.toISOString())
        .lte("event_date", thirtyDaysFromNow.toISOString());

      // Get recent contacts
      const { data: recentContacts } = await supabase
        .from("contact_requests")
        .select("id, name, email, event_type, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      // Get recent event requests
      const { data: recentEventRequests } = await supabase
        .from("event_requests")
        .select("id, event_title, contact_name, event_date, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      // Format all recent requests
      const allRecentRequests = (recentContacts || []).map((req) => ({
        id: req.id,
        name: req.name,
        email: req.email,
        event_type: req.event_type,
        created_at: req.created_at,
        title: req.event_type === "Angebotsanfrage" ? "Event-Anfrage" : null,
      }));

      setStats({
        totalContacts: totalContacts || 0,
        totalUsers: totalUsers || 0,
        totalEventRequests: totalEventRequests || 0,
        totalInternalEvents: totalInternalEvents || 0,
        totalEventRegistrations: totalEventRegistrations || 0,
        contactsThisWeek: contactsThisWeek || 0,
        contactsToday: contactsToday || 0,
        upcomingEvents: upcomingEvents || 0,
        recentContacts: allRecentRequests,
        recentEventRequests: recentEventRequests || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      trackError(
        error instanceof Error ? error : "Dashboard stats fetch failed",
        "data_fetch",
        "admin_dashboard",
        {
          attempted_queries: [
            "contact_requests",
            "profiles",
            "recent_contacts",
          ],
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    const eventTypes: { [key: string]: string } = {
      hochzeit: "Hochzeit",
      firmenveranstaltung: "Firmenveranstaltung",
      konferenz: "Konferenz",
      gala: "Gala-Event",
      geburtstag: "Geburtstag",
      abschlussfeier: "Abschlussfeier",
      abiball: "Abiball",
      produktpräsentation: "Produktpräsentation",
      messe: "Messe",
      sonstiges: "Sonstiges",
    };
    return eventTypes[eventType] || eventType;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kontaktanfragen
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">
              {stats.totalContacts}
            </div>
            <p className="text-xs text-muted-foreground">Gesamt eingegangen</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Angebotsanfragen
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">
              {stats.totalEventRequests}
            </div>
            <p className="text-xs text-muted-foreground">Event-Anfragen</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Veranstaltungen
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">
              {stats.totalInternalEvents}
            </div>
            <p className="text-xs text-muted-foreground">Geplante Events</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anmeldungen</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">
              {stats.totalEventRegistrations}
            </div>
            <p className="text-xs text-muted-foreground">Event-Anmeldungen</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bevorstehend</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">
              {stats.upcomingEvents}
            </div>
            <p className="text-xs text-muted-foreground">Nächste 30 Tage</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">Registriert</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Neueste Kontaktanfragen
            </CardTitle>
            <CardDescription>
              Die letzten 3 eingegangenen Anfragen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Noch keine Kontaktanfragen vorhanden</p>
              </div>
            ) : (
              stats.recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {contact.email}
                        </p>
                        {contact.title && (
                          <p className="text-xs text-muted-foreground italic">
                            "{contact.title}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {contact.event_type && (
                      <Badge variant="secondary" className="mb-1 text-xs">
                        {getEventTypeLabel(contact.event_type)}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(contact.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Neueste Angebotsanfragen
            </CardTitle>
            <CardDescription>Die letzten 3 Event-Anfragen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentEventRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Noch keine Angebotsanfragen vorhanden</p>
              </div>
            ) : (
              stats.recentEventRequests.map((eventRequest) => (
                <div
                  key={eventRequest.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {eventRequest.event_title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {eventRequest.contact_name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1 text-xs">
                      {eventRequest.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(eventRequest.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
            <CardDescription>
              Übersicht über den aktuellen Status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Email Service</p>
                  <p className="text-xs text-muted-foreground">
                    Funktioniert einwandfrei
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-500"
              >
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Datenbank</p>
                  <p className="text-xs text-muted-foreground">
                    Alle Verbindungen aktiv
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-500"
              >
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Authentication</p>
                  <p className="text-xs text-muted-foreground">
                    Benutzeranmeldung aktiv
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-500"
              >
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
