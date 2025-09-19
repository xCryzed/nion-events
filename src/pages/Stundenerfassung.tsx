import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  MapPin,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isWithinInterval } from "date-fns";
import { de } from "date-fns/locale";
import { DateTimePicker } from "@/components/DateTimePicker";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface InternalEvent {
  id: string;
  title: string;
  event_date: string;
  end_date?: string;
  location: string;
  status: string;
  staff_category?: string;
}

interface TimeRecord {
  id: string;
  event_id: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  notes?: string;
  status: string;
  created_at: string;
  internal_events: {
    title: string;
    event_date: string;
    end_date?: string;
  };
}

export default function Stundenerfassung() {
  const [pastEvents, setPastEvents] = useState<
    (InternalEvent & { staff_category: string })[]
  >([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 10;
  const { toast } = useToast();

  // Form state
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    document.title =
      "Stundenerfassung - DJ Aachen & Eventtechnik | NION Events Mitarbeiterbereich";
    fetchPastEvents();
    fetchTimeRecords();
  }, [currentPage]);

  const fetchPastEvents = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch past events where user was registered and event is finished
      const { data: registrations, error: regError } = await supabase
        .from("event_registrations")
        .select(
          `
          event_id,
          staff_category,
          internal_events (
            id,
            title,
            event_date,
            end_date,
            location,
            status
          )
        `,
        )
        .eq("user_id", user.user.id);

      if (regError) throw regError;

      const pastEvents = registrations
        ?.map((reg) => ({
          ...reg.internal_events,
          staff_category: reg.staff_category,
        }))
        .filter((event) => {
          if (!event) return false;
          const eventEnd = event.end_date
            ? parseISO(event.end_date)
            : parseISO(event.event_date);
          return eventEnd < new Date();
        }) as (InternalEvent & { staff_category: string })[];

      setPastEvents(pastEvents || []);
    } catch (error) {
      console.error("Error fetching past events:", error);
      toast({
        title: "Fehler",
        description: "Vergangene Events konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const fetchTimeRecords = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // First get total count for pagination
      const { count, error: countError } = await supabase
        .from("time_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.user.id);

      if (countError) throw countError;

      const total = count || 0;
      setTotalRecords(total);
      setTotalPages(Math.ceil(total / recordsPerPage));

      // Then fetch paginated data
      const { data, error } = await supabase
        .from("time_records")
        .select(
          `
          *,
          internal_events (
            title,
            event_date,
            end_date
          )
        `,
        )
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * recordsPerPage,
          currentPage * recordsPerPage - 1,
        );

      if (error) throw error;
      setTimeRecords(data || []);
    } catch (error) {
      console.error("Error fetching time records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !startDateTime || !endDateTime) return;

    setSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Validate times are within event timeframe
      const selectedEvent = pastEvents.find((e) => e.id === selectedEventId);
      if (!selectedEvent) throw new Error("Event not found");

      const eventStart = parseISO(selectedEvent.event_date);
      const eventEnd = selectedEvent.end_date
        ? parseISO(selectedEvent.end_date)
        : new Date(eventStart.getTime() + 24 * 60 * 60 * 1000);

      const recordStart = parseISO(startDateTime);
      const recordEnd = parseISO(endDateTime);

      if (
        !isWithinInterval(recordStart, { start: eventStart, end: eventEnd }) ||
        !isWithinInterval(recordEnd, { start: eventStart, end: eventEnd })
      ) {
        throw new Error(
          "Arbeitszeiten müssen innerhalb des Event-Zeitraums liegen",
        );
      }

      // Check for overlapping time records
      const { data: existingRecords, error: overlapError } = await supabase
        .from("time_records")
        .select("start_time, end_time")
        .eq("user_id", user.user.id)
        .neq("status", "abgelehnt"); // Only check non-rejected records

      if (overlapError) throw overlapError;

      // Check for overlaps with existing records
      const hasOverlap = existingRecords?.some((existing) => {
        const existingStart = parseISO(existing.start_time);
        const existingEnd = parseISO(existing.end_time);

        // Check if new record overlaps with existing record
        return recordStart < existingEnd && recordEnd > existingStart;
      });

      if (hasOverlap) {
        throw new Error(
          "Die angegebenen Arbeitszeiten überschneiden sich mit einer bereits erfassten Arbeitszeit. Bitte wählen Sie einen anderen Zeitraum.",
        );
      }

      const { error } = await supabase.from("time_records").insert({
        user_id: user.user.id,
        event_id: selectedEventId,
        start_time: startDateTime,
        end_time: endDateTime,
        break_minutes: breakMinutes,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Erfolgreich eingereicht",
        description: "Ihre Arbeitszeiten wurden erfolgreich eingereicht.",
      });

      // Reset form
      setSelectedEventId("");
      setStartDateTime("");
      setEndDateTime("");
      setBreakMinutes(30);
      setNotes("");

      fetchTimeRecords();
      setCurrentPage(1); // Reset to first page after adding new record
    } catch (error: any) {
      toast({
        title: "Fehler",
        description:
          error.message || "Fehler beim Einreichen der Arbeitszeiten.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTimeRecord = async (recordId: string) => {
    if (!confirm("Möchten Sie diese Stundenaufzeichnung wirklich löschen?"))
      return;

    setDeleting(recordId);
    try {
      const { error } = await supabase
        .from("time_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      toast({
        title: "Erfolgreich gelöscht",
        description: "Die Stundenaufzeichnung wurde gelöscht.",
      });

      // If current page becomes empty after deletion, go to previous page
      const newTotal = totalRecords - 1;
      const newTotalPages = Math.ceil(newTotal / recordsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else {
        fetchTimeRecords();
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description:
          error.message || "Fehler beim Löschen der Stundenaufzeichnung.",
        variant: "destructive",
      });
    } finally {
      setDeleting("");
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

  const getSelectedEvent = () => {
    return pastEvents.find((e) => e.id === selectedEventId);
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    const event = pastEvents.find((e) => e.id === eventId);
    if (event) {
      // Set default start time to event date
      const eventStart = parseISO(event.event_date);
      eventStart.setHours(9, 0, 0, 0); // Default to 9:00 AM
      setStartDateTime(eventStart.toISOString());

      // Set default end time
      const eventEnd = new Date(eventStart);
      eventEnd.setHours(17, 0, 0, 0); // Default to 5:00 PM
      setEndDateTime(eventEnd.toISOString());
    }
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24 space-y-8">
        {/* Time Recording Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 hidden md:inline" />
              Neue Stundenerfassung
            </CardTitle>
            <CardDescription>
              Tragen Sie Ihre Arbeitszeiten für ein vergangenes Event ein
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Selection */}
              <div className="space-y-2">
                <Label htmlFor="event">Event auswählen</Label>
                <Select
                  value={selectedEventId}
                  onValueChange={handleEventChange}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Event auswählen..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {pastEvents.map((event) => (
                      <SelectItem
                        key={event.id}
                        value={event.id}
                        className="hover:bg-muted"
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{event.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(event.event_date), "dd.MM.yyyy", {
                              locale: de,
                            })}{" "}
                            • {event.location}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Details */}
              {getSelectedEvent() && (
                <Card className="bg-muted/20">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <div>
                          <span className="text-sm font-medium">
                            Position:{" "}
                          </span>
                          <Badge variant="outline">
                            {getSelectedEvent()?.staff_category ||
                              "Nicht zugeordnet"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          {getSelectedEvent()?.location}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">
                            Event-Start:
                          </span>
                          <p className="text-sm">
                            {format(
                              parseISO(getSelectedEvent()!.event_date),
                              "dd.MM.yyyy, HH:mm",
                              { locale: de },
                            )}{" "}
                            Uhr
                          </p>
                        </div>
                        {getSelectedEvent()?.end_date && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Event-Ende:
                            </span>
                            <p className="text-sm">
                              {format(
                                parseISO(getSelectedEvent()!.end_date!),
                                "dd.MM.yyyy, HH:mm",
                                { locale: de },
                              )}{" "}
                              Uhr
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Multi-day event notice */}
                    {getSelectedEvent()?.end_date &&
                      (() => {
                        const eventStart = parseISO(
                          getSelectedEvent()!.event_date,
                        );
                        const eventEnd = parseISO(
                          getSelectedEvent()!.end_date!,
                        );
                        const daysDiff = Math.ceil(
                          (eventEnd.getTime() - eventStart.getTime()) /
                            (1000 * 60 * 60 * 24),
                        );

                        if (daysDiff > 1) {
                          return (
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3 mt-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5" />
                                <div className="text-sm">
                                  <p className="font-medium text-amber-800 dark:text-amber-200">
                                    Mehrtägiges Event
                                  </p>
                                  <p className="text-amber-700 dark:text-amber-300">
                                    Bitte buchen Sie jeden Arbeitstag separat.
                                    Erstellen Sie für jeden Tag eine eigene
                                    Stundenerfassung.
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                  </CardContent>
                </Card>
              )}

              {/* Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:justify-self-start">
                  <DateTimePicker
                    value={startDateTime}
                    onChange={setStartDateTime}
                    label="Arbeitszeit Start"
                    minDate={
                      getSelectedEvent()
                        ? parseISO(getSelectedEvent()!.event_date)
                        : undefined
                    }
                    maxDate={
                      getSelectedEvent() && getSelectedEvent()!.end_date
                        ? parseISO(getSelectedEvent()!.end_date!)
                        : getSelectedEvent()
                          ? new Date(
                              parseISO(
                                getSelectedEvent()!.event_date,
                              ).getTime() +
                                24 * 60 * 60 * 1000,
                            )
                          : undefined
                    }
                    disabled={!selectedEventId}
                  />
                </div>

                <div className="md:justify-self-start">
                  <DateTimePicker
                    value={endDateTime}
                    onChange={setEndDateTime}
                    label="Arbeitszeit Ende"
                    minDate={
                      startDateTime ? parseISO(startDateTime) : undefined
                    }
                    maxDate={
                      getSelectedEvent() && getSelectedEvent()!.end_date
                        ? parseISO(getSelectedEvent()!.end_date!)
                        : getSelectedEvent()
                          ? new Date(
                              parseISO(
                                getSelectedEvent()!.event_date,
                              ).getTime() +
                                24 * 60 * 60 * 1000,
                            )
                          : undefined
                    }
                    disabled={!selectedEventId || !startDateTime}
                  />
                </div>
              </div>

              {/* Break Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="break">Pause (Minuten)</Label>
                  <Select
                    value={breakMinutes.toString()}
                    onValueChange={(value) => setBreakMinutes(Number(value))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="0" className="hover:bg-muted">
                        0 Min (keine Pause)
                      </SelectItem>
                      <SelectItem value="15" className="hover:bg-muted">
                        15 Min
                      </SelectItem>
                      <SelectItem value="30" className="hover:bg-muted">
                        30 Min
                      </SelectItem>
                      <SelectItem value="45" className="hover:bg-muted">
                        45 Min
                      </SelectItem>
                      <SelectItem value="60" className="hover:bg-muted">
                        60 Min
                      </SelectItem>
                      <SelectItem value="90" className="hover:bg-muted">
                        90 Min
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Working Hours Display */}
                {startDateTime && endDateTime && (
                  <div className="space-y-2">
                    <Label>Arbeitszeit berechnet</Label>
                    <div className="p-3 bg-primary/10 rounded-md border">
                      <p className="text-lg font-semibold text-primary">
                        {calculateWorkingHours(
                          startDateTime,
                          endDateTime,
                          breakMinutes,
                        )}{" "}
                        Stunden
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (inkl. {breakMinutes} Min. Pause)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notizen (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Zusätzliche Informationen zu Ihrer Arbeitszeit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="bg-background"
                />
              </div>

              <Button
                type="submit"
                disabled={
                  !selectedEventId ||
                  !startDateTime ||
                  !endDateTime ||
                  submitting
                }
                className="w-full"
                size="lg"
              >
                {submitting
                  ? "Wird eingereicht..."
                  : "Arbeitszeiten einreichen"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous Time Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 hidden md:inline" />
              Meine Stundenaufzeichnungen
            </CardTitle>
            <CardDescription>
              Übersicht über Ihre eingereichten Arbeitszeiten
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Noch keine Stundenaufzeichnungen vorhanden</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  // Group time records by event
                  const groupedRecords = timeRecords.reduce(
                    (acc, record) => {
                      if (!acc[record.event_id]) {
                        acc[record.event_id] = [];
                      }
                      acc[record.event_id].push(record);
                      return acc;
                    },
                    {} as Record<string, TimeRecord[]>,
                  );

                  return Object.entries(groupedRecords).map(
                    ([eventId, records]) => {
                      const sortedRecords = records.sort(
                        (a, b) =>
                          new Date(a.start_time).getTime() -
                          new Date(b.start_time).getTime(),
                      );
                      const eventTitle = records[0].internal_events.title;
                      const eventDate = records[0].internal_events.event_date;

                      // Calculate total hours for this event
                      const totalHours = records.reduce((sum, record) => {
                        return (
                          sum +
                          parseFloat(
                            calculateWorkingHours(
                              record.start_time,
                              record.end_time,
                              record.break_minutes,
                            ),
                          )
                        );
                      }, 0);

                      return (
                        <div
                          key={eventId}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h3 className="font-semibold">{eventTitle}</h3>
                              <p className="text-sm text-muted-foreground">
                                Event:{" "}
                                {format(parseISO(eventDate), "dd.MM.yyyy", {
                                  locale: de,
                                })}
                                {records.length > 1 && (
                                  <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                                    {records.length} Einträge
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="font-semibold text-primary">
                                Gesamt: {totalHours.toFixed(2)} h
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(records[0].status)}
                                {records[0].status === "eingereicht" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteTimeRecord(records[0].id)
                                    }
                                    disabled={deleting === records[0].id}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Show individual records */}
                          {sortedRecords.map((record, index) => (
                            <div
                              key={record.id}
                              className={`${index > 0 ? "border-t pt-3 mt-3" : ""}`}
                            >
                              {records.length > 1 && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  Tag {index + 1} •{" "}
                                  {format(
                                    parseISO(record.start_time),
                                    "dd.MM.yyyy",
                                    { locale: de },
                                  )}
                                </p>
                              )}

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Start:</span>
                                  <p>
                                    {format(
                                      parseISO(record.start_time),
                                      "dd.MM. HH:mm",
                                      { locale: de },
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Ende:</span>
                                  <p>
                                    {format(
                                      parseISO(record.end_time),
                                      "dd.MM. HH:mm",
                                      { locale: de },
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Pause:</span>
                                  <p>{record.break_minutes} Min.</p>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Arbeitszeit:
                                  </span>
                                  <p className="font-semibold">
                                    {calculateWorkingHours(
                                      record.start_time,
                                      record.end_time,
                                      record.break_minutes,
                                    )}{" "}
                                    h
                                  </p>
                                </div>
                              </div>

                              {record.notes && (
                                <div className="mt-3 p-3 bg-muted rounded text-sm">
                                  <span className="font-medium">Notizen: </span>
                                  {record.notes}
                                </div>
                              )}

                              {/* Individual record delete button for multi-day events */}
                              {records.length > 1 &&
                                record.status === "eingereicht" && (
                                  <div className="mt-3 flex justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteTimeRecord(record.id)
                                      }
                                      disabled={deleting === record.id}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Tag löschen
                                    </Button>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      );
                    },
                  );
                })()}
              </div>
            )}

            {/* Pagination and Summary */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                {totalRecords > 0 ? (
                  <>
                    Zeige {(currentPage - 1) * recordsPerPage + 1} bis{" "}
                    {Math.min(currentPage * recordsPerPage, totalRecords)} von{" "}
                    {totalRecords} Aufzeichnungen
                  </>
                ) : (
                  "Keine Aufzeichnungen vorhanden"
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Seite</span>
                    <Select
                      value={currentPage.toString()}
                      onValueChange={(value) => setCurrentPage(Number(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <SelectItem key={page} value={page.toString()}>
                            {page}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      von {totalPages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
