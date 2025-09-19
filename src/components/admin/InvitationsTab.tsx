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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Search,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  UserPlus,
} from "lucide-react";
import { format, parseISO, isValid, isPast } from "date-fns";
import { de } from "date-fns/locale";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  invited_by: string;
  inviter_name?: string;
}

const InvitationsTab = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<Invitation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"employee" | "administrator">(
    "employee",
  );
  const [sendingInvite, setSendingInvite] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvitations();
  }, []);

  useEffect(() => {
    const filtered = invitations.filter(
      (invitation) =>
        invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invitation.inviter_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invitation.status.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredInvitations(filtered);
  }, [invitations, searchTerm]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);

      // Get invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("employee_invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (invitationsError) {
        throw invitationsError;
      }

      // Get profiles for invited_by users
      const inviterIds = invitationsData?.map((inv) => inv.invited_by) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", inviterIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Format the data with inviter names
      const formattedInvitations: Invitation[] =
        invitationsData?.map((invitation) => {
          const inviterProfile = profiles?.find(
            (p) => p.user_id === invitation.invited_by,
          );
          return {
            ...invitation,
            inviter_name:
              inviterProfile?.first_name && inviterProfile?.last_name
                ? `${inviterProfile.first_name} ${inviterProfile.last_name}`
                : "Unbekannt",
          };
        }) || [];

      setInvitations(formattedInvitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Fehler",
        description: "Einladungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    setActionLoading(invitation.id);
    try {
      // Get current user profile for inviter name
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", user?.id)
        .maybeSingle();

      const inviterName =
        profile?.first_name && profile?.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : "Das NION Events Team";

      // Update expiry date
      const { error: updateError } = await supabase
        .from("employee_invitations")
        .update({
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 7 days from now
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      if (updateError) {
        throw updateError;
      }

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke(
        "send-employee-invitation",
        {
          body: {
            email: invitation.email,
            inviterName,
          },
        },
      );

      if (emailError) {
        throw emailError;
      }

      toast({
        title: "Einladung erneut gesendet",
        description: `Einladung wurde erfolgreich an ${invitation.email} erneut gesendet.`,
      });

      fetchInvitations(); // Refresh the list
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast({
        title: "Fehler",
        description: "Einladung konnte nicht erneut gesendet werden.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteInvitation = async (invitation: Invitation) => {
    setActionLoading(invitation.id);
    try {
      const { error } = await supabase
        .from("employee_invitations")
        .delete()
        .eq("id", invitation.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Einladung gelöscht",
        description: `Einladung für ${invitation.email} wurde gelöscht.`,
      });

      fetchInvitations(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting invitation:", error);
      toast({
        title: "Fehler",
        description: "Einladung konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleInviteEmployee = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    setSendingInvite(true);
    try {
      // Get current user profile for inviter name
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", user?.id)
        .maybeSingle();

      const inviterName =
        profile?.first_name && profile?.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : "Das NION Events Team";

      // Create invitation in database
      const { error: insertError } = await supabase
        .from("employee_invitations")
        .insert({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          invited_by: user?.id,
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 7 days
        });

      if (insertError) {
        throw insertError;
      }

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke(
        "send-employee-invitation",
        {
          body: {
            email: inviteEmail.trim().toLowerCase(),
            inviterName,
          },
        },
      );

      if (emailError) {
        throw emailError;
      }

      toast({
        title: "Einladung gesendet",
        description: `Einladung wurde erfolgreich an ${inviteEmail} gesendet.`,
      });

      setInviteEmail("");
      setInviteRole("employee");
      setInviteDialogOpen(false);
      fetchInvitations(); // Refresh the list
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Fehler",
        description: "Einladung konnte nicht gesendet werden.",
        variant: "destructive",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const getStatusBadge = (invitation: Invitation) => {
    const expiresAt = new Date(invitation.expires_at);
    const isExpired = isPast(expiresAt);

    switch (invitation.status) {
      case "pending":
        return isExpired ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Abgelaufen
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Ausstehend
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Akzeptiert
          </Badge>
        );
      default:
        return <Badge variant="outline">{invitation.status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return isValid(date)
      ? format(date, "dd.MM.yyyy HH:mm", { locale: de })
      : "-";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Lade Einladungen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                invitations.filter(
                  (i) =>
                    i.status === "pending" && !isPast(new Date(i.expires_at)),
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akzeptiert</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations.filter((i) => i.status === "accepted").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgelaufen</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                invitations.filter(
                  (i) =>
                    i.status === "pending" && isPast(new Date(i.expires_at)),
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Einladungen durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={fetchInvitations} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Aktualisieren
              </Button>

              <Dialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Mitarbeiter einladen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neuen Mitarbeiter einladen</DialogTitle>
                    <DialogDescription>
                      Senden Sie eine Einladung an die E-Mail-Adresse des neuen
                      Mitarbeiters.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">E-Mail-Adresse</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="mitarbeiter@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Rolle</Label>
                      <Select
                        value={inviteRole}
                        onValueChange={(value: "employee" | "administrator") =>
                          setInviteRole(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Rolle auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Mitarbeiter</SelectItem>
                          <SelectItem value="administrator">
                            Administrator
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInviteEmail("");
                        setInviteRole("employee");
                        setInviteDialogOpen(false);
                      }}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      onClick={handleInviteEmployee}
                      disabled={sendingInvite}
                    >
                      {sendingInvite ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Einladung senden
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Eingeladen von</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead>Läuft ab am</TableHead>
                  <TableHead>Akzeptiert am</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((invitation) => {
                  const isExpired = isPast(new Date(invitation.expires_at));
                  const canResend =
                    invitation.status === "pending" && isExpired;
                  const canDelete = invitation.status !== "accepted";

                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{invitation.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{invitation.role}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(invitation)}</TableCell>
                      <TableCell>{invitation.inviter_name}</TableCell>
                      <TableCell>{formatDate(invitation.created_at)}</TableCell>
                      <TableCell>
                        <span className={isExpired ? "text-destructive" : ""}>
                          {formatDate(invitation.expires_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {invitation.accepted_at
                          ? formatDate(invitation.accepted_at)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {canResend && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendInvitation(invitation)}
                              disabled={actionLoading === invitation.id}
                            >
                              {actionLoading === invitation.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {canDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={actionLoading === invitation.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Einladung löschen
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Sind Sie sicher, dass Sie die Einladung für{" "}
                                    {invitation.email} löschen möchten? Diese
                                    Aktion kann nicht rückgängig gemacht werden.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Abbrechen
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteInvitation(invitation)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Löschen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredInvitations.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Einladungen gefunden.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationsTab;
