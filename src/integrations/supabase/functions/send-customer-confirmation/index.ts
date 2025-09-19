// @ts-expect-error - Deno imports are not recognized by TypeScript in the main project
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error - npm imports are valid in Deno runtime
import { Resend } from "npm:resend@2.0.0";

// @ts-expect-error - Deno global is available in Deno runtime
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CustomerConfirmationRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  company?: string;
  event_type?: string;
  callback_time?: string;
  venue?: string;
  message: string;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const customerRequest: CustomerConfirmationRequest = await req.json();

    console.log("Processing customer confirmation for:", customerRequest.email);

    // Helper function to get readable labels
    const getEventTypeLabel = (eventType: string) => {
      const eventTypes: { [key: string]: string } = {
        hochzeit: "Hochzeit",
        firmenveranstaltung: "Firmenveranstaltung",
        konferenz: "Konferenz",
        gala: "Gala-Event",
        geburtstag: "Geburtstag",
        abschlussfeier: "Abschlussfeier",
        abiball: "Abiball",
        produktpräsentation: "Produktpräsentation",
        messe: "Messe",
        sonstiges: "Sonstiges",
      };
      return eventTypes[eventType] || eventType;
    };

    const getCallbackTimeLabel = (callbackTime: string) => {
      const callbackTimes: { [key: string]: string } = {
        morgens: "Morgens (08:00 - 12:00 Uhr)",
        mittags: "Mittags (12:00 - 15:00 Uhr)",
        nachmittags: "Nachmittags (15:00 - 18:00 Uhr)",
        abends: "Abends (18:00 - 20:00 Uhr)",
        wochenende: "Am Wochenende",
        flexibel: "Flexibel",
      };
      return callbackTimes[callbackTime] || callbackTime;
    };

    // Format date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Create HTML email template for customer confirmation
    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vielen Dank für Ihre Anfrage - NION Events</title>
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
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .subtitle {
            font-size: 18px;
            color: #667eea;
            text-align: center;
            margin-bottom: 30px;
            font-weight: 500;
        }
        
        .greeting {
            font-size: 16px;
            color: #1a1a1a;
            margin-bottom: 25px;
            line-height: 1.8;
        }
        
        .section {
            margin-bottom: 30px;
            background: rgba(102, 126, 234, 0.05);
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid #667eea;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .section-title::before {
            content: "✓";
            color: #667eea;
            margin-right: 10px;
            font-size: 18px;
            font-weight: bold;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .info-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .info-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #667eea;
            font-weight: 600;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-size: 16px;
            color: #1a1a1a;
            font-weight: 500;
        }
        
        .message-box {
            background: white;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(102, 126, 234, 0.1);
            margin-top: 15px;
        }
        
        .message-text {
            font-size: 16px;
            line-height: 1.8;
            color: #1a1a1a;
            white-space: pre-wrap;
        }
        
        .next-steps {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid rgba(102, 126, 234, 0.2);
        }
        
        .next-steps h3 {
            color: #667eea;
            font-size: 20px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .next-steps ul {
            list-style: none;
            padding-left: 0;
        }
        
        .next-steps li {
            padding: 8px 0;
            padding-left: 25px;
            position: relative;
            color: #1a1a1a;
            font-size: 16px;
        }
        
        .next-steps li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
        }
        
        .contact-info {
            background: #f8f9ff;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
        }
        
        .contact-info h3 {
            color: #667eea;
            font-size: 18px;
            margin-bottom: 15px;
        }
        
        .contact-details {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
        }
        
        .contact-item {
            text-align: center;
        }
        
        .contact-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #667eea;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .contact-value {
            font-size: 16px;
            color: #1a1a1a;
            font-weight: 500;
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
        
        .timestamp {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            display: inline-block;
            margin-bottom: 20px;
        }
        
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .contact-details {
                flex-direction: column;
                gap: 15px;
            }
            
            .container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .header, .content, .footer {
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
            <h1 class="title">Vielen Dank für Ihre Anfrage! 🎉</h1>
            <p class="subtitle">Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <span class="timestamp">📅 Eingegangen am ${formatDate(customerRequest.created_at)}</span>
            </div>
            
            <div class="greeting">
                <p>Hallo ${customerRequest.name},</p>
                <br>
                <p>vielen Dank für Ihr Interesse an NION Events! Wir freuen uns sehr über Ihre Anfrage und möchten Ihnen versichern, dass wir uns innerhalb der nächsten <strong>24 Stunden</strong> bei Ihnen melden werden.</p>
            </div>
            
            <div class="section">
                <h2 class="section-title">Ihre Anfrage im Überblick</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Name</div>
                        <div class="info-value">${customerRequest.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">E-Mail</div>
                        <div class="info-value">${customerRequest.email}</div>
                    </div>
                    ${
                      customerRequest.phone
                        ? `
                    <div class="info-item">
                        <div class="info-label">Telefon</div>
                        <div class="info-value">${customerRequest.phone}</div>
                    </div>
                    `
                        : ""
                    }
                    ${
                      customerRequest.company
                        ? `
                    <div class="info-item">
                        <div class="info-label">Unternehmen</div>
                        <div class="info-value">${customerRequest.company}</div>
                    </div>
                    `
                        : ""
                    }
                    ${
                      customerRequest.event_type
                        ? `
                    <div class="info-item">
                        <div class="info-label">Veranstaltungsart</div>
                        <div class="info-value">${getEventTypeLabel(customerRequest.event_type)}</div>
                    </div>
                    `
                        : ""
                    }
                    ${
                      customerRequest.callback_time
                        ? `
                    <div class="info-item">
                        <div class="info-label">Gewünschte Rückrufzeit</div>
                        <div class="info-value">${getCallbackTimeLabel(customerRequest.callback_time)}</div>
                    </div>
                    `
                        : ""
                    }
                </div>
                
                ${
                  customerRequest.venue
                    ? `
                <div class="info-item" style="margin-bottom: 15px;">
                    <div class="info-label">Veranstaltungsort</div>
                    <div class="info-value">${customerRequest.venue}</div>
                </div>
                `
                    : ""
                }
                
                <div class="message-box">
                    <div class="info-label">Ihre Nachricht</div>
                    <div class="message-text">${customerRequest.message}</div>
                </div>
            </div>
            
            <div class="next-steps">
                <h3>Was passiert als nächstes? 🚀</h3>
                <ul>
                    <li>Wir prüfen Ihre Anfrage im Detail</li>
                    <li>Ein Eventplaner meldet sich innerhalb von 24 Stunden bei Ihnen</li>
                    <li>Wir besprechen Ihre Wünsche und erstellen ein individuelles Angebot</li>
                    <li>Bei Bedarf vereinbaren wir einen Termin für ein persönliches Gespräch</li>
                </ul>
            </div>
            
            <div class="contact-info">
                <h3>Sie haben noch Fragen? Wir sind für Sie da!</h3>
                <div class="contact-details">
                    <div class="contact-item">
                        <div class="contact-label">Telefon</div>
                        <div class="contact-value">+49 1575 2046096</div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-label">E-Mail</div>
                        <div class="contact-value">info@nion-events.de</div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-label">Website</div>
                        <div class="contact-value">nion-events.de</div>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: rgba(102, 126, 234, 0.05); border-radius: 12px;">
                <p style="font-size: 16px; color: #1a1a1a; margin-bottom: 10px;">
                    <strong>Folgen Sie uns für Inspiration und Updates:</strong>
                </p>
                <p style="font-size: 14px; color: #667eea;">
                    Entdecken Sie unsere neuesten Events und bekommen Sie Einblicke hinter die Kulissen auf unserer Website und in den sozialen Medien.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Diese Bestätigung wurde automatisch gesendet. Bitte antworten Sie nicht auf diese E-Mail.
            </div>
            <div class="footer-contact">
                NION Events • Event Management & Production<br>
                info@nion-events.de • +49 1575 2046096 • nion-events.de
            </div>
        </div>
    </div>
</body>
</html>`;

    // Send customer confirmation email
    const emailResponse = await resend.emails.send({
      from: "NION Events <info@nion-events.de>",
      to: [customerRequest.email],
      subject: `Vielen Dank für Ihre Anfrage, ${customerRequest.name}! 🎉 (Referenz: ${customerRequest.id})`,
      html: htmlContent,
    });

    console.log(
      "Customer confirmation email sent successfully:",
      emailResponse,
    );

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-customer-confirmation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
