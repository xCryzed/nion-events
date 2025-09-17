// @ts-expect-error - Deno imports are not recognized by TypeScript in the main project
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error - npm imports are valid in Deno runtime
import { Resend } from "npm:resend@2.0.0";
// @ts-expect-error - Supabase imports are valid in Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-expect-error - Deno global is available in Deno runtime
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
// @ts-expect-error - Deno global is available in Deno runtime
const supabaseUrl = Deno.env.get('SUPABASE_URL');
// @ts-expect-error - Deno global is available in Deno runtime
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviterName }: InvitationRequest = await req.json();

    console.log("Processing employee invitation for:", email);

    // Get the invitation token from the database
    const { data, error: invitationError } = await supabase
      .from('employee_invitations')
      .select('invitation_token')
      .eq('email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (invitationError || !data || data.length === 0) {
      throw new Error('Invitation not found');
    }

    const invitation = data[0];

    // Create registration URL with invitation token
    // @ts-expect-error - Deno global is available in Deno runtime
    const siteUrl = Deno.env.get('SITE_URL') || 'https://nion-events.de';
    const registrationUrl = `${supabaseUrl}/auth/v1/signup?redirect_to=${encodeURIComponent(`${siteUrl}/auth?invitation=${invitation.invitation_token}`)}`;

    // Create HTML email template matching the design
    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Willkommen bei NION Events</title>
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
</html>`;

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "NION Events <info@nion-events.de>",
      to: [email],
      subject: "🎉 Willkommen bei NION Events - Ihr Account wartet auf Sie!",
      html: htmlContent,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-employee-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);