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
  DialogTrigger,
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
  User,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Crown,
  UserCheck,
  Loader2,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { de } from "date-fns/locale";

interface UserWithRole {
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const ProfessionalUsersTab = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>("");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Get ALL profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setUsers([]);
        return;
      }

      // Get user roles for these users (left join style)
      const userIds = profiles.map((profile) => profile.user_id);
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", userIds);

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
      }

      // Combine data - show all users, with or without roles
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const roleRecord = userRoles?.find(
          (r) => r.user_id === profile.user_id,
        );
        return {
          user_id: profile.user_id,
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          email: "", // Email would need to be fetched from auth if needed
          role:
            roleRecord?.role ||
            ("user" as "user" | "administrator" | "employee"), // Default to 'user' if no role assigned
          created_at: roleRecord?.created_at || new Date().toISOString(),
          updated_at: roleRecord?.updated_at || new Date().toISOString(),
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Fehler",
        description: "Benutzerdaten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "administrator":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Administrator
          </Badge>
        );
      case "employee":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <UserCheck className="h-3 w-3" />
            Mitarbeiter
          </Badge>
        );
      case "user":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Benutzer
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return isValid(date)
      ? format(date, "dd.MM.yyyy HH:mm", { locale: de })
      : "-";
  };

  const handleViewUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleEditRole = (user: UserWithRole) => {
    setEditingUserId(user.user_id);
    setEditingRole(user.role);
  };

  const handleSaveRole = async (userId: string) => {
    try {
      // Check if user already has a role
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRole) {
        // Update existing role
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({
            role: editingRole as "user" | "administrator" | "employee",
          })
          .eq("user_id", userId);

        if (updateError) throw updateError;
      } else {
        // Insert new role
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role: editingRole as "user" | "administrator" | "employee",
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Erfolg",
        description: "Benutzerrolle wurde erfolgreich aktualisiert.",
      });

      setEditingUserId(null);
      setEditingRole("");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Fehler",
        description: "Benutzerrolle konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingRole("");
  };

  // Mobile Card Component
  const UserCard = ({ user }: { user: UserWithRole }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-sm">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              ID: {user.user_id.slice(0, 8)}...
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getRoleBadge(user.role)}
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
                <DropdownMenuItem onClick={() => handleViewUser(user)}>
                  <User className="h-4 w-4 mr-2" />
                  Details anzeigen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Erstellt: {formatDate(user.created_at)}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Lade Benutzer...</span>
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
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administratoren
            </CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "administrator").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitarbeiter</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "employee").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "user").length}
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
                  placeholder="Benutzer durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Rolle filtern" />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                <SelectItem value="all">Alle Rollen</SelectItem>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="employee">Mitarbeiter</SelectItem>
                <SelectItem value="user">Benutzer</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Benutzer hinzufügen
            </Button>
          </div>

          {/* Mobile View - Cards */}
          {isMobile ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <UserCard key={user.user_id} user={user} />
              ))}
            </div>
          ) : (
            /* Desktop View - Table */
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Benutzer</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Erstellt am</TableHead>
                    <TableHead>Letztes Update</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.user_id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {user.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {user.user_id.slice(0, 8)}...
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingUserId === user.user_id ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={editingRole}
                              onValueChange={setEditingRole}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border shadow-lg z-50">
                                <SelectItem value="user">Benutzer</SelectItem>
                                <SelectItem value="employee">
                                  Mitarbeiter
                                </SelectItem>
                                <SelectItem value="administrator">
                                  Administrator
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleSaveRole(user.user_id)}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getRoleBadge(user.role)}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRole(user)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>{formatDate(user.updated_at)}</TableCell>
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
                              onClick={() => handleViewUser(user)}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Details anzeigen
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditRole(user)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Rolle bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Benutzer löschen
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

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Benutzer gefunden.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Benutzer Details</DialogTitle>
            <DialogDescription>
              Vollständige Ansicht der Benutzerinformationen
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Benutzerinformationen</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedUser.first_name}{" "}
                      {selectedUser.last_name}
                    </div>
                    <div>
                      <strong>E-Mail:</strong>{" "}
                      {selectedUser.email || "Nicht verfügbar"}
                    </div>
                    <div>
                      <strong>Benutzer-ID:</strong> {selectedUser.user_id}
                    </div>
                    <div>
                      <strong>Rolle:</strong> {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Account-Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Erstellt:</strong>{" "}
                      {formatDate(selectedUser.created_at)}
                    </div>
                    <div>
                      <strong>Letztes Update:</strong>{" "}
                      {formatDate(selectedUser.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Berechtigung ändern
                </Button>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalUsersTab;
