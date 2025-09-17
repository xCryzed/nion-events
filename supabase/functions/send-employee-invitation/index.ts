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
        console.warn("send-employee-invitation: JSON parse failed, trying urlencoded", e);
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
      const email = payload?.email || url.searchParams.get("email") || undefined;
      const inviterName =
        payload?.inviterName || url.searchParams.get("inviterName") || undefined;
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
      return json(
        { error: "No valid invitation found for this email" },
        404,
      );
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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Einladung zu NION Events</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6; color: #1a1a1a;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,.95); backdrop-filter: blur(10px); border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,.1); overflow: hidden; }
    .header { background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); padding: 40px 30px; text-align:center; color:#fff; }
    .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; letter-spacing: 2px; }
    .tagline { font-size: 16px; opacity: .9; font-weight: 300; }
    .content { padding: 40px 30px; }
    .title { font-size: 28px; font-weight: bold; color: #1a1a1a; margin-bottom: 20px; text-align: center; }
    .greeting { font-size: 16px; color: #1a1a1a; margin-bottom: 25px; line-height: 1.8; }
    .cta-section { text-align: center; margin: 30px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#fff; text-decoration:none; padding: 18px 40px; border-radius: 30px; font-weight: 600; font-size: 18px; margin: 20px 0; transition: transform .2s ease, box-shadow .2s ease; }
    .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102,126,234,.3); }
    .steps-section { background: rgba(102,126,234,.05); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #667eea; }
    .steps-section h3 { color: #667eea; font-size: 20px; margin-bottom: 15px; font-weight: 600; }
    .steps-section ol { padding-left: 20px; margin-bottom: 0; }
    .steps-section li { padding: 5px 0; color: #1a1a1a; font-size: 16px; }
    .access-section { background: rgba(102,126,234,.05); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #667eea; }
    .access-section h3 { color: #667eea; font-size: 20px; margin-bottom: 15px; font-weight: 600; }
    .access-section ul { list-style: none; padding-left: 0; }
    .access-section li { padding: 8px 0; padding-left: 25px; position: relative; color: #1a1a1a; font-size: 16px; }
    .access-section li::before { content: "•"; position: absolute; left: 0; color: #667eea; font-weight: bold; font-size: 18px; }
    .warning-notice { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0; color: #856404; text-align: center; }
    .warning-notice strong { display: block; margin-bottom: 10px; font-size: 16px; }
    .footer { background: #f8f9ff; padding: 30px; text-align: center; border-top: 1px solid rgba(102,126,234,.1); }
    .footer-text { font-size: 14px; color: #667eea; margin-bottom: 15px; }
    .footer-contact { font-size: 14px; color: #1a1a1a; font-weight: 500; }
    @media (max-width: 600px) { .container { margin: 10px; border-radius: 15px; } .header, .content, .footer { padding: 20px; } .cta-button { padding: 15px 30px; font-size: 16px; } }
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

      <div class="greeting">
        <p><strong>Hallo!</strong></p>
        <br />
        <p><strong>${inviterName}</strong> hat Sie als neuen Mitarbeiter zu NION Events eingeladen! Wir freuen uns sehr, Sie in unserem Team begrüßen zu dürfen.</p>
      </div>

      <div class="cta-section">
        <a href="${registrationUrl}" class="cta-button">🚀 Jetzt registrieren</a>
      </div>

      <div class="steps-section">
        <h3>Was Sie als nächstes tun müssen</h3>
        <ol>
          <li>Klicken Sie auf den Registrierungs-Button oben</li>
          <li>Erstellen Sie Ihr Passwort für den Account</li>
          <li>Vervollständigen Sie Ihre Personalangaben</li>
          <li>Laden Sie Ihre Dokumente hoch</li>
        </ol>
      </div>

      <div class="access-section">
        <h3>Ihr Zugang zum System</h3>
        <p style="margin-bottom: 15px; color: #1a1a1a;">Mit Ihrem Account erhalten Sie Zugang zu:</p>
        <ul>
          <li>Ihren persönlichen Daten und Dokumenten</li>
          <li>Aktuellen Event-Informationen</li>
          <li>Internen Kommunikationstools</li>
          <li>Schichtplänen und Terminen</li>
        </ul>
      </div>

      <div class="warning-notice">
        <strong>Wichtiger Hinweis:</strong>
        <p>Diese Einladung ist 7 Tage gültig. Bitte registrieren Sie sich zeitnah, um Ihren Zugang nicht zu verlieren.</p>
      </div>

      <div class="footer-text">
        <strong>Sie haben Fragen? Kontaktieren Sie uns gerne!</strong>
      </div>
    </div>

    <div class="footer">
      <div class="footer-contact">
        <strong>NION Events</strong> • info@nion-events.de • +49 1575 2046096
      </div>
    </div>
  </div>
</body>
</html>`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "NION Events <info@nion-events.de>",
      to: [email],
      subject: `Einladung zu NION Events - Willkommen im Team! 🎉`,
      html: htmlContent,
    });

    console.log("Employee invitation email sent successfully:", emailResponse);
    return json({ success: true, invitationId: invitation.id });
  } catch (error: any) {
    console.error("Error in send-employee-invitation function:", error);
    return json({ error: error?.message || "Internal Server Error" }, 500);
  }
});
