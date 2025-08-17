import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Loader2 } from 'lucide-react';

interface AppSetting {
    id: string;
    setting_key: string;
    setting_value: any;
    description: string;
}

const SettingsTab = () => {
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [registrationEnabled, setRegistrationEnabled] = useState(true);
    const { toast } = useToast();

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('*')
                .order('setting_key');

            if (error) {
                console.error('Error fetching settings:', error);
                toast({
                    title: "Fehler beim Laden",
                    description: "Die Einstellungen konnten nicht geladen werden.",
                    variant: "destructive"
                });
                return;
            }

            setSettings(data || []);

            // Set registration setting
            const regSetting = data?.find(s => s.setting_key === 'user_registration_enabled');
            if (regSetting) {
                setRegistrationEnabled(regSetting.setting_value === true);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSetting = async (settingKey: string, value: any) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('app_settings')
                .update({
                    setting_value: value,
                    updated_at: new Date().toISOString()
                })
                .eq('setting_key', settingKey);

            if (error) {
                console.error('Error updating setting:', error);
                toast({
                    title: "Fehler beim Speichern",
                    description: "Die Einstellung konnte nicht gespeichert werden.",
                    variant: "destructive"
                });
                return;
            }

            toast({
                title: "Einstellung gespeichert",
                description: "Die Einstellung wurde erfolgreich aktualisiert.",
            });

            // Refresh settings
            await fetchSettings();
        } catch (error) {
            console.error('Error updating setting:', error);
            toast({
                title: "Fehler beim Speichern",
                description: "Die Einstellung konnte nicht gespeichert werden.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleRegistrationToggle = async (enabled: boolean) => {
        setRegistrationEnabled(enabled);
        await updateSetting('user_registration_enabled', enabled);
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
            <div>
                <h2 className="text-2xl font-bold tracking-tight">App-Einstellungen</h2>
                <p className="text-muted-foreground">
                    Verwalten Sie globale Anwendungseinstellungen.
                </p>
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
                                    onCheckedChange={handleRegistrationToggle}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${registrationEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-muted-foreground">
                  Status: {registrationEnabled ? 'Registrierung aktiviert' : 'Registrierung deaktiviert'}
                </span>
                            </div>
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
                            Weitere Einstellungen können hier hinzugefügt werden, wenn benötigt.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SettingsTab;