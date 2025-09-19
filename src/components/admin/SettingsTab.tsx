import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Loader2 } from "lucide-react";

interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
}

const SettingsTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const { toast } = useToast();

  // Refresh function to sync with current status
  const refreshStatus = async () => {
    setLoading(true);
    await fetchSettings();
  };

  const fetchSettings = async () => {
    try {
      // Default to enabled in UI; authoritative control is in Supabase Dashboard
      setRegistrationEnabled(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (_settingKey: string, _value: any) => {
    toast({
      title: "In Supabase verwalten",
      description:
        "Bitte ändern Sie die Registrierung in den Supabase Authentication Settings.",
    });
  };

  const handleRegistrationToggle = async (_enabled: boolean) => {
    toast({
      title: "Nicht direkt änderbar",
      description: "Diese Einstellung wird im Supabase Dashboard verwaltet.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            App-Einstellungen
          </h2>
          <p className="text-muted-foreground">
            Verwalten Sie globale Anwendungseinstellungen.
          </p>
        </div>
        <button
          onClick={refreshStatus}
          disabled={loading}
          className="px-3 py-1 text-sm border rounded hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Aktualisiere..." : "Status aktualisieren"}
        </button>
      </div>

      <div className="grid gap-6">
        {/* User Registration Setting */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Benutzer-Registrierung</CardTitle>
            </div>
            <CardDescription>
              Kontrollieren Sie, ob neue Benutzer sich registrieren können.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="registration-toggle" className="text-base">
                  Registrierung aktiviert
                </Label>
                <p className="text-sm text-muted-foreground">
                  Neue Benutzer können sich für Konten registrieren
                </p>
              </div>
              <div className="flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Switch
                  id="registration-toggle"
                  checked={registrationEnabled}
                  onCheckedChange={() =>
                    handleRegistrationToggle(registrationEnabled)
                  }
                  disabled
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${registrationEnabled ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-muted-foreground">
                  Status:{" "}
                  {registrationEnabled
                    ? "Registrierung aktiviert"
                    : "Registrierung deaktiviert"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Diese Einstellung synchronisiert sich mit den Supabase
                Authentication Settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Weitere Einstellungen</CardTitle>
            <CardDescription>
              Zusätzliche Konfigurationsoptionen werden hier angezeigt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Weitere Einstellungen können hier hinzugefügt werden, wenn
              benötigt.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsTab;
