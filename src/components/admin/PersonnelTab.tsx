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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Eye,
  Download,
  Search,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import { PersonalDataCard } from '@/components/PersonalDataCard';
import { generatePersonalDataPDF, generatePersonalDataPDFFileName } from '@/utils/pdfGenerator';

interface Employee {
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  personal_data?: {
    id: string;
    is_complete: boolean;
    created_at: string;
    updated_at: string;
    signature_date?: string;
    job_title?: string;
    start_date?: string;
    [key: string]: any;
  };
}

const PersonnelTab = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [employeeQualifications, setEmployeeQualifications] = useState<{ [userId: string]: any[] }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchEmployeeQualifications();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(
      (employee) =>
        employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.personal_data?.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      // First get users with administrator or employee roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['administrator', 'employee']);

      if (rolesError) {
        throw rolesError;
      }

      if (!userRoles || userRoles.length === 0) {
        setEmployees([]);
        return;
      }

      const employeeUserIds = userRoles.map(role => role.user_id);

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name
        `)
        .in('user_id', employeeUserIds);

      if (profilesError) {
        throw profilesError;
      }

      // Get all personal data for these users
      const { data: personalData, error: personalDataError } = await supabase
        .from('employee_personal_data')
        .select('*')
        .in('user_id', employeeUserIds);

      if (personalDataError) {
        throw personalDataError;
      }

      // Combine profiles with their personal data
      const employeesWithData: Employee[] = profiles?.map((profile) => {
        const employeePersonalData = personalData?.find(
          (data) => data.user_id === profile.user_id
        );

        return {
          user_id: profile.user_id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: '', // Will be empty for now
          personal_data: employeePersonalData || undefined,
        };
      }) || [];

      setEmployees(employeesWithData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Fehler',
        description: 'Mitarbeiterdaten konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeQualifications = async () => {
    try {
      // Fetch employee qualifications separately to avoid complex joins
      const { data: qualificationData, error } = await supabase
        .from('employee_qualifications')
        .select('user_id, qualification_id');

      if (error) {
        throw error;
      }

      // Get all qualification names
      const { data: qualifications } = await supabase
        .from('qualifications')
        .select('id, name');

      // Group qualifications by user_id
      const qualificationsByUser: { [userId: string]: any[] } = {};
      qualificationData?.forEach((eq) => {
        if (!qualificationsByUser[eq.user_id]) {
          qualificationsByUser[eq.user_id] = [];
        }
        const qualification = qualifications?.find(q => q.id === eq.qualification_id);
        if (qualification) {
          qualificationsByUser[eq.user_id].push(qualification);
        }
      });

      setEmployeeQualifications(qualificationsByUser);
    } catch (error) {
      console.error('Error fetching employee qualifications:', error);
    }
  };

  const handleViewPersonnelFile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleDownloadPDF = async (employee: Employee) => {
    if (!employee.personal_data || !employee.personal_data.is_complete) {
      toast({
        title: 'Keine Daten',
        description: 'Für diesen Mitarbeiter sind keine vollständigen Personaldaten verfügbar.',
        variant: 'destructive',
      });
      return;
    }

    setDownloadingPdf(employee.user_id);
    try {
      // Convert personal data to include required fields for PDF generation
      const pdfData = {
        ...employee.personal_data,
        first_name: employee.first_name,
        last_name: employee.last_name,
      };
      
      const pdf = generatePersonalDataPDF(pdfData as any);
      const fileName = generatePersonalDataPDFFileName(pdfData as any);
      pdf.save(fileName);

      toast({
        title: 'Erfolg',
        description: 'PDF wurde erfolgreich heruntergeladen.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Fehler',
        description: 'Beim Erstellen des PDFs ist ein Fehler aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingPdf(null);
    }
  };

  const getCompletionStatus = (employee: Employee) => {
    if (!employee.personal_data) {
      return {
        status: 'Nicht erfasst',
        variant: 'destructive' as const,
        icon: AlertCircle,
      };
    }

    if (employee.personal_data.is_complete) {
      return {
        status: 'Vollständig',
        variant: 'default' as const,
        icon: CheckCircle,
      };
    }

    return {
      status: 'Unvollständig',
      variant: 'secondary' as const,
      icon: AlertCircle,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Lade Mitarbeiterdaten...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitarbeiter gesamt</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vollständige Akten</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((e) => e.personal_data?.is_complete).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unvollständige Akten</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((e) => e.personal_data && !e.personal_data.is_complete).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nicht erfasst</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((e) => !e.personal_data).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Mitarbeiter suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Employees Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>E-Mail</TableHead>
                                  <TableHead>Position</TableHead>
                                  <TableHead>Qualifikationen</TableHead>
                                  <TableHead>Eintrittsdatum</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Letzte Aktualisierung</TableHead>
                                  <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const completionStatus = getCompletionStatus(employee);
                  const StatusIcon = completionStatus.icon;

                  return (
                    <TableRow key={employee.user_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {employee.first_name} {employee.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                                      <TableCell>
                                        {employee.personal_data?.job_title || '-'}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                          {employeeQualifications[employee.user_id]?.length > 0 ? (
                                            employeeQualifications[employee.user_id].map((qual, index) => (
                                              <Badge key={index} variant="secondary" className="text-xs">
                                                {qual.name}
                                              </Badge>
                                            ))
                                          ) : (
                                            <span className="text-muted-foreground text-sm">Keine</span>
                                          )}
                                        </div>
                                      </TableCell>
                      <TableCell>
                        {employee.personal_data?.start_date
                          ? (() => {
                              const date = parseISO(employee.personal_data.start_date);
                              return isValid(date)
                                ? format(date, 'dd.MM.yyyy', { locale: de })
                                : '-';
                            })()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={completionStatus.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {completionStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {employee.personal_data?.updated_at
                          ? (() => {
                              const date = parseISO(employee.personal_data.updated_at);
                              return isValid(date)
                                ? format(date, 'dd.MM.yyyy', { locale: de })
                                : '-';
                            })()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Dialog open={dialogOpen && selectedEmployee?.user_id === employee.user_id} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) setSelectedEmployee(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPersonnelFile(employee)}
                                disabled={!employee.personal_data}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Personalakte - {employee.first_name} {employee.last_name}
                                </DialogTitle>
                                <DialogDescription>
                                  Vollständige Ansicht der Mitarbeiterdaten
                                </DialogDescription>
                              </DialogHeader>
                              {selectedEmployee?.personal_data && (
                                <PersonalDataCard
                                  data={{
                                    ...selectedEmployee.personal_data,
                                    first_name: selectedEmployee.first_name,
                                    last_name: selectedEmployee.last_name,
                                  } as any}
                                  onEdit={() => {
                                    // Navigate to edit would be implemented here
                                    toast({
                                      title: 'Info',
                                      description: 'Bearbeitung über die Mitarbeiter-Ansicht möglich.',
                                    });
                                  }}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(employee)}
                            disabled={
                              !employee.personal_data?.is_complete ||
                              downloadingPdf === employee.user_id
                            }
                          >
                            {downloadingPdf === employee.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredEmployees.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Mitarbeiter gefunden.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonnelTab;