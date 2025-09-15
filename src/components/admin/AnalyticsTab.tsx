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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Euro,
  MapPin,
  Music,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';

interface AnalyticsData {
  eventRequestsOverTime: Array<{ date: string; count: number }>;
  popularServices: Array<{ name: string; count: number }>;
  popularGenres: Array<{ name: string; count: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  locationStats: Array<{ location: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number; color: string }>;
}

const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const daysBack = parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), daysBack));

      // Fetch event requests data
      const { data: eventRequests, error: eventError } = await supabase
        .from('event_requests')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (eventError) throw eventError;

      // Fetch user roles data
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (rolesError) throw rolesError;

      // Process event requests over time
      const eventRequestsOverTime = processTimeSeriesData(eventRequests || [], daysBack);

      // Process popular services
      const serviceStats: { [key: string]: number } = {};
      eventRequests?.forEach(req => {
        req.tech_requirements?.forEach((tech: string) => {
          serviceStats[tech] = (serviceStats[tech] || 0) + 1;
        });
        if (req.photographer) serviceStats['Fotograf'] = (serviceStats['Fotograf'] || 0) + 1;
        if (req.videographer) serviceStats['Videograf'] = (serviceStats['Videograf'] || 0) + 1;
        if (req.light_operator) serviceStats['Lichtoperator'] = (serviceStats['Lichtoperator'] || 0) + 1;
      });

      const popularServices = Object.entries(serviceStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process popular genres
      const genreStats: { [key: string]: number } = {};
      eventRequests?.forEach(req => {
        req.dj_genres?.forEach((genre: string) => {
          genreStats[genre] = (genreStats[genre] || 0) + 1;
        });
      });

      const popularGenres = Object.entries(genreStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process user growth
      const userGrowth = processTimeSeriesData(userRoles || [], daysBack, 'users');

      // Process location stats
      const locationStats: { [key: string]: number } = {};
      eventRequests?.forEach(req => {
        if (req.location) {
          const city = req.location.split(',')[0].trim();
          locationStats[city] = (locationStats[city] || 0) + 1;
        }
      });

      const topLocations = Object.entries(locationStats)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process status distribution
      const statusStats: { [key: string]: number } = {};
      eventRequests?.forEach(req => {
        statusStats[req.status] = (statusStats[req.status] || 0) + 1;
      });

      const statusColors: { [key: string]: string } = {
        'ANGEFRAGT': '#3b82f6',
        'IN_BEARBEITUNG': '#f59e0b',
        'RÜCKFRAGEN_OFFEN': '#ef4444',
        'ABGESCHLOSSEN': '#10b981',
      };

      const statusDistribution = Object.entries(statusStats)
        .map(([status, count]) => ({ 
          status: status.replace('_', ' '), 
          count, 
          color: statusColors[status] || '#6b7280' 
        }));

      setAnalytics({
        eventRequestsOverTime,
        popularServices,
        popularGenres,
        userGrowth,
        locationStats: topLocations,
        statusDistribution,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Fehler',
        description: 'Analytics konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processTimeSeriesData = (data: any[], daysBack: number, type: 'count' | 'users' = 'count') => {
    const result = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'dd.MM', { locale: de });
      const dayData = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return format(itemDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      
      if (type === 'users') {
        const cumulativeUsers = data.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate <= date;
        }).length;
        result.push({ date: dateStr, users: cumulativeUsers });
      } else {
        result.push({ date: dateStr, count: dayData.length });
      }
    }
    return result;
  };

  const calculateGrowthRate = (data: Array<{ count?: number; users?: number }>) => {
    if (data.length < 2) return 0;
    const recent = data[data.length - 1];
    const previous = data[data.length - 2];
    const recentValue = recent.count || recent.users || 0;
    const previousValue = previous.count || previous.users || 0;
    
    if (previousValue === 0) return recentValue > 0 ? 100 : 0;
    return ((recentValue - previousValue) / previousValue) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Lade Analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Keine Analytics-Daten verfügbar.</p>
      </div>
    );
  }

  const eventGrowth = calculateGrowthRate(analytics.eventRequestsOverTime);
  const userGrowth = calculateGrowthRate(analytics.userGrowth);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Geschäftsmetriken und Trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Tage</SelectItem>
              <SelectItem value="30">30 Tage</SelectItem>
              <SelectItem value="90">90 Tage</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Angebotsanfragen</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.eventRequestsOverTime.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {eventGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(eventGrowth).toFixed(1)}% vs. gestern
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neue Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.userGrowth.length > 0 ? analytics.userGrowth[analytics.userGrowth.length - 1].users : 0}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {userGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(userGrowth).toFixed(1)}% Wachstum
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beliebteste Services</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.popularServices[0]?.name || 'Keine Daten'}
            </div>
            <div className="text-xs text-muted-foreground">
              {analytics.popularServices[0]?.count || 0} Anfragen
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.locationStats[0]?.location || 'Keine Daten'}
            </div>
            <div className="text-xs text-muted-foreground">
              {analytics.locationStats[0]?.count || 0} Events
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Requests Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Angebotsanfragen über Zeit</CardTitle>
            <CardDescription>Anzahl der eingehenden Anfragen pro Tag</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.eventRequestsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>Beliebteste Services</CardTitle>
            <CardDescription>Am häufigsten angefragte Dienstleistungen</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.popularServices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status-Verteilung</CardTitle>
            <CardDescription>Verteilung der Anfrage-Status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Genres */}
        <Card>
          <CardHeader>
            <CardTitle>Beliebte DJ Genres</CardTitle>
            <CardDescription>Am häufigsten angefragte Musikrichtungen</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.popularGenres} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;