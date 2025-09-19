import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Signature, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { WorkContractDialog } from './WorkContractDialog';

interface WorkContract {
  id: string;
  user_id: string;
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
  additional_agreements: string | null;
  contract_html: string;
  signature_data_url: string | null;
  employer_signature_date: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  internal_events: {
    title: string;
  } | null;
}

interface WorkContractManagementProps {
  eventId?: string;
  userId?: string;
  isAdmin?: boolean;
}

export const WorkContractManagement: React.FC<WorkContractManagementProps> = ({
  eventId,
  userId,
  isAdmin = false
}) => {
  const [contracts, setContracts] = useState<WorkContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<WorkContract | null>(null);
  const [showContractDialog, setShowContractDialog] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, [eventId, userId]);

  const fetchContracts = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('work_contracts')
        .select(`
          *,
          profiles (first_name, last_name),
          internal_events (title)
        `);

      if (eventId && !isAdmin) {
        query = query.eq('event_id', eventId);
      } else if (userId && !isAdmin) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        return;
      }

      setContracts(data as any[] || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignAsEmployer = async (contractId: string) => {
    try {
      const { error } = await supabase
        .from('work_contracts')
        .update({
          signed_by_employer: true,
          employer_signature_date: new Date().toISOString()
        })
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: 'Vertrag unterschrieben',
        description: 'Der Arbeitsvertrag wurde als Arbeitgeber unterschrieben.',
      });

      fetchContracts();
    } catch (error) {
      console.error('Error signing contract as employer:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Unterschreiben des Vertrags.',
        variant: 'destructive',
      });
    }
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
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Lade Arbeitsverträge...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Arbeitsverträge</h3>
          {contracts.length === 0 && (
            <p className="text-sm text-muted-foreground">Keine Arbeitsverträge vorhanden.</p>
          )}
        </div>

        <div className="grid gap-4">
          {contracts.map((contract) => {
            const statusInfo = getContractStatus(contract);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={contract.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <h4 className="font-medium">
                          {contract.job_title} - {contract.internal_events.title}
                        </h4>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>{contract.profiles?.first_name} {contract.profiles?.last_name}</p>
                        <p>Stundenlohn: {contract.hourly_wage}€</p>
                        <p>
                          {format(new Date(contract.start_date), 'dd.MM.yyyy', { locale: de })} - 
                          {format(new Date(contract.end_date), 'dd.MM.yyyy', { locale: de })}
                        </p>
                        <p>Erstellt: {format(new Date(contract.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 text-white`} />
                        <Badge className={`${statusInfo.color} text-white`}>
                          {statusInfo.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedContract(contract)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Anzeigen
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportContractPDF(contract)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>

                      {isAdmin && contract.signed_by_employee && !contract.signed_by_employer && (
                        <Button
                          size="sm"
                          onClick={() => handleSignAsEmployer(contract.id)}
                        >
                          <Signature className="h-4 w-4 mr-1" />
                          Unterschreiben
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedContract && (
        <WorkContractDialog
          isOpen={!!selectedContract}
          onClose={() => setSelectedContract(null)}
          eventId={selectedContract.event_id}
          eventTitle={selectedContract.internal_events.title}
          eventStartDate={selectedContract.start_date}
          eventEndDate={selectedContract.end_date}
          staffCategory={selectedContract.staff_category}
          userId={selectedContract.user_id}
          userName={`${selectedContract.profiles?.first_name || ''} ${selectedContract.profiles?.last_name || ''}`}
          existingContract={selectedContract}
        />
      )}
    </>
  );
};