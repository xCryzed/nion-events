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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Euro,
  Award,
  Users,
  X,
  Eye,
  UserCheck,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { WorkContractManagement } from "@/components/WorkContractManagement";

interface Event {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  location: string;
  description: string | null;
  guest_count: number | null;
  status: string;
  staff_requirements: any;
  pricing_structure: any;
  qualification_requirements: any;
  notes?: string;
  contract_required: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface Qualification {
  id: string;
  name: string;
  description: string | null;
}

interface StaffRequirement {
  category: string;
  count: number;
  hourlyRate?: number;
  flatRate?: number;
  requires_contract?: boolean;
  qualifications: {
    id: string;
    name: string;
    required: boolean;
  }[];
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  staff_category: string;
  status: string;
  notes?: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface Employee {
  user_id: string;
  first_name: string;
  last_name: string;
}

interface PricingStructure {
  category: string;
  type: "hourly" | "flat";
  amount: number;
}

const EnhancedEventsTab = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Personal assignment states
  const [showPersonalDialog, setShowPersonalDialog] = useState(false);
  const [selectedEventForPersonal, setSelectedEventForPersonal] =
    useState<string>("");
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStaffCategory, setSelectedStaffCategory] = useState("");
  const [eventRegistrations, setEventRegistrations] = useState<
    Record<string, EventRegistration[]>
  >({});
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    title: "",
    event_date: "",
    end_date: "",
    location: "",
    description: "",
    guest_count: "",
    status: "geplant",
    contract_required: false,
  });
  const [staffRequirements, setStaffRequirements] = useState<
    StaffRequirement[]
  >([]);
  const [availableCategories] = useState([
    "DJ",
    "Lichttechnik",
    "Tontechnik",
    "Security",
    "Thekenkraft",
    "Auf-/Abbau",
    "Transport",
    "Koordination",
  ]);

  useEffect(() => {
    fetchEvents();
    fetchQualifications();
    fetchAvailableEmployees();
    fetchAllRegistrations();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("internal_events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Fehler beim Laden der Events");
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

  const fetchAvailableEmployees = async () => {
    try {
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["employee", "administrator"]);

      if (rolesError) throw rolesError;

      if (!userRoles || userRoles.length === 0) {
        setAvailableEmployees([]);
        return;
      }

      const userIds = userRoles.map((role) => role.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      setAvailableEmployees(profiles || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Fehler beim Laden der Mitarbeiter");
    }
  };

  const fetchAllRegistrations = async () => {
    try {
      const { data: registrationsData, error: regError } = await supabase
        .from("event_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (regError) throw regError;

      const userIds = [
        ...new Set(registrationsData?.map((reg) => reg.user_id) || []),
      ];
      let profilesData: any[] = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);

        if (!profileError) {
          profilesData = profiles || [];
        }
      }

      const registrationsByEvent: Record<string, EventRegistration[]> = {};
      registrationsData?.forEach((reg) => {
        if (!registrationsByEvent[reg.event_id]) {
          registrationsByEvent[reg.event_id] = [];
        }
        registrationsByEvent[reg.event_id].push({
          ...reg,
          profiles: profilesData.find((p) => p.user_id === reg.user_id),
        });
      });

      setEventRegistrations(registrationsByEvent);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const eventData = {
        title: formData.title,
        event_date: formData.event_date,
        end_date: formData.end_date || null,
        location: formData.location,
        description: formData.description || null,
        guest_count: formData.guest_count
          ? parseInt(formData.guest_count)
          : null,
        status: formData.status,
        contract_required: formData.contract_required,
        staff_requirements: JSON.stringify(staffRequirements),
        pricing_structure: JSON.stringify(
          staffRequirements.map((req) => ({
            category: req.category,
            type: req.hourlyRate ? "hourly" : "flat",
            amount: req.hourlyRate || req.flatRate || 0,
          })),
        ),
        qualification_requirements: JSON.stringify(
          staffRequirements.map((req) => ({
            category: req.category,
            qualifications: req.qualifications,
          })),
        ),
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("internal_events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Event erfolgreich aktualisiert");
      } else {
        const { error } = await supabase
          .from("internal_events")
          .insert(eventData);

        if (error) throw error;
        toast.success("Event erfolgreich erstellt");
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Fehler beim Speichern des Events");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      event_date: format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm"),
      end_date: event.end_date
        ? format(new Date(event.end_date), "yyyy-MM-dd'T'HH:mm")
        : "",
      location: event.location,
      description: event.description || "",
      guest_count: event.guest_count?.toString() || "",
      status: event.status,
      contract_required: event.contract_required || false,
    });
    setStaffRequirements(
      typeof event.staff_requirements === "string"
        ? JSON.parse(event.staff_requirements)
        : event.staff_requirements || [],
    );
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie dieses Event wirklich löschen?")) return;

    try {
      const { error } = await supabase
        .from("internal_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Event erfolgreich gelöscht");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Fehler beim Löschen des Events");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      event_date: "",
      end_date: "",
      location: "",
      description: "",
      guest_count: "",
      status: "geplant",
      contract_required: false,
    });
    setStaffRequirements([]);
    setEditingEvent(null);
    setShowDialog(false);
  };

  const addStaffRequirement = () => {
    setStaffRequirements([
      ...staffRequirements,
      {
        category: availableCategories[0],
        count: 1,
        qualifications: [],
      },
    ]);
  };

  const updateStaffRequirement = (index: number, field: string, value: any) => {
    const updated = [...staffRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setStaffRequirements(updated);
  };

  const removeStaffRequirement = (index: number) => {
    setStaffRequirements(staffRequirements.filter((_, i) => i !== index));
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
          <h2 className="text-2xl font-bold">Events verwalten</h2>
          <p className="text-muted-foreground">
            Erstelle und verwalte interne Events mit Personalanforderungen und
            Arbeitsverträgen
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Neues Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Event bearbeiten" : "Neues Event erstellen"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event-Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Ort *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="event_date">Startdatum *</Label>
                  <Input
                    id="event_date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Enddatum</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="guest_count">Gästeanzahl</Label>
                  <Input
                    id="guest_count"
                    type="number"
                    value={formData.guest_count}
                    onChange={(e) =>
                      setFormData({ ...formData, guest_count: e.target.value })
                    }
                    placeholder="z.B. 100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geplant">Geplant</SelectItem>
                      <SelectItem value="aktiv">Aktiv</SelectItem>
                      <SelectItem value="abgeschlossen">
                        Abgeschlossen
                      </SelectItem>
                      <SelectItem value="abgesagt">Abgesagt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contract_required"
                  checked={formData.contract_required}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, contract_required: !!checked })
                  }
                />
                <Label htmlFor="contract_required">
                  Arbeitsverträge erforderlich (für angestellte Mitarbeiter)
                </Label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Personalanforderungen
                  </h3>
                  <Button type="button" onClick={addStaffRequirement} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Position hinzufügen
                  </Button>
                </div>

                {staffRequirements.map((req, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Position {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeStaffRequirement(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Kategorie</Label>
                          <Select
                            value={req.category}
                            onValueChange={(value) =>
                              updateStaffRequirement(index, "category", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Anzahl</Label>
                          <Input
                            type="number"
                            min="1"
                            value={req.count}
                            onChange={(e) =>
                              updateStaffRequirement(
                                index,
                                "count",
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Stundenlohn (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={req.hourlyRate || ""}
                            onChange={(e) =>
                              updateStaffRequirement(
                                index,
                                "hourlyRate",
                                parseFloat(e.target.value) || undefined,
                              )
                            }
                            placeholder="z.B. 15.00"
                          />
                        </div>
                        <div>
                          <Label>Pauschale (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={req.flatRate || ""}
                            onChange={(e) =>
                              updateStaffRequirement(
                                index,
                                "flatRate",
                                parseFloat(e.target.value) || undefined,
                              )
                            }
                            placeholder="z.B. 200.00"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={req.requires_contract || false}
                            onChange={(e) =>
                              updateStaffRequirement(
                                index,
                                "requires_contract",
                                e.target.checked,
                              )
                            }
                            className="mr-2"
                          />
                          Vertrag erforderlich für diese Position
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  {editingEvent ? "Event aktualisieren" : "Event erstellen"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Events Übersicht
          </CardTitle>
          <CardDescription>
            Alle geplanten und durchgeführten Events mit Personalverwaltung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Ort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Personal</TableHead>
                <TableHead>Verträge</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-sm text-muted-foreground">
                          {event.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(event.event_date), "dd.MM.yyyy HH:mm", {
                        locale: de,
                      })}
                      {event.end_date && (
                        <div className="text-muted-foreground">
                          bis{" "}
                          {format(
                            new Date(event.end_date),
                            "dd.MM.yyyy HH:mm",
                            { locale: de },
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        event.status === "aktiv"
                          ? "default"
                          : event.status === "abgeschlossen"
                            ? "secondary"
                            : event.status === "abgesagt"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{eventRegistrations[event.id]?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.contract_required && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        Erforderlich
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Work Contract Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Arbeitsverträge Verwaltung
          </CardTitle>
          <CardDescription>
            Überblick über alle Arbeitsverträge für Events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkContractManagement isAdmin={true} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedEventsTab;
