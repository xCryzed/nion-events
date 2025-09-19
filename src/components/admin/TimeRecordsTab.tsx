import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TimeRecord {
  id: string;
  user_id: string;
  event_id: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  notes?: string;
  status: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  profiles: {
    user_id: string;
    first_name: string;
    last_name: string;
  };
  internal_events: {
    title: string;
    event_date: string;
    end_date?: string;
  };
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  end_date?: string;
}

interface Employee {
  user_id: string;
  first_name: string;
  last_name: string;
}

export default function TimeRecordsTab() {
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<TimeRecord[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchEmployees();
    fetchTimeRecords();
  }, []);

  useEffect(() => {
    fetchTimeRecords();
  }, [selectedEventId, selectedStatus, selectedEmployeeId]);

  useEffect(() => {
    filterRecords();
    setCurrentPage(1);
  }, [
    timeRecords,
    searchTerm,
    selectedEventId,
    selectedStatus,
    selectedEmployeeId,
  ]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("internal_events")
        .select("id, title, event_date, end_date")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .order("first_name", { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchTimeRecords = async () => {
    try {
      let query = supabase
        .from("time_records")
        .select(
          `
          id,
          user_id,
          event_id,
          start_time,
          end_time,
          break_minutes,
          notes,
          status,
          created_at,
          approved_at,
          approved_by,
          internal_events!inner (
            title,
            event_date,
            end_date
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (selectedEventId !== "all") {
        query = query.eq("event_id", selectedEventId);
      }

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      if (selectedEmployeeId !== "all") {
        query = query.eq("user_id", selectedEmployeeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((record) => record.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);

        const recordsWithProfiles = data.map((record) => ({
          ...record,
          profiles: profiles?.find((p) => p.user_id === record.user_id) || {
            user_id: record.user_id,
            first_name: "Unbekannt",
            last_name: "",
          },
        }));

        setTimeRecords(recordsWithProfiles);
      } else {
        setTimeRecords([]);
      }
    } catch (error) {
      console.error("Error fetching time records:", error);
      toast({
        title: "Fehler",
        description: "Stundenaufzeichnungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...timeRecords];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          `${record.profiles.first_name} ${record.profiles.last_name}`
            .toLowerCase()
            .includes(term) ||
          record.internal_events.title.toLowerCase().includes(term) ||
          (record.notes && record.notes.toLowerCase().includes(term)),
      );
    }

    setFilteredRecords(filtered);
  };

  const handleStatusUpdate = async (
    recordId: string,
    newStatus: "genehmigt" | "abgelehnt",
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("time_records")
        .update({
          status: newStatus,
          approved_by: user.user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", recordId);

      if (error) throw error;

      toast({
        title: "Status aktualisiert",
        description: `Stundenaufzeichnung wurde ${newStatus === "genehmigt" ? "genehmigt" : "abgelehnt"}.`,
      });

      fetchTimeRecords();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const calculateWorkingHours = (
    start: string,
    end: string,
    breakMinutes: number,
  ) => {
    const startTime = parseISO(start);
    const endTime = parseISO(end);
    const totalMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60) - breakMinutes;
    return (totalMinutes / 60).toFixed(2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "eingereicht":
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Eingereicht
          </Badge>
        );
      case "genehmigt":
        return (
          <Badge
            variant="default"
            className="bg-success text-success-foreground"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Genehmigt
          </Badge>
        );
      case "abgelehnt":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Abgelehnt
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTotalHours = () => {
    return filteredRecords
      .filter((record) => record.status === "genehmigt")
      .reduce((total, record) => {
        return (
          total +
          parseFloat(
            calculateWorkingHours(
              record.start_time,
              record.end_time,
              record.break_minutes,
            ),
          )
        );
      }, 0)
      .toFixed(2);
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord,
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const exportTimeRecordsCSV = () => {
    const csvContent = [
      [
        "Name",
        "Event",
        "Startzeit",
        "Endzeit",
        "Pause (Min)",
        "Arbeitszeit (h)",
        "Status",
        "Notizen",
      ],
      ...filteredRecords.map((record) => [
        `${record.profiles.first_name} ${record.profiles.last_name}`,
        record.internal_events.title,
        format(parseISO(record.start_time), "dd.MM.yyyy HH:mm"),
        format(parseISO(record.end_time), "dd.MM.yyyy HH:mm"),
        record.break_minutes.toString(),
        calculateWorkingHours(
          record.start_time,
          record.end_time,
          record.break_minutes,
        ),
        record.status,
        record.notes || "",
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `stundenaufzeichnungen_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTimeRecordsPDF = () => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text("Stundenaufzeichnungen", 14, 22);
      doc.setFontSize(11);
      doc.text(
        `Exportiert am: ${format(new Date(), "dd.MM.yyyy HH:mm")}`,
        14,
        30,
      );

      // Table data (excluding notes as requested)
      const tableData = filteredRecords.map((record) => [
        `${record.profiles.first_name} ${record.profiles.last_name}`,
        record.internal_events.title,
        format(parseISO(record.start_time), "dd.MM.yy HH:mm"),
        format(parseISO(record.end_time), "dd.MM.yy HH:mm"),
        `${record.break_minutes} Min`,
        `${calculateWorkingHours(record.start_time, record.end_time, record.break_minutes)} h`,
        record.status,
      ]);

      // Create table with autoTable helper
      autoTable(doc, {
        head: [
          ["Name", "Event", "Start", "Ende", "Pause", "Stunden", "Status"],
        ],
        body: tableData,
        startY: 35,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 25 },
        },
        margin: { top: 35 },
      });

      // Save file
      doc.save(`stundenaufzeichnungen_${format(new Date(), "yyyy-MM-dd")}.pdf`);

      toast({
        title: "PDF Export",
        description:
          "Stundenaufzeichnungen wurden erfolgreich als PDF exportiert.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Fehler beim PDF Export",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Gesamt Aufzeichnungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eingereicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredRecords.filter((r) => r.status === "eingereicht").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Genehmigt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredRecords.filter((r) => r.status === "genehmigt").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Genehmigte Stunden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalHours()} h</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Stundenaufzeichnungen
          </CardTitle>
          <CardDescription>
            Verwalten Sie alle Stundenaufzeichnungen der Mitarbeiter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Name, Event oder Notizen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Event auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Mitarbeiter auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.user_id} value={employee.user_id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="eingereicht">Eingereicht</SelectItem>
                  <SelectItem value="genehmigt">Genehmigt</SelectItem>
                  <SelectItem value="abgelehnt">Abgelehnt</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={exportTimeRecordsCSV}
                  disabled={filteredRecords.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={exportTimeRecordsPDF}
                  disabled={filteredRecords.length === 0}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Time Records Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Arbeitszeit</TableHead>
                  <TableHead>Pause</TableHead>
                  <TableHead>Stunden</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notizen</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {filteredRecords.length === 0
                        ? "Keine Stundenaufzeichnungen gefunden"
                        : "Keine Einträge auf dieser Seite"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.profiles.first_name} {record.profiles.last_name}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {record.internal_events.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              parseISO(record.internal_events.event_date),
                              "dd.MM.yyyy",
                              { locale: de },
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {format(parseISO(record.start_time), "dd.MM.yyyy")}
                          </p>
                          <p className="text-muted-foreground">
                            {format(parseISO(record.start_time), "HH:mm")} -{" "}
                            {format(parseISO(record.end_time), "HH:mm")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(parseISO(record.start_time), "HH:mm")}</p>
                          <p>{format(parseISO(record.end_time), "HH:mm")}</p>
                        </div>
                      </TableCell>
                      <TableCell>{record.break_minutes} Min.</TableCell>
                      <TableCell className="font-semibold">
                        {calculateWorkingHours(
                          record.start_time,
                          record.end_time,
                          record.break_minutes,
                        )}{" "}
                        h
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="max-w-xs">
                        {record.notes ? (
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                            {record.notes}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Keine Notizen
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {record.status === "eingereicht" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(record.id, "genehmigt")
                                }
                                className="bg-success text-success-foreground hover:bg-success/90"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Genehmigen
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleStatusUpdate(record.id, "abgelehnt")
                                }
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Ablehnen
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredRecords.length > recordsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Zeige {indexOfFirstRecord + 1} bis{" "}
                  {Math.min(indexOfLastRecord, filteredRecords.length)} von{" "}
                  {filteredRecords.length} Einträgen
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Zurück
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => paginate(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Weiter
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
