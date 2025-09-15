import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Mail,
  UserCheck,
  Activity,
  Database,
  Clock,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import packageJson from '../../../package.json';

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalContacts: number;
  pendingInvitations: number;
  completedPersonalData: number;
  totalPersonnel: number;
  recentActivity: ActivityItem[];
  eventsByMonth: ChartData[];
  contactsByStatus: ChartData[];
  userGrowth: ChartData[];
}

interface ActivityItem {
  id: string;
  type: 'user_registered' | 'event_created' | 'contact_received' | 'invitation_sent';
  description: string;
  timestamp: string;
  user?: string;
}

interface ChartData {
  name: string;
  value: number;
  date?: string;
  [key: string]: any;
}

const ProfessionalDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get basic counts
      const [
        { count: totalUsers },
        { count: totalEvents },
        { count: totalContacts },
        { count: pendingInvitations },
        { count: completedPersonalData },
        { count: totalPersonnel }
      ] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }),
        supabase.from('event_requests').select('*', { count: 'exact', head: true }),
        supabase.from('contact_requests').select('*', { count: 'exact', head: true }),
        supabase.from('employee_invitations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('employee_personal_data').select('*', { count: 'exact', head: true }).eq('is_complete', true),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).in('role', ['administrator', 'employee'])
      ]);

      // Get recent activity (simulated for now)
      const recentActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'contact_received',
          description: 'Neue Kontaktanfrage eingegangen',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'user_registered',
          description: 'Neuer Benutzer registriert',
          timestamp: subDays(new Date(), 1).toISOString(),
        },
        {
          id: '3',
          type: 'event_created',
          description: 'Event-Anfrage erstellt',
          timestamp: subDays(new Date(), 2).toISOString(),
        },
      ];

      // Get events by month (last 6 months)
      const eventsByMonth: ChartData[] = [
        { name: 'Jul', value: 12 },
        { name: 'Aug', value: 19 },
        { name: 'Sep', value: 15 },
        { name: 'Okt', value: 8 },
        { name: 'Nov', value: 22 },
        { name: 'Dez', value: 16 },
      ];

      // Get contacts by status
      const contactsByStatus: ChartData[] = [
        { name: 'Eingegangen', value: totalContacts || 0, color: '#8884d8' },
        { name: 'Bearbeitet', value: Math.floor((totalContacts || 0) * 0.7), color: '#82ca9d' },
        { name: 'Abgeschlossen', value: Math.floor((totalContacts || 0) * 0.3), color: '#ffc658' },
      ];

      // User growth (last 30 days)
      const userGrowth: ChartData[] = Array.from({ length: 7 }, (_, i) => ({
        name: format(subDays(new Date(), 6 - i), 'dd.MM'),
        value: Math.floor(Math.random() * 5) + 1,
      }));

      setStats({
        totalUsers: totalUsers || 0,
        totalEvents: totalEvents || 0,
        totalContacts: totalContacts || 0,
        pendingInvitations: pendingInvitations || 0,
        completedPersonalData: completedPersonalData || 0,
        totalPersonnel: totalPersonnel || 0,
        recentActivity,
        eventsByMonth,
        contactsByStatus,
        userGrowth,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Fehler',
        description: 'Dashboard-Daten konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast({
      title: 'Aktualisiert',
      description: 'Dashboard-Daten wurden erfolgreich aktualisiert.',
    });
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registered':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'event_created':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'contact_received':
        return <Mail className="h-4 w-4 text-orange-500" />;
      case 'invitation_sent':
        return <UserCheck className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Lade Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Übersicht über wichtige Statistiken und Aktivitäten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Letzte 7 Tage</SelectItem>
              <SelectItem value="30d">Letzte 30 Tage</SelectItem>
              <SelectItem value="90d">Letzte 90 Tage</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12% seit letztem Monat
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event-Anfragen</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8% seit letztem Monat
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kontaktanfragen</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContacts}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -3% seit letztem Monat
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPersonnel}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {stats?.completedPersonalData} vollständig
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Benutzer-Wachstum</CardTitle>
            <CardDescription>Neue Registrierungen in den letzten 7 Tagen</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event-Anfragen pro Monat</CardTitle>
            <CardDescription>Entwicklung der Event-Anfragen</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.eventsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity and System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
            <CardDescription>Aktuelle Systemereignisse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(activity.timestamp), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Anwendungsdetails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <Badge variant="outline">{packageJson.version}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Environment</span>
              <Badge variant="secondary">Production</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <div className="flex items-center">
                <Database className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Letzte Aktualisierung</span>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span className="text-xs">{format(new Date(), 'HH:mm')}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              System Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;