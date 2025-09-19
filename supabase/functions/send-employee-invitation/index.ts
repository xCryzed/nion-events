// @ts-expect-error - Deno imports are not recognized by TypeScript in the main project
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error - npm imports are valid in Deno runtime
import { Resend } from "npm:resend@2.0.0";
// @ts-expect-error - Supabase imports are valid in Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize clients from environment
// @ts-expect-error - Deno global is available in Deno runtime
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
// @ts-expect-error - Deno global is available in Deno runtime
const supabaseUrl = Deno.env.get("SUPABASE_URL");
// @ts-expect-error - Deno global is available in Deno runtime
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InvitationPayload {
  email?: string;
  inviterName?: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    // Robust body parsing: accept JSON, urlencoded, or empty body + query params
    const contentType = req.headers.get("content-type") || "";
    let payload: InvitationPayload | null = null;

    let raw = "";
    try {
      raw = await req.text();
      console.log("send-employee-invitation: body read", {
        contentType,
        rawLength: raw ? raw.length : 0,
      });
    } catch (e) {
      console.warn("send-employee-invitation: body read error", e);
    }

    if (raw && raw.trim().length > 0) {
      // Try JSON first
      try {
        payload = JSON.parse(raw);
        console.log("send-employee-invitation: parsed JSON body");
      } catch (e) {
        console.warn(
          "send-employee-invitation: JSON parse failed, trying urlencoded",
          e,
        );
        // Try urlencoded
        try {
          const params = new URLSearchParams(raw);
          const emailParam = params.get("email") || undefined;
          const inviterParam = params.get("inviterName") || undefined;
          if (emailParam || inviterParam) {
            payload = { email: emailParam, inviterName: inviterParam };
            console.log("send-employee-invitation: parsed urlencoded body");
          }
        } catch (e2) {
          console.warn("send-employee-invitation: urlencoded parse failed", e2);
        }
      }
    }

    // Fallback: query params
    if (!payload || !payload.email) {
      const url = new URL(req.url);
      const email =
        payload?.email || url.searchParams.get("email") || undefined;
      const inviterName =
        payload?.inviterName ||
        url.searchParams.get("inviterName") ||
        undefined;
      payload = { email, inviterName };
      console.log("send-employee-invitation: using query params fallback");
    }

    const email = (payload?.email || "").toLowerCase().trim();
    const inviterName = payload?.inviterName?.trim() || "Das NION Events Team";

    if (!email) {
      return json({ error: "Email is required" }, 400);
    }

    // Load the most recent pending invitation for this email
    const { data: invitation, error: invitationError } = await supabase
      .from("employee_invitations")
      .select("id, invitation_token, status, expires_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (invitationError || !invitation) {
      console.error("Invitation lookup failed", invitationError);
      return json({ error: "No valid invitation found for this email" }, 404);
    }

    // Validate status and expiry
    const expired =
      invitation.expires_at && new Date(invitation.expires_at) < new Date();
    if (invitation.status !== "pending" || expired) {
      return json(
        { error: "Invitation is not pending or already expired" },
        400,
      );
    }

    // Build registration URL
    const origin =
      req.headers.get("origin") ||
      // @ts-expect-error - Deno env in runtime
      Deno.env.get("PUBLIC_SITE_URL") ||
      "https://nion-events.de";
    const registrationUrl = `${origin}/anmelden?email=${encodeURIComponent(
      email,
    )}&token=${encodeURIComponent(invitation.invitation_token)}`;

    // Build email preview URL
    const emailPreviewUrl = `${origin}/email-preview/${encodeURIComponent(invitation.invitation_token)}`;

    // Format expiry date
    const fmt = (d: string) =>
      new Date(d).toLocaleString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

    // Email template (matches brand style used in other functions)
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
        
        .browser-link {
            text-align: center;
            background: rgba(255, 255, 255, 0.9);
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 8px;
            font-size: 12px;
        }
        
        .browser-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        
        .browser-link a:hover {
            text-decoration: underline;
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
    <div class="browser-link">
        Wird diese E-Mail nicht richtig angezeigt? <a href="${emailPreviewUrl}" target="_blank">Im Browser öffnen</a>
    </div>
    
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

    // Send email
    const emailResponse = await resend.emails.send({
      from: "NION Events <invitation@nion-events.de>",
      to: [email],
      subject: `🎉 Willkommen bei NION Events - Ihr Account wartet auf Sie!`,
      html: htmlContent,
    });

    console.log("Employee invitation email sent successfully:", emailResponse);
    return json({ success: true, invitationId: invitation.id });
  } catch (error: any) {
    console.error("Error in send-employee-invitation function:", error);
    return json({ error: error?.message || "Internal Server Error" }, 500);
  }
});
