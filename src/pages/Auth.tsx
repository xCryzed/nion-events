import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackError } from '@/hooks/use-google-analytics';
import { useToast } from '@/components/ui/use-toast';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
import { User, Session } from '@supabase/supabase-js';

const Auth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isRegistrationEnabled, loading: registrationLoading } = useRegistrationStatus();


    useEffect(() => {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                // Redirect to home if user is authenticated
                if (session?.user) {
                    navigate('/');
                }
            }
        );

        // THEN check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Redirect to home if already authenticated
            if (session?.user) {
                navigate('/');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];

        if (password.length < 16) {
            errors.push("Das Passwort muss mindestens 16 Zeichen lang sein");
        }

        if (!/[a-zA-Z]/.test(password)) {
            errors.push("Das Passwort muss Buchstaben enthalten");
        }

        if (!/[0-9]/.test(password)) {
            errors.push("Das Passwort muss Zahlen enthalten");
        }

        // Check for common patterns that make passwords easy to guess
        if (/(.)\1{2,}/.test(password)) {
            errors.push("Das Passwort darf nicht mehr als 2 gleiche Zeichen hintereinander enthalten");
        }

        if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
            errors.push("Das Passwort muss eine Kombination aus Buchstaben und Zahlen enthalten");
        }

        return errors;
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setFormData(prev => ({ ...prev, password }));
        setPasswordErrors(validatePassword(password));
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isRegistrationEnabled) {
            toast({
                title: "Registrierung deaktiviert",
                description: "Die Registrierung neuer Benutzer ist derzeit deaktiviert.",
                variant: "destructive"
            });
            return;
        }

        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            toast({
                title: "Fehler",
                description: "Bitte füllen Sie alle Felder aus.",
                variant: "destructive"
            });
            return;
        }

        const passwordValidationErrors = validatePassword(formData.password);
        if (passwordValidationErrors.length > 0) {
            toast({
                title: "Passwort-Anforderungen nicht erfüllt",
                description: passwordValidationErrors.join(", "),
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        const redirectUrl = `${window.location.origin}/`;

        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    first_name: formData.firstName,
                    last_name: formData.lastName
                }
            }
        });

        setLoading(false);

        if (error) {
            trackError(error.message, 'authentication', 'signup_form', {
                email: formData.email,
                error_type: error.message.includes('User already registered') ? 'user_exists' : 'signup_error'
            });

            if (error.message.includes('User already registered')) {
                toast({
                    title: "Benutzer bereits registriert",
                    description: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits. Versuchen Sie sich anzumelden.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Registrierung fehlgeschlagen",
                    description: error.message,
                    variant: "destructive"
                });
            }
        } else {
            // Clear form data on successful signup
            setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: ''
            });
            toast({
                title: "Registrierung erfolgreich",
                description: "Bitte überprüfen Sie Ihre E-Mails zur Bestätigung.",
            });
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast({
                title: "Fehler",
                description: "Bitte füllen Sie alle Felder aus.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        setLoading(false);

        if (error) {
            trackError(error.message, 'authentication', 'signin_form', {
                email: formData.email,
                error_type: error.message.includes('Invalid login credentials') ? 'invalid_credentials' : 'signin_error'
            });

            if (error.message.includes('Invalid login credentials')) {
                toast({
                    title: "Anmeldung fehlgeschlagen",
                    description: "Ungültige E-Mail-Adresse oder Passwort.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Anmeldung fehlgeschlagen",
                    description: error.message,
                    variant: "destructive"
                });
            }
        } else {
            // Form will be cleared automatically when user is redirected
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-accent/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Zurück zur Startseite
                    </Link>
                </div>

                <Card className="glass-card">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl font-bold text-white">N</span>
                        </div>
                        <CardTitle className="text-2xl font-bold">NION Events</CardTitle>
                        <CardDescription>
                            Melden Sie sich an oder erstellen Sie ein neues Konto
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="signin" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="signin">Anmelden</TabsTrigger>
                                <TabsTrigger
                                    value="signup"
                                    disabled={!isRegistrationEnabled || registrationLoading}
                                    className={!isRegistrationEnabled ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Registrieren
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="signin" className="space-y-4 mt-6">
                                <form onSubmit={handleSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signin-email">E-Mail</Label>
                                        <Input
                                            id="signin-email"
                                            name="email"
                                            type="email"
                                            placeholder="ihre@email.de"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signin-password">Passwort</Label>
                                        <div className="relative">
                                            <Input
                                                id="signin-password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full btn-hero" disabled={loading}>
                                        {loading ? "Anmelden..." : "Anmelden"}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup" className="space-y-4 mt-6">
                                {!isRegistrationEnabled ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">
                                            Die Registrierung neuer Benutzer ist derzeit deaktiviert.
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Bitte wenden Sie sich an den Administrator.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSignUp} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-firstName">Vorname</Label>
                                            <Input
                                                id="signup-firstName"
                                                name="firstName"
                                                type="text"
                                                placeholder="Max"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-lastName">Nachname</Label>
                                            <Input
                                                id="signup-lastName"
                                                name="lastName"
                                                type="text"
                                                placeholder="Mustermann"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-email">E-Mail</Label>
                                            <Input
                                                id="signup-email"
                                                name="email"
                                                type="email"
                                                placeholder="ihre@email.de"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-password">Passwort</Label>
                                            <div className="relative">
                                                <Input
                                                    id="signup-password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    minLength={16}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>Passwort-Anforderungen:</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs">
                                                    <li className={formData.password.length >= 16 ? "text-green-600" : ""}>
                                                        Mindestens 16 Zeichen
                                                    </li>
                                                    <li className={/[a-zA-Z]/.test(formData.password) ? "text-green-600" : ""}>
                                                        Buchstaben enthalten
                                                    </li>
                                                    <li className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>
                                                        Zahlen enthalten
                                                    </li>
                                                    <li className={!/(.)\1{2,}/.test(formData.password) && formData.password.length > 0 ? "text-green-600" : ""}>
                                                        Keine Wiederholungen
                                                    </li>
                                                </ul>
                                                {passwordErrors.length > 0 && (
                                                    <div className="text-destructive text-xs mt-2">
                                                        {passwordErrors.map((error, index) => (
                                                            <p key={index}>• {error}</p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full btn-hero" disabled={loading || !isRegistrationEnabled}>
                                            {loading ? "Registrieren..." : "Registrieren"}
                                        </Button>
                                    </form>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Auth;