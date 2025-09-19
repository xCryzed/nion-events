import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Mail,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { de } from "date-fns/locale";

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
  status: string;
  created_at: string;
  updated_at: string;
  responded_at?: string;
  responded_by?: string;
  response_message?: string;
}

const ProfessionalContactRequestsTab = () => {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    let filtered = contacts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.message.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((contact) => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Fehler",
        description: "Kontaktanfragen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "eingegangen":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Eingegangen
          </Badge>
        );
      case "bearbeitet":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Bearbeitet
          </Badge>
        );
      case "abgeschlossen":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Abgeschlossen
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return isValid(date)
      ? format(date, "dd.MM.yyyy HH:mm", { locale: de })
      : "-";
  };

  const handleViewContact = (contact: ContactRequest) => {
    setSelectedContact(contact);
    setDialogOpen(true);
  };

  // Mobile Card Component
  const ContactCard = ({ contact }: { contact: ContactRequest }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-sm">{contact.name}</h3>
            <p className="text-xs text-muted-foreground">{contact.email}</p>
            {contact.company && (
              <p className="text-xs text-muted-foreground">{contact.company}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(contact.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleViewContact(contact)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Details anzeigen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" />
                  Antworten
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{formatDate(contact.created_at)}</span>
          </div>
          {contact.event_type && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-muted-foreground" />
              <span>{contact.event_type}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {contact.message}
        </p>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Lade Kontaktanfragen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kontaktanfragen</h1>
        <p className="text-muted-foreground">
          Verwaltung von Kontaktanfragen und Kundenkommunikation
        </p>
      </div>
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eingegangen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.status === "eingegangen").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bearbeitet</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.status === "bearbeitet").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.status === "abgeschlossen").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          {/* <-- Fixed padding */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Kontaktanfragen durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="eingegangen">Eingegangen</SelectItem>
                <SelectItem value="bearbeitet">Bearbeitet</SelectItem>
                <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchContacts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </div>

          {/* Mobile View - Cards */}
          {isMobile ? (
            <div className="space-y-4">
              {filteredContacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          ) : (
            /* Desktop View - Table */
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kontakt</TableHead>
                    <TableHead>Unternehmen</TableHead>
                    <TableHead>Event-Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt am</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{contact.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {contact.email}
                          </span>
                          {contact.phone && (
                            <span className="text-xs text-muted-foreground">
                              {contact.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{contact.company || "-"}</TableCell>
                      <TableCell>{contact.event_type || "-"}</TableCell>
                      <TableCell>{getStatusBadge(contact.status)}</TableCell>
                      <TableCell>{formatDate(contact.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-popover border shadow-lg z-50"
                          >
                            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewContact(contact)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details anzeigen
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Antworten
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Exportieren
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredContacts.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Kontaktanfragen gefunden.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kontaktanfrage Details</DialogTitle>
            <DialogDescription>
              Vollständige Ansicht der Kontaktanfrage von{" "}
              {selectedContact?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Kontaktinformationen</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedContact.name}
                    </div>
                    <div>
                      <strong>E-Mail:</strong> {selectedContact.email}
                    </div>
                    {selectedContact.phone && (
                      <div>
                        <strong>Telefon:</strong> {selectedContact.phone}
                      </div>
                    )}
                    {selectedContact.mobile && (
                      <div>
                        <strong>Mobil:</strong> {selectedContact.mobile}
                      </div>
                    )}
                    {selectedContact.company && (
                      <div>
                        <strong>Unternehmen:</strong> {selectedContact.company}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Event-Details</h4>
                  <div className="space-y-2 text-sm">
                    {selectedContact.event_type && (
                      <div>
                        <strong>Event-Typ:</strong> {selectedContact.event_type}
                      </div>
                    )}
                    {selectedContact.venue && (
                      <div>
                        <strong>Veranstaltungsort:</strong>{" "}
                        {selectedContact.venue}
                      </div>
                    )}
                    {selectedContact.callback_time && (
                      <div>
                        <strong>Rückrufzeit:</strong>{" "}
                        {selectedContact.callback_time}
                      </div>
                    )}
                    <div>
                      <strong>Status:</strong>{" "}
                      {getStatusBadge(selectedContact.status)}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Nachricht</h4>
                <div className="bg-muted p-4 rounded-lg text-sm">
                  {selectedContact.message}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Zeitstempel</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Erstellt: {formatDate(selectedContact.created_at)}</div>
                  <div>
                    Aktualisiert: {formatDate(selectedContact.updated_at)}
                  </div>
                  {selectedContact.responded_at && (
                    <div>
                      Beantwortet: {formatDate(selectedContact.responded_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalContactRequestsTab;
