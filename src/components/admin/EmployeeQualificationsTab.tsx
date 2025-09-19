import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Award, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserQualification {
  id: string;
  user_id: string;
  qualification_id: string;
  acquired_date: string | null;
  expires_date: string | null;
  qualifications: {
    name: string;
    description: string | null;
  };
}

interface Employee {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  qualifications: UserQualification[];
}

interface Qualification {
  id: string;
  name: string;
  description: string | null;
}

const EmployeeQualificationsTab = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [selectedQualification, setSelectedQualification] = useState("");
  const [acquiredDate, setAcquiredDate] = useState("");
  const [expiresDate, setExpiresDate] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchQualifications();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase.from(
        "profiles",
      ).select(`
          user_id,
          first_name,
          last_name
        `);

      if (profilesError) throw profilesError;

      // Get user emails
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["employee", "administrator"]);

      if (rolesError) throw rolesError;

      const employeeIds = userRoles.map((role) => role.user_id);
      const employeeProfiles =
        profiles?.filter((profile) => employeeIds.includes(profile.user_id)) ||
        [];

      // Fetch qualifications for each employee
      const { data: userQualifications, error: qualError } = await supabase
        .from("employee_qualifications")
        .select(
          `
          id,
          user_id,
          qualification_id,
          acquired_date,
          expires_date,
          qualifications (
            name,
            description
          )
        `,
        )
        .in("user_id", employeeIds);

      if (qualError) throw qualError;

      // Combine data
      const employeesWithQualifications = employeeProfiles.map((profile) => ({
        ...profile,
        email: null, // We'll fetch this separately if needed
        qualifications:
          userQualifications?.filter(
            (qual) => qual.user_id === profile.user_id,
          ) || [],
      }));

      setEmployees(employeesWithQualifications);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Fehler beim Laden der Mitarbeiter");
    } finally {
      setLoading(false);
    }
  };

  const fetchQualifications = async () => {
    try {
      const { data, error } = await supabase
        .from("qualifications")
        .select("*")
        .order("name");

      if (error) throw error;
      setQualifications(data || []);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
    }
  };

  const handleAddQualification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !selectedQualification) return;

    try {
      const { error } = await supabase.from("employee_qualifications").insert({
        user_id: selectedEmployee.user_id,
        qualification_id: selectedQualification,
        acquired_date: acquiredDate || null,
        expires_date: expiresDate || null,
      });

      if (error) throw error;

      toast.success("Qualifikation erfolgreich hinzugefügt");
      setShowDialog(false);
      setSelectedQualification("");
      setAcquiredDate("");
      setExpiresDate("");
      fetchEmployees();
    } catch (error) {
      console.error("Error adding qualification:", error);
      toast.error("Fehler beim Hinzufügen der Qualifikation");
    }
  };

  const handleRemoveQualification = async (qualificationId: string) => {
    if (!confirm("Möchten Sie diese Qualifikation wirklich entfernen?")) return;

    try {
      const { error } = await supabase
        .from("employee_qualifications")
        .delete()
        .eq("id", qualificationId);

      if (error) throw error;

      toast.success("Qualifikation erfolgreich entfernt");
      fetchEmployees();
    } catch (error) {
      console.error("Error removing qualification:", error);
      toast.error("Fehler beim Entfernen der Qualifikation");
    }
  };

  const openAddDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDialog(true);
  };

  const getAvailableQualifications = () => {
    if (!selectedEmployee) return qualifications;

    const employeeQualIds = selectedEmployee.qualifications.map(
      (q) => q.qualification_id,
    );
    return qualifications.filter((q) => !employeeQualIds.includes(q.id));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mitarbeiter-Qualifikationen</h2>
          <p className="text-muted-foreground">
            Verwalten Sie die Qualifikationen aller Mitarbeiter
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {employees.map((employee) => (
          <Card key={employee.user_id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {employee.first_name} {employee.last_name}
                  </CardTitle>
                  <CardDescription>
                    {employee.qualifications.length} Qualifikation
                    {employee.qualifications.length !== 1 ? "en" : ""}
                  </CardDescription>
                </div>
                <Button onClick={() => openAddDialog(employee)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Qualifikation hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {employee.qualifications.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Noch keine Qualifikationen zugewiesen
                </p>
              ) : (
                <div className="space-y-2">
                  {employee.qualifications.map((qual) => (
                    <div
                      key={qual.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {qual.qualifications.name}
                        </div>
                        {qual.qualifications.description && (
                          <div className="text-sm text-muted-foreground">
                            {qual.qualifications.description}
                          </div>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          {qual.acquired_date && (
                            <span>
                              Erworben:{" "}
                              {new Date(qual.acquired_date).toLocaleDateString(
                                "de-DE",
                              )}
                            </span>
                          )}
                          {qual.expires_date && (
                            <span>
                              Läuft ab:{" "}
                              {new Date(qual.expires_date).toLocaleDateString(
                                "de-DE",
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveQualification(qual.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Qualification Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Qualifikation hinzufügen für {selectedEmployee?.first_name}{" "}
              {selectedEmployee?.last_name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddQualification} className="space-y-4">
            <div>
              <Label htmlFor="qualification">Qualifikation *</Label>
              <Select
                value={selectedQualification}
                onValueChange={setSelectedQualification}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Qualifikation auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableQualifications().map((qual) => (
                    <SelectItem key={qual.id} value={qual.id}>
                      {qual.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="acquired_date">Erworben am</Label>
                <Input
                  id="acquired_date"
                  type="date"
                  value={acquiredDate}
                  onChange={(e) => setAcquiredDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="expires_date">Läuft ab am</Label>
                <Input
                  id="expires_date"
                  type="date"
                  value={expiresDate}
                  onChange={(e) => setExpiresDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={!selectedQualification}>
                Hinzufügen
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeQualificationsTab;
