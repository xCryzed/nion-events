import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
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
        const contactRequest: ContactRequest = await req.json();

        console.log("Processing contact request:", contactRequest);

        // Helper function to get readable labels
        const getEventTypeLabel = (eventType: string) => {
            const eventTypes: { [key: string]: string } = {
                'hochzeit': 'Hochzeit',
                'firmenveranstaltung': 'Firmenveranstaltung',
                'konferenz': 'Konferenz',
                'gala': 'Gala-Event',
                'geburtstag': 'Geburtstag',
                'abschlussfeier': 'Abschlussfeier',
                'abiball': 'Abiball',
                'produktpräsentation': 'Produktpräsentation',
                'messe': 'Messe',
                'sonstiges': 'Sonstiges'
            };
            return eventTypes[eventType] || eventType;
        };

        const getCallbackTimeLabel = (callbackTime: string) => {
            const callbackTimes: { [key: string]: string } = {
                'morgens': 'Morgens (08:00 - 12:00 Uhr)',
                'mittags': 'Mittags (12:00 - 15:00 Uhr)',
                'nachmittags': 'Nachmittags (15:00 - 18:00 Uhr)',
                'abends': 'Abends (18:00 - 20:00 Uhr)',
                'wochenende': 'Am Wochenende',
                'flexibel': 'Flexibel'
            };
            return callbackTimes[callbackTime] || callbackTime;
        };

        // Format date
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        // Create HTML email template
        const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neue Kontaktanfrage - NION Events</title>
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
            content: "●";
            color: #667eea;
            margin-right: 10px;
            font-size: 20px;
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
            <h1 class="title">🎉 Neue Kontaktanfrage eingegangen!</h1>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <span class="timestamp">📅 ${formatDate(contactRequest.created_at)}</span>
            </div>
            
            <div class="section">
                <h2 class="section-title">Kontaktdaten</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Name</div>
                        <div class="info-value">${contactRequest.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">E-Mail</div>
                        <div class="info-value">${contactRequest.email}</div>
                    </div>
                    ${contactRequest.phone ? `
                    <div class="info-item">
                        <div class="info-label">Telefon</div>
                        <div class="info-value">${contactRequest.phone}</div>
                    </div>
                    ` : ''}
                    ${contactRequest.mobile ? `
                    <div class="info-item">
                        <div class="info-label">Mobil</div>
                        <div class="info-value">${contactRequest.mobile}</div>
                    </div>
                    ` : ''}
                    ${contactRequest.company ? `
                    <div class="info-item">
                        <div class="info-label">Unternehmen</div>
                        <div class="info-value">${contactRequest.company}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${contactRequest.event_type || contactRequest.callback_time || contactRequest.venue ? `
            <div class="section">
                <h2 class="section-title">Event-Details</h2>
                <div class="info-grid">
                    ${contactRequest.event_type ? `
                    <div class="info-item">
                        <div class="info-label">Veranstaltungsart</div>
                        <div class="info-value">${getEventTypeLabel(contactRequest.event_type)}</div>
                    </div>
                    ` : ''}
                    ${contactRequest.callback_time ? `
                    <div class="info-item">
                        <div class="info-label">Gewünschte Rückrufzeit</div>
                        <div class="info-value">${getCallbackTimeLabel(contactRequest.callback_time)}</div>
                    </div>
                    ` : ''}
                    ${contactRequest.venue ? `
                    <div class="info-item" style="grid-column: 1 / -1;">
                        <div class="info-label">Veranstaltungsort</div>
                        <div class="info-value">${contactRequest.venue}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <h2 class="section-title">Nachricht</h2>
                <div class="message-box">
                    <div class="message-text">${contactRequest.message}</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Diese E-Mail wurde automatisch über das Kontaktformular auf nion-events.de gesendet.
            </div>
            <div class="footer-contact">
                NION Events • info@nion-events.de • +49 1575 2046096
            </div>
        </div>
    </div>
</body>
</html>`;

        // Send email notification
        const emailResponse = await resend.emails.send({
            from: "NION Events <info@nion-events.de>",
            to: ["info@nion-events.de"], // Your notification email
            subject: `🎉 Neue Kontaktanfrage von ${contactRequest.name}`,
            html: htmlContent,
        });

        console.log("Email sent successfully:", emailResponse);

        return new Response(JSON.stringify({ success: true, emailResponse }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
            },
        });
    } catch (error: any) {
        console.error("Error in send-contact-notification function:", error);
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