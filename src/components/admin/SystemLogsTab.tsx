import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Database,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  metadata?: any;
  user_id?: string;
  ip_address?: string;
}

const SystemLogsTab = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, categoryFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Get recent analytics data from Supabase
      const { data: authLogs, error: authError } = await supabase.functions.invoke('get-auth-logs');
      const { data: dbLogs, error: dbError } = await supabase.functions.invoke('get-db-logs');
      
      // Create mock system logs for demonstration
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          category: 'Authentication',
          message: 'Benutzer erfolgreich angemeldet',
          user_id: 'user-123',
          ip_address: '192.168.1.1'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          level: 'warning',
          category: 'Database',
          message: 'Langsame Abfrage erkannt (2.5s)',
          metadata: { query_time: '2.5s', table: 'event_requests' }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          level: 'error',
          category: 'Email',
          message: 'E-Mail-Versand fehlgeschlagen',
          metadata: { error: 'SMTP timeout', recipient: 'user@example.com' }
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          level: 'success',
          category: 'Backup',
          message: 'Automatisches Backup erfolgreich abgeschlossen',
          metadata: { size: '125MB', duration: '45s' }
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          level: 'info',
          category: 'System',
          message: 'Wartungsarbeiten gestartet',
          metadata: { maintenance_type: 'routine_cleanup' }
        }
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Fehler',
        description: 'System-Logs konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Info
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-700">
            <AlertTriangle className="h-3 w-3" />
            Warnung
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Fehler
          </Badge>
        );
      case 'success':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Erfolg
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {level}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd.MM.yyyy HH:mm:ss', { locale: de }) : '-';
  };

  const categories = [...new Set(logs.map(log => log.category))];

  // Mobile Card Component
  const LogCard = ({ log }: { log: SystemLog }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getLevelBadge(log.level)}
              <Badge variant="outline">{log.category}</Badge>
            </div>
            <p className="text-sm font-medium">{log.message}</p>
            <div className="text-xs text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(log.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {log.metadata && (
          <div className="text-xs bg-muted p-2 rounded">
            <strong>Details:</strong> {JSON.stringify(log.metadata, null, 2)}
          </div>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Lade System-Logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System-Logs</h1>
        <p className="text-muted-foreground">Systemereignisse und Protokolle</p>
      </div>

      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fehler</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(l => l.level === 'error').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnungen</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(l => l.level === 'warning').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erfolg</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(l => l.level === 'success').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Logs durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Level filtern" />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                <SelectItem value="all">Alle Level</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warnung</SelectItem>
                <SelectItem value="error">Fehler</SelectItem>
                <SelectItem value="success">Erfolg</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Kategorie filtern" />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </div>

          {/* Mobile View - Cards */}
          {isMobile ? (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <LogCard key={log.id} log={log} />
              ))}
            </div>
          ) : (
            /* Desktop View - Table */
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zeitstempel</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Nachricht</TableHead>
                    <TableHead>Benutzer</TableHead>
                    <TableHead>IP-Adresse</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <Database className="h-12 w-12 mb-2 opacity-50" />
                          Keine System-Logs gefunden.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>{getLevelBadge(log.level)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[400px]">
                          <div className="truncate">{log.message}</div>
                          {log.metadata && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {JSON.stringify(log.metadata)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.user_id ? (
                            <span className="text-sm font-mono">{log.user_id.slice(0, 8)}...</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">{log.ip_address || '-'}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredLogs.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine System-Logs gefunden.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogsTab;