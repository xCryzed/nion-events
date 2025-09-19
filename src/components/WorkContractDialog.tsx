import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, FileText, Signature, Download } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface WorkContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  staffCategory: string;
  userId: string;
  userName: string;
  existingContract?: any;
}

interface PersonalData {
  first_name: string;
  last_name: string;
  street_address: string;
  postal_code: string;
  city: string;
  signature_data_url?: string;
}

export const WorkContractDialog: React.FC<WorkContractDialogProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventStartDate,
  eventEndDate,
  staffCategory,
  userId,
  userName,
  existingContract,
}) => {
  const [contract, setContract] = useState({
    job_title: "",
    hourly_wage: "",
    additional_agreements: "",
  });
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [useExistingSignature, setUseExistingSignature] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPersonalData();
      if (existingContract) {
        setContract({
          job_title: existingContract.job_title || "",
          hourly_wage: existingContract.hourly_wage?.toString() || "",
          additional_agreements: existingContract.additional_agreements || "",
        });
      }
    }
  }, [isOpen, existingContract]);

  const fetchPersonalData = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_personal_data")
        .select(
          "first_name, last_name, street_address, postal_code, city, signature_data_url",
        )
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching personal data:", error);
        return;
      }

      setPersonalData(data);
      setUseExistingSignature(!!data.signature_data_url);
    } catch (error) {
      console.error("Error fetching personal data:", error);
    }
  };

  const generateContractHTML = () => {
    if (!personalData) return "";

    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">Arbeitsvertrag</h1>
          <h2 style="font-size: 18px; font-weight: normal;">für kurzfristig beschäftigte Arbeitnehmer</h2>
        </div>

        <div style="margin-bottom: 30px;">
          <p><strong>Zwischen</strong></p>
          <div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd;">
            <p>Eventmanagement Nino Bergen<br>
            Dobacher Str. 126<br>
            52146 Würselen</p>
            <p style="margin-top: 15px;"><em>- nachfolgend "Arbeitgeber" genannt -</em></p>
          </div>

          <p><strong>und</strong></p>
          <div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd;">
            <p>Herr/Frau<br>
            ${personalData.first_name} ${personalData.last_name}<br>
            ${personalData.street_address}<br>
            ${personalData.postal_code} ${personalData.city}</p>
            <p style="margin-top: 15px;"><em>- nachfolgend "Arbeitnehmer" genannt -</em></p>
          </div>

          <p><strong>wird folgender</strong></p>
          <h2 style="text-align: center; font-size: 20px;">Arbeitsvertrag</h2>
          <p><strong>geschlossen:</strong></p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3>§ 1 Tätigkeit</h3>
          <p>Der Arbeitnehmer wird eingestellt als:</p>
          <p><strong>${contract.job_title}</strong>.</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3>§ 2 Beginn und Ende der Beschäftigung</h3>
          <p>Das Arbeitsverhältnis beginnt am <strong>${format(new Date(eventStartDate), "dd.MM.yyyy", { locale: de })}</strong> (Datum des ersten Arbeitstages)</p>
          <p>und ist befristet bis zum <strong>${format(new Date(eventEndDate), "dd.MM.yyyy", { locale: de })}</strong> (Datum des letzten Arbeitstages).</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3>§ 3 Vergütung</h3>
          <p>Der Arbeitnehmer erhält eine Vergütung von <strong>${contract.hourly_wage}</strong> Euro pro Stunde. Die Vergütung ist jeweils zum Monatsletzten zur Zahlung fällig.</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3>§ 4 Arbeitszeit</h3>
          <p>Der Arbeitseinsatz erfolgt nach vorheriger Absprache mit dem Arbeitgeber. Während der Dauer dieses Vertrags wird eine maximale Arbeitszeit von 70 Tagen vereinbart.</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3>§ 5 Kündigung</h3>
          <p>Es gelten die gesetzlichen Kündigungsfristen.</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3>§ 6 Vertragsänderungen, Mitteilungspflichten</h3>
          <p>Vertragsänderungen bedürfen der Schriftform. Der Arbeitnehmer ist verpflichtet, alle Änderungen von tatsächlichen Verhältnissen mitzuteilen, die für die Sozialversicherungsfreiheit von Bedeutung sind.</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3>§ 7 Weitere Vereinbarungen</h3>
          ${contract.additional_agreements ? `<p>${contract.additional_agreements}</p>` : '<p style="height: 60px;"></p>'}
        </div>

        <div style="margin-bottom: 25px;">
          <h3>§ 8 Salvatorische Klausel</h3>
          <p>Sollte eine Bestimmung dieses Vertrags ganz oder teilweise unwirksam oder undurchführbar sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen hiervon unberührt. Anstelle der unwirksamen oder undurchführbaren Bestimmung tritt eine Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung möglichst nahekommt. Gleiches gilt im Fall einer Regelungslücke.</p>
        </div>

        <div style="margin-top: 60px;">
          <div style="display: flex; justify-content: space-between;">
            <div style="text-align: center;">
              <div style="border-top: 1px solid #000; width: 200px; margin-bottom: 10px;"></div>
              <p>Ort, Datum, Unterschrift Arbeitgeber</p>
            </div>
            <div style="text-align: center;">
              <div style="border-top: 1px solid #000; width: 200px; margin-bottom: 10px;"></div>
              <p>Ort, Datum, Unterschrift Arbeitnehmer</p>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const handleCreateContract = async () => {
    if (!contract.job_title || !contract.hourly_wage) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const contractHTML = generateContractHTML();

      const { error } = await supabase.from("work_contracts").insert({
        user_id: userId,
        event_id: eventId,
        staff_category: staffCategory,
        job_title: contract.job_title,
        hourly_wage: parseFloat(contract.hourly_wage),
        start_date: format(new Date(eventStartDate), "yyyy-MM-dd"),
        end_date: format(new Date(eventEndDate), "yyyy-MM-dd"),
        additional_agreements: contract.additional_agreements,
        contract_html: contractHTML,
      });

      if (error) throw error;

      toast({
        title: "Vertrag erstellt",
        description: "Der Arbeitsvertrag wurde erfolgreich erstellt.",
      });

      setIsSigning(true);
    } catch (error) {
      console.error("Error creating contract:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des Vertrags.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignContract = async () => {
    let signatureData = "";

    if (useExistingSignature && personalData?.signature_data_url) {
      signatureData = personalData.signature_data_url;
    } else if (signatureRef.current && !signatureRef.current.isEmpty()) {
      signatureData = signatureRef.current.toDataURL();
    } else {
      toast({
        title: "Unterschrift erforderlich",
        description: "Bitte unterschreiben Sie den Vertrag.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("work_contracts")
        .update({
          signature_data_url: signatureData,
          signed_at: new Date().toISOString(),
          signed_by_employee: true,
        })
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .eq("staff_category", staffCategory);

      if (error) throw error;

      toast({
        title: "Vertrag unterschrieben",
        description: "Der Arbeitsvertrag wurde erfolgreich unterschrieben.",
      });

      onClose();
    } catch (error) {
      console.error("Error signing contract:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Unterschreiben des Vertrags.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!personalData) return;

    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text("Arbeitsvertrag", 105, 20, { align: "center" });
      doc.setFontSize(14);
      doc.text("für kurzfristig beschäftigte Arbeitnehmer", 105, 30, {
        align: "center",
      });

      let yPos = 50;

      // Employer section
      doc.setFontSize(12);
      doc.text("Zwischen", 20, yPos);
      yPos += 10;

      doc.rect(20, yPos, 170, 30);
      yPos += 8;
      doc.text("Eventmanagement Nino Bergen", 25, yPos);
      yPos += 6;
      doc.text("Dobacher Str. 126", 25, yPos);
      yPos += 6;
      doc.text("52146 Würselen", 25, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text('- nachfolgend "Arbeitgeber" genannt -', 25, yPos);

      yPos += 20;
      doc.setFontSize(12);
      doc.text("und", 20, yPos);
      yPos += 10;

      // Employee section
      doc.rect(20, yPos, 170, 30);
      yPos += 8;
      doc.text(
        `${personalData.first_name} ${personalData.last_name}`,
        25,
        yPos,
      );
      yPos += 6;
      doc.text(personalData.street_address, 25, yPos);
      yPos += 6;
      doc.text(`${personalData.postal_code} ${personalData.city}`, 25, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text('- nachfolgend "Arbeitnehmer" genannt -', 25, yPos);

      yPos += 20;
      doc.setFontSize(14);
      doc.text("Arbeitsvertrag", 105, yPos, { align: "center" });
      yPos += 10;
      doc.setFontSize(12);
      doc.text("geschlossen:", 20, yPos);

      // Contract sections
      yPos += 20;
      doc.setFontSize(12);
      doc.text("§ 1 Tätigkeit", 20, yPos);
      yPos += 8;
      doc.text("Der Arbeitnehmer wird eingestellt als:", 20, yPos);
      yPos += 6;
      doc.setFont("helvetica", "bold");
      doc.text(contract.job_title, 20, yPos);
      doc.setFont("helvetica", "normal");

      yPos += 15;
      doc.text("§ 2 Beginn und Ende der Beschäftigung", 20, yPos);
      yPos += 8;
      doc.text(
        `Das Arbeitsverhältnis beginnt am ${format(new Date(eventStartDate), "dd.MM.yyyy", { locale: de })}`,
        20,
        yPos,
      );
      yPos += 6;
      doc.text(
        `und ist befristet bis zum ${format(new Date(eventEndDate), "dd.MM.yyyy", { locale: de })}.`,
        20,
        yPos,
      );

      // Add new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 15;
      doc.text("§ 3 Vergütung", 20, yPos);
      yPos += 8;
      doc.text(
        `Der Arbeitnehmer erhält eine Vergütung von ${contract.hourly_wage} Euro pro Stunde.`,
        20,
        yPos,
      );
      yPos += 6;
      doc.text(
        "Die Vergütung ist jeweils zum Monatsletzten zur Zahlung fällig.",
        20,
        yPos,
      );

      yPos += 15;
      doc.text("§ 4 Arbeitszeit", 20, yPos);
      yPos += 8;
      const arbeitszeit = doc.splitTextToSize(
        "Der Arbeitseinsatz erfolgt nach vorheriger Absprache mit dem Arbeitgeber. Während der Dauer dieses Vertrags wird eine maximale Arbeitszeit von 70 Tagen vereinbart.",
        170,
      );
      doc.text(arbeitszeit, 20, yPos);
      yPos += arbeitszeit.length * 6;

      // Continue with remaining sections...
      doc.save(
        `arbeitsvertrag_${personalData.first_name}_${personalData.last_name}_${format(new Date(), "yyyy-MM-dd")}.pdf`,
      );

      toast({
        title: "PDF Export",
        description: "Arbeitsvertrag wurde als PDF exportiert.",
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

  if (!personalData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Arbeitsvertrag - {eventTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!isSigning ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Vertragsdetails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="job_title">Tätigkeit *</Label>
                      <Input
                        id="job_title"
                        value={contract.job_title}
                        onChange={(e) =>
                          setContract((prev) => ({
                            ...prev,
                            job_title: e.target.value,
                          }))
                        }
                        placeholder="z.B. Thekenkraft, Service-Personal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourly_wage">Stundenlohn (EUR) *</Label>
                      <Input
                        id="hourly_wage"
                        type="number"
                        step="0.01"
                        value={contract.hourly_wage}
                        onChange={(e) =>
                          setContract((prev) => ({
                            ...prev,
                            hourly_wage: e.target.value,
                          }))
                        }
                        placeholder="12.50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="additional_agreements">
                      Weitere Vereinbarungen
                    </Label>
                    <Textarea
                      id="additional_agreements"
                      value={contract.additional_agreements}
                      onChange={(e) =>
                        setContract((prev) => ({
                          ...prev,
                          additional_agreements: e.target.value,
                        }))
                      }
                      placeholder="Zusätzliche Vereinbarungen oder Anmerkungen"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button onClick={handleCreateContract} disabled={isLoading}>
                  {isLoading ? "Wird erstellt..." : "Vertrag erstellen"}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Abbrechen
                </Button>
              </div>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Vertragsvorschau</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: generateContractHTML() }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Signature className="h-5 w-5" />
                    Unterschrift
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {personalData.signature_data_url && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={useExistingSignature}
                          onChange={(e) =>
                            setUseExistingSignature(e.target.checked)
                          }
                        />
                        Gespeicherte Unterschrift verwenden
                      </label>
                      {useExistingSignature && (
                        <img
                          src={personalData.signature_data_url}
                          alt="Gespeicherte Unterschrift"
                          className="max-h-20 border rounded"
                        />
                      )}
                    </div>
                  )}

                  {!useExistingSignature && (
                    <div>
                      <Label>Neue Unterschrift</Label>
                      <div className="border rounded p-2 bg-white">
                        <SignatureCanvas
                          ref={signatureRef}
                          canvasProps={{
                            width: 400,
                            height: 150,
                            className: "signature-canvas",
                          }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => signatureRef.current?.clear()}
                        className="mt-2"
                      >
                        Unterschrift löschen
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button onClick={handleSignContract} disabled={isLoading}>
                  {isLoading
                    ? "Wird unterschrieben..."
                    : "Vertrag unterschreiben"}
                </Button>
                <Button variant="outline" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF Export
                </Button>
                <Button variant="outline" onClick={() => setIsSigning(false)}>
                  Zurück
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
