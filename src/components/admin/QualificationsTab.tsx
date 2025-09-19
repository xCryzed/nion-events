import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Award, Clock, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Qualification {
  id: string;
  name: string;
  description: string | null;
  requires_proof: boolean;
  proof_types: string[];
  is_expirable: boolean;
  validity_period_months: number | null;
  created_at: string;
  updated_at: string;
}

const QualificationsTab = () => {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requires_proof: false,
    proof_types: [] as string[],
    is_expirable: false,
    validity_period_months: ''
  });

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    try {
      const { data, error } = await supabase
        .from('qualifications')
        .select('*')
        .order('name');

      if (error) throw error;
      setQualifications(data || []);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
      toast.error('Fehler beim Laden der Qualifikationen');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingQualification) {
        const { error } = await supabase
          .from('qualifications')
          .update({
            name: formData.name,
            description: formData.description || null,
            requires_proof: formData.requires_proof,
            proof_types: formData.proof_types,
            is_expirable: formData.is_expirable,
            validity_period_months: formData.is_expirable && formData.validity_period_months ? parseInt(formData.validity_period_months) : null
          })
          .eq('id', editingQualification.id);

        if (error) throw error;
        toast.success('Qualifikation erfolgreich aktualisiert');
      } else {
        const { error } = await supabase
          .from('qualifications')
          .insert({
            name: formData.name,
            description: formData.description || null,
            requires_proof: formData.requires_proof,
            proof_types: formData.proof_types,
            is_expirable: formData.is_expirable,
            validity_period_months: formData.is_expirable && formData.validity_period_months ? parseInt(formData.validity_period_months) : null
          });

        if (error) throw error;
        toast.success('Qualifikation erfolgreich erstellt');
      }

      setFormData({ 
        name: '', 
        description: '', 
        requires_proof: false,
        proof_types: [],
        is_expirable: false,
        validity_period_months: ''
      });
      setShowAddDialog(false);
      setEditingQualification(null);
      fetchQualifications();
    } catch (error) {
      console.error('Error saving qualification:', error);
      toast.error('Fehler beim Speichern der Qualifikation');
    }
  };

  const handleEdit = (qualification: Qualification) => {
    setEditingQualification(qualification);
    setFormData({
      name: qualification.name,
      description: qualification.description || '',
      requires_proof: qualification.requires_proof || false,
      proof_types: qualification.proof_types || [],
      is_expirable: qualification.is_expirable || false,
      validity_period_months: qualification.validity_period_months?.toString() || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Qualifikation wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('qualifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Qualifikation erfolgreich gelöscht');
      fetchQualifications();
    } catch (error) {
      console.error('Error deleting qualification:', error);
      toast.error('Fehler beim Löschen der Qualifikation');
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      requires_proof: false,
      proof_types: [],
      is_expirable: false,
      validity_period_months: ''
    });
    setEditingQualification(null);
    setShowAddDialog(false);
  };

  const availableProofTypes = [
    'Zertifikat',
    'Bescheinigung',
    'Zeugnis',
    'Nachweis',
    'Diplom',
    'Urkunde'
  ];

  const addProofType = (type: string) => {
    if (!formData.proof_types.includes(type)) {
      setFormData({
        ...formData,
        proof_types: [...formData.proof_types, type]
      });
    }
  };

  const removeProofType = (type: string) => {
    setFormData({
      ...formData,
      proof_types: formData.proof_types.filter(t => t !== type)
    });
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
          <h2 className="text-2xl font-bold">Qualifikationen</h2>
          <p className="text-muted-foreground">
            Verwalten Sie die verfügbaren Qualifikationen für Mitarbeiter und Jobs
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Neue Qualifikation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingQualification ? 'Qualifikation bearbeiten' : 'Neue Qualifikation'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Thekenerfahrung"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Beschreibung</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beschreibung der Qualifikation..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Nachweispflicht</label>
                    <p className="text-xs text-muted-foreground">Erfordert diese Qualifikation einen Nachweis?</p>
                  </div>
                  <Switch
                    checked={formData.requires_proof}
                    onCheckedChange={(checked) => setFormData({ ...formData, requires_proof: checked })}
                  />
                </div>

                {formData.requires_proof && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Akzeptierte Nachweistypen</label>
                    <div className="space-y-2">
                      <Select onValueChange={addProofType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nachweistyp hinzufügen" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProofTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.proof_types.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.proof_types.map((type) => (
                            <Badge 
                              key={type} 
                              variant="secondary" 
                              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeProofType(type)}
                            >
                              {type} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Ablaufend</label>
                    <p className="text-xs text-muted-foreground">Hat diese Qualifikation ein Ablaufdatum?</p>
                  </div>
                  <Switch
                    checked={formData.is_expirable}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_expirable: checked })}
                  />
                </div>

                {formData.is_expirable && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Gültigkeitsdauer (Monate)</label>
                    <Input
                      type="number"
                      value={formData.validity_period_months}
                      onChange={(e) => setFormData({ ...formData, validity_period_months: e.target.value })}
                      placeholder="z.B. 12"
                      min="1"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  {editingQualification ? 'Aktualisieren' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Verfügbare Qualifikationen
          </CardTitle>
          <CardDescription>
            {qualifications.length} Qualifikation{qualifications.length !== 1 ? 'en' : ''} verfügbar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {qualifications.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Noch keine Qualifikationen erstellt</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Eigenschaften</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualifications.map((qualification) => (
                  <TableRow key={qualification.id}>
                    <TableCell className="font-medium">
                      {qualification.name}
                    </TableCell>
                    <TableCell>
                      {qualification.description ? (
                        <span className="text-sm text-muted-foreground">
                          {qualification.description}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Keine Beschreibung
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {qualification.requires_proof && (
                          <Badge variant="secondary" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            Nachweis
                          </Badge>
                        )}
                        {qualification.is_expirable && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {qualification.validity_period_months}M
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(qualification.created_at).toLocaleDateString('de-DE')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(qualification)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(qualification.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QualificationsTab;