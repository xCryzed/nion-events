import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Users, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  user_roles?: Array<{ role: string }>;
}

const UsersTab = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{first_name: string; last_name: string; role: string}>({
    first_name: '',
    last_name: '',
    role: 'user'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
                    id,
                    user_id,
                    first_name,
                    last_name,
                    created_at
                `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            user_roles: roles || []
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const startEditing = (user: UserProfile) => {
    setEditingUser(user.id);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.user_roles?.[0]?.role || 'user'
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({ first_name: '', last_name: '', role: 'user' });
  };

  const saveUser = async (userId: string) => {
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name
        })
        .eq('id', editingUser);

      if (profileError) {
        throw profileError;
      }

      // Update role
      const user = users.find(u => u.id === editingUser);
      if (user) {
        // Use upsert to update or insert the role
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: user.user_id,
            role: editForm.role as 'administrator' | 'user'
          }, {
            onConflict: 'user_id'
          });

        if (roleError) {
          throw roleError;
        }
      }

      toast({
        title: "Benutzer aktualisiert",
        description: "Die Benutzerdaten wurden erfolgreich gespeichert.",
      });

      setEditingUser(null);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern der Benutzerdaten.",
        variant: "destructive"
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      'administrator': 'Administrator',
      'user': 'Benutzer'
    };
    return roleLabels[role] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'administrator' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      {users.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Benutzer registriert.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {editingUser === user.id ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            value={editForm.first_name}
                            onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                            placeholder="Vorname"
                            className="w-full sm:w-32"
                          />
                          <Input
                            value={editForm.last_name}
                            onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                            placeholder="Nachname"
                            className="w-full sm:w-32"
                          />
                        </div>
                      ) : (
                        <span>
                                                    {user.first_name && user.last_name
                                                      ? `${user.first_name} ${user.last_name}`
                                                      : user.user_id
                                                    }
                                                </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Registriert {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: de })}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {editingUser === user.id ? (
                      <Select
                        value={editForm.role}
                        onValueChange={(value) => setEditForm({...editForm, role: value})}
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Benutzer</SelectItem>
                          <SelectItem value="administrator">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={getRoleBadgeVariant(user.user_roles?.[0]?.role || 'user')}>
                        {getRoleLabel(user.user_roles?.[0]?.role || 'user')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    User ID: {user.user_id}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {editingUser === user.id ? (
                      <>
                        <Button
                          onClick={() => saveUser(user.user_id)}
                          size="sm"
                          className="flex items-center justify-center gap-1 w-full sm:w-auto"
                        >
                          <Save className="h-4 w-4" />
                          Speichern
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          variant="outline"
                          size="sm"
                          className="flex items-center justify-center gap-1 w-full sm:w-auto"
                        >
                          <X className="h-4 w-4" />
                          Abbrechen
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => startEditing(user)}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Bearbeiten
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersTab;