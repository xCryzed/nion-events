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

interface OfferRequest {
    id: string;
    offer_number: string;
    event_title: string;
    event_date: string;
    end_date?: string;
    location: string;
    guest_count: string;
    tech_requirements: string[];
    dj_genres: string[];
    photographer: boolean;
    videographer: boolean;
    light_operator: boolean;
    additional_wishes: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    contact_company?: string;
    contact_street: string;
    contact_house_number: string;
    contact_postal_code: string;
    contact_city: string;
    created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const offerRequest: OfferRequest = await req.json();

        console.log("Processing offer confirmation for:", offerRequest.contact_email);

        // Helper function to format tech requirements
        const formatTechRequirements = (techArray: string[]) => {
            const techLabels: { [key: string]: string } = {
                'sound': 'Soundsystem',
                'licht': 'Lichttechnik', 
                'buehne': 'Bühnentechnik',
                'led': 'LED-Wände',
                'projektion': 'Projektion'
            };
            return techArray.map(tech => techLabels[tech] || tech).join(', ');
        };

        // Format date
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        const formatDateTime = (dateString: string) => {
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

        // Create HTML email template for customer confirmation
        const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Angebotsanfrage erhalten - NION Events</title>
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
        
        .offer-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 30px;
            letter-spacing: 1px;
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
        
        .info-item.full-width {
            grid-column: 1 / -1;
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
        
        .service-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        
        .service-item {
            background: #667eea;
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 14px;
            font-weight: 500;
        }
        
        .service-item.included {
            background: #10b981;
        }
        
        .genre-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 10px;
        }
        
        .genre-item {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 13px;
            border: 1px solid rgba(102, 126, 234, 0.2);
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
        
        .guarantee-box {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        
        .guarantee-box h3 {
            font-size: 20px;
            margin-bottom: 10px;
        }
        
        .guarantee-box p {
            font-size: 16px;
            opacity: 0.9;
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
            
            .service-list, .genre-list {
                justify-content: flex-start;
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
            <h1 class="title">Vielen Dank für Ihre Angebotsanfrage! 🎉</h1>
            <p class="subtitle">Wir erstellen Ihnen ein individuelles Angebot für Ihre Veranstaltung</p>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <span class="timestamp">📅 Eingegangen am ${formatDateTime(offerRequest.created_at)}</span>
                <br><br>
                <span class="offer-number">📄 Ihre Angebotsnummer: ${offerRequest.offer_number}</span>
            </div>
            
            <div class="greeting">
                <p>Hallo ${offerRequest.contact_name},</p>
                <br>
                <p>vielen Dank für Ihr Vertrauen in NION Events! Wir haben Ihre Angebotsanfrage für "<strong>${offerRequest.event_title}</strong>" erhalten und freuen uns sehr auf Ihr Event.</p>
            </div>
            
            <div class="guarantee-box">
                <h3>⚡ 24-Stunden-Garantie</h3>
                <p>Sie erhalten Ihr individuelles Angebot innerhalb der nächsten 24 Stunden per E-Mail</p>
            </div>
            
            <div class="section">
                <h2 class="section-title">Ihre Angebotsanfrage im Überblick</h2>
                <div class="info-grid">
                    <div class="info-item full-width">
                        <div class="info-label">Veranstaltung</div>
                        <div class="info-value">${offerRequest.event_title}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Datum</div>
                        <div class="info-value">${formatDate(offerRequest.event_date)}</div>
                    </div>
                    ${offerRequest.end_date ? `
                    <div class="info-item">
                        <div class="info-label">Bis</div>
                        <div class="info-value">${formatDate(offerRequest.end_date)}</div>
                    </div>
                    ` : ''}
                    <div class="info-item ${!offerRequest.end_date ? 'full-width' : ''}">
                        <div class="info-label">Location</div>
                        <div class="info-value">${offerRequest.location}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Gästeanzahl</div>
                        <div class="info-value">${offerRequest.guest_count}</div>
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Gewünschte Technik</div>
                    <div class="service-list">
                        ${offerRequest.tech_requirements.map(tech => 
                            `<span class="service-item">${formatTechRequirements([tech])}</span>`
                        ).join('')}
                    </div>
                </div>
                
                ${offerRequest.dj_genres && offerRequest.dj_genres.length > 0 ? `
                <div class="info-item" style="margin-top: 15px;">
                    <div class="info-label">Gewünschte Musik-Genres</div>
                    <div class="genre-list">
                        ${offerRequest.dj_genres.map(genre => 
                            `<span class="genre-item">${genre}</span>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${(offerRequest.photographer || offerRequest.videographer || offerRequest.light_operator) ? `
                <div class="info-item" style="margin-top: 15px;">
                    <div class="info-label">Zusätzliche Services</div>
                    <div class="service-list">
                        ${offerRequest.photographer ? '<span class="service-item included">📸 Fotograf</span>' : ''}
                        ${offerRequest.videographer ? '<span class="service-item included">🎥 Videograf</span>' : ''}
                        ${offerRequest.light_operator ? '<span class="service-item included">💡 Lichtoperator</span>' : ''}
                    </div>
                </div>
                ` : ''}
                
                ${offerRequest.additional_wishes ? `
                <div class="message-box" style="margin-top: 15px;">
                    <div class="info-label">Ihre zusätzlichen Wünsche</div>
                    <div class="message-text">${offerRequest.additional_wishes}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="next-steps">
                <h3>Was passiert als nächstes? 🚀</h3>
                <ul>
                    <li>Unser Event-Team analysiert Ihre Anfrage im Detail</li>
                    <li>Wir erstellen ein maßgeschneidertes Angebot für Ihr Event</li>
                    <li>Sie erhalten das Angebot innerhalb von 24 Stunden per E-Mail</li>
                    <li>Bei Bedarf vereinbaren wir einen Termin für ein persönliches Gespräch</li>
                    <li>Wir planen gemeinsam Ihr perfektes Event!</li>
                </ul>
            </div>
            
            <div class="contact-info">
                <h3>Haben Sie Fragen? Wir sind für Sie da!</h3>
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
                    <strong>Bleiben Sie auf dem Laufenden:</strong>
                </p>
                <p style="font-size: 14px; color: #667eea;">
                    Folgen Sie uns für Event-Inspiration und Einblicke hinter die Kulissen unserer neuesten Projekte.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Diese Bestätigung wurde automatisch gesendet. Bei Fragen antworten Sie einfach auf diese E-Mail.
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
            to: [offerRequest.contact_email],
            subject: `Angebot wird erstellt: ${offerRequest.event_title} | ${offerRequest.offer_number} 🎉`,
            html: htmlContent,
        });

        console.log("Offer confirmation email sent successfully:", emailResponse);

        return new Response(JSON.stringify({ success: true, emailResponse }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
            },
        });
    } catch (error: any) {
        console.error("Error in send-offer-confirmation function:", error);
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