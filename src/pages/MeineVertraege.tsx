import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Euro, Clock, CheckCircle, Signature } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { WorkContractDialog } from '@/components/WorkContractDialog';

interface WorkContract {
  id: string;
  event_id: string;
  staff_category: string;
  job_title: string;
  hourly_wage: number;
  start_date: string;
  end_date: string;
  signed_by_employee: boolean;
  signed_by_employer: boolean;
  signed_at: string | null;
  created_at: string;
  internal_events: {
    title: string;
  } | null;
}

interface EventRegistration {
  id: string;
  event_id: string;
  staff_category: string;
  status: string;
  created_at: string;
  internal_events: {
    id: string;
    title: string;
    event_date: string;
    end_date: string | null;
    contract_required: boolean;
  } | null;
}

const MeineVertraege = () => {
  const [contracts, setContracts] = useState<WorkContract[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<EventRegistration | null>(null);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchContracts(user.id);
      fetchRegistrations(user.id);
    }
  };

  const fetchContracts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('work_contracts')
        .select(`
          *,
          internal_events (title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Laden der Arbeitsverträge.',
        variant: 'destructive',
      });
    }
  };

  const fetchRegistrations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          internal_events (
            id,
            title,
            event_date,
            end_date,
            contract_required
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'bestätigt')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter only registrations that require contracts but don't have them yet
      const contractRequiredRegistrations = (data || []).filter(reg => 
        reg.internal_events?.contract_required && 
        !contracts.some(contract => 
          contract.event_id === reg.event_id && 
          contract.staff_category === reg.staff_category
        )
      );
      
      setRegistrations(contractRequiredRegistrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Laden der Event-Anmeldungen.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = (registration: EventRegistration) => {
    setSelectedRegistration(registration);
    setShowContractDialog(true);
  };

  const exportContractPDF = async (contract: WorkContract) => {
    try {
      // Implementation would generate PDF from contract data
      toast({
        title: 'PDF Export',
        description: 'Arbeitsvertrag wird als PDF exportiert...',
      });
    } catch (error) {
      console.error('Error exporting contract PDF:', error);
      toast({
        title: 'Fehler beim PDF Export',
        description: 'Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    }
  };

  const getContractStatus = (contract: WorkContract) => {
    if (contract.signed_by_employee && contract.signed_by_employer) {
      return { status: 'Vollständig unterzeichnet', color: 'bg-green-500', icon: CheckCircle };
    } else if (contract.signed_by_employee) {
      return { status: 'Wartet auf Arbeitgeber', color: 'bg-yellow-500', icon: Clock };
    } else {
      return { status: 'Wartet auf Unterschrift', color: 'bg-red-500', icon: Signature };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Meine Arbeitsverträge</h1>
        <p className="text-muted-foreground mt-2">
          Verwalten Sie Ihre Arbeitsverträge und unterschreiben Sie neue Verträge für Events.
        </p>
      </div>

      {/* Pending Contracts Section */}
      {registrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ausstehende Arbeitsverträge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{registration.internal_events?.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Position: {registration.staff_category}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {registration.internal_events?.event_date && 
                      format(new Date(registration.internal_events.event_date), 'dd.MM.yyyy', { locale: de })
                    }
                  </p>
                </div>
                <Button onClick={() => handleCreateContract(registration)}>
                  <Signature className="h-4 w-4 mr-2" />
                  Vertrag erstellen
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Existing Contracts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Meine Arbeitsverträge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Keine Arbeitsverträge vorhanden.
            </p>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => {
                const statusInfo = getContractStatus(contract);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div
                    key={contract.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-medium">{contract.job_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {contract.internal_events?.title}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          {contract.hourly_wage}€/h
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(contract.start_date), 'dd.MM.yyyy', { locale: de })} - 
                          {format(new Date(contract.end_date), 'dd.MM.yyyy', { locale: de })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4 text-white" />
                        <Badge className={`${statusInfo.color} text-white`}>
                          {statusInfo.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportContractPDF(contract)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Dialog */}
      {selectedRegistration && (
        <WorkContractDialog
          isOpen={showContractDialog}
          onClose={() => {
            setShowContractDialog(false);
            setSelectedRegistration(null);
            if (user) {
              fetchContracts(user.id);
              fetchRegistrations(user.id);
            }
          }}
          eventId={selectedRegistration.event_id}
          eventTitle={selectedRegistration.internal_events?.title || ''}
          eventStartDate={selectedRegistration.internal_events?.event_date || ''}
          eventEndDate={selectedRegistration.internal_events?.end_date || selectedRegistration.internal_events?.event_date || ''}
          staffCategory={selectedRegistration.staff_category}
          userId={user?.id || ''}
          userName=""
        />
      )}
    </div>
  );
};

export default MeineVertraege;
