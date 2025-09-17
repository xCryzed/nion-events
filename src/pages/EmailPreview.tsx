import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmailPreview = () => {
  const { token } = useParams<{ token: string }>();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Registrierung - DJ Aachen & Eventtechnik | NION Events';
  }, []);

  useEffect(() => {
    document.title = 'Registrierung - DJ Aachen & Eventtechnik | NION Events';
    
    const fetchInvitation = async () => {
      if (!token) {
        setError('Kein gültiger Token');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('employee_invitations')
          .select('*')
          .eq('invitation_token', token)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error || !data || data.length === 0) {
          setError('Einladung nicht gefunden');
        } else {
          setInvitation(data[0]);
        }
      } catch (error: any) {
        setError('Fehler beim Laden der Einladung');
      }

      setLoading(false);
    };

    fetchInvitation();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Email-Vorschau...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-accent/5 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">Email nicht gefunden</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zur Startseite
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const registrationUrl = `${window.location.origin}/anmelden?email=${encodeURIComponent(invitation.email)}&token=${encodeURIComponent(invitation.invitation_token)}`;
  const inviterName = "Das NION Events Team"; // Default, could be enhanced to include actual inviter

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent p-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Zurück zur Startseite
          </Link>
        </div>

        {/* Email Preview Container */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent p-4 text-white">
            <h1 className="text-xl font-bold">Email-Vorschau</h1>
            <p className="text-white/80">Einladung zu NION Events</p>
          </div>

          {/* Email Content */}
          <div 
            className="p-0"
            dangerouslySetInnerHTML={{
              __html: `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrierung</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .welcome-section {
            margin-bottom: 30px;
            background: rgba(102, 126, 234, 0.05);
            border-radius: 12px;
            padding: 30px;
            border-left: 4px solid #667eea;
            text-align: center;
        }
        
        .welcome-text {
            font-size: 18px;
            line-height: 1.8;
            color: #1a1a1a;
            margin-bottom: 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .info-section {
            background: white;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid rgba(102, 126, 234, 0.1);
            margin: 20px 0;
        }
        
        .info-title {
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .info-title::before {
            content: "📋";
            margin-right: 10px;
            font-size: 20px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(102, 126, 234, 0.1);
            position: relative;
            padding-left: 25px;
        }
        
        .info-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .footer {
            background: #f8f9ff;
            padding: 30px;
            text-align: center;
            border-top: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .footer-text {
            font-size: 14px;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .footer-contact {
            font-size: 12px;
            color: #999;
        }
        
        .note-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .welcome-section {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NION EVENTS</div>
            <div class="tagline">Event Management & Production</div>
        </div>
        
        <div class="content">
            <h1 class="title">🎉 Willkommen im Team!</h1>
            
            <div class="welcome-section">
                <div class="welcome-text">
                    Hallo!<br><br>
                    
                    <strong>${inviterName}</strong> hat Sie als neuen Mitarbeiter zu NION Events eingeladen! 
                    Wir freuen uns sehr, Sie in unserem Team begrüßen zu dürfen.
                </div>
                
                <a href="${registrationUrl}" class="cta-button">
                    🚀 Jetzt registrieren
                </a>
            </div>
            
            <div class="info-section">
                <div class="info-title">Was Sie als nächstes tun müssen</div>
                <ul class="info-list">
                    <li>Klicken Sie auf den Registrierungs-Button oben</li>
                    <li>Erstellen Sie Ihr Passwort für den Account</li>
                    <li>Vervollständigen Sie Ihre Personalangaben</li>
                    <li>Laden Sie Ihre Dokumente hoch</li>
                </ul>
            </div>
            
            <div class="info-section">
                <div class="info-title">Ihr Zugang zum System</div>
                <p>Mit Ihrem Account erhalten Sie Zugang zu:</p>
                <ul class="info-list">
                    <li>Ihren persönlichen Daten und Dokumenten</li>
                    <li>Aktuellen Event-Informationen</li>
                    <li>Internen Kommunikationstools</li>
                    <li>Schichtplänen und Terminen</li>
                </ul>
            </div>
            
            <div class="note-box">
                <strong>Wichtiger Hinweis:</strong> Diese Einladung ist 7 Tage gültig. 
                Bitte registrieren Sie sich zeitnah, um Ihren Zugang nicht zu verlieren.
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Sie haben Fragen? Kontaktieren Sie uns gerne!
            </div>
            <div class="footer-contact">
                NION Events • info@nion-events.de • +49 1575 2046096
            </div>
        </div>
    </div>
</body>
</html>`
            }} 
          />
        </div>

        {/* Action Button */}
        <div className="text-center mt-8">
          <a 
            href={registrationUrl}
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors shadow-lg"
          >
            🚀 Zur Registrierung
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;