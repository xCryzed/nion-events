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
        // Get client IP address
        const clientIP = req.headers.get('x-forwarded-for') || 
                        req.headers.get('x-real-ip') || 
                        '127.0.0.1';

        console.log("Processing event request from IP:", clientIP);

        // Check rate limiting - max 2 requests per hour for event request form
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        // Get existing rate limit record
        const { data: existingRecords, error: selectError } = await supabase
            .from('rate_limit_requests')
            .select('*')
            .eq('ip_address', clientIP)
            .eq('request_type', 'event_request')
            .gte('window_start', oneHourAgo)
            .order('window_start', { ascending: false })
            .limit(1);

        if (selectError) {
            console.error("Error checking rate limit:", selectError);
        }

        let currentCount = 0;
        let recordId: string | null = null;

        if (existingRecords && existingRecords.length > 0) {
            const record = existingRecords[0];
            currentCount = record.request_count;
            recordId = record.id;
            
            // Check if rate limit exceeded
            if (currentCount >= 2) {
                console.log(`Rate limit exceeded for IP ${clientIP}: ${currentCount} requests in the last hour`);
                return new Response(
                    JSON.stringify({ 
                        error: "Rate limit exceeded", 
                        message: "Zu viele Angebotsanfragen. Bitte versuchen Sie es in einer Stunde erneut.",
                        nextAllowedTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
                    }), 
                    {
                        status: 429,
                        headers: { 
                            "Content-Type": "application/json", 
                            "Retry-After": "3600",
                            ...corsHeaders 
                        },
                    }
                );
            }
        }

        // Update or create rate limit record
        if (recordId) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('rate_limit_requests')
                .update({ request_count: currentCount + 1, updated_at: new Date().toISOString() })
                .eq('id', recordId);
                
            if (updateError) {
                console.error("Error updating rate limit:", updateError);
            }
        } else {
            // Create new record
            const { error: insertError } = await supabase
                .from('rate_limit_requests')
                .insert({
                    ip_address: clientIP,
                    request_type: 'event_request',
                    request_count: 1,
                    window_start: new Date().toISOString()
                });
                
            if (insertError) {
                console.error("Error creating rate limit record:", insertError);
            }
        }

        const offerRequest: OfferRequest = await req.json();

        console.log("Processing offer notification:", offerRequest);

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

        // Create HTML email template
        const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neue Angebotsanfrage - NION Events</title>
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
            max-width: 700px;
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
        
        .priority-badge {
            background: #ef4444;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
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
            <h1 class="title">🎯 Neue Angebotsanfrage eingegangen!</h1>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <span class="timestamp">📅 ${formatDateTime(offerRequest.created_at)}</span>
                <br><br>
                <span class="offer-number">📄 Angebotsnummer: ${offerRequest.offer_number}</span>
                <br><br>
                <span class="priority-badge">⚡ PRIORITÄT HOCH - 24h Response</span>
            </div>
            
            <div class="section">
                <h2 class="section-title">Event-Details</h2>
                <div class="info-grid">
                    <div class="info-item full-width">
                        <div class="info-label">Veranstaltungstitel</div>
                        <div class="info-value">${offerRequest.event_title}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Startdatum</div>
                        <div class="info-value">${formatDate(offerRequest.event_date)}</div>
                    </div>
                    ${offerRequest.end_date ? `
                    <div class="info-item">
                        <div class="info-label">Enddatum</div>
                        <div class="info-value">${formatDate(offerRequest.end_date)}</div>
                    </div>
                    ` : ''}
                    <div class="info-item ${!offerRequest.end_date ? 'full-width' : ''}">
                        <div class="info-label">Veranstaltungsort</div>
                        <div class="info-value">${offerRequest.location}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Erwartete Gästeanzahl</div>
                        <div class="info-value">${offerRequest.guest_count}</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">Technische Anforderungen</h2>
                <div class="info-item">
                    <div class="info-label">Gewünschte Veranstaltungstechnik</div>
                    <div class="service-list">
                        ${offerRequest.tech_requirements.map(tech => 
                            `<span class="service-item">${formatTechRequirements([tech])}</span>`
                        ).join('')}
                    </div>
                </div>
                
                ${offerRequest.dj_genres && offerRequest.dj_genres.length > 0 ? `
                <div class="info-item" style="margin-top: 15px;">
                    <div class="info-label">DJ Musik-Genres</div>
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
            </div>
            
            <div class="section">
                <h2 class="section-title">Kontaktdaten</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Name</div>
                        <div class="info-value">${offerRequest.contact_name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">E-Mail</div>
                        <div class="info-value">${offerRequest.contact_email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Telefon</div>
                        <div class="info-value">${offerRequest.contact_phone}</div>
                    </div>
                    ${offerRequest.contact_company ? `
                    <div class="info-item">
                        <div class="info-label">Unternehmen</div>
                        <div class="info-value">${offerRequest.contact_company}</div>
                    </div>
                    ` : ''}
                    <div class="info-item full-width">
                        <div class="info-label">Adresse</div>
                        <div class="info-value">
                            ${offerRequest.contact_street} ${offerRequest.contact_house_number}<br>
                            ${offerRequest.contact_postal_code} ${offerRequest.contact_city}
                        </div>
                    </div>
                </div>
            </div>
            
            ${offerRequest.additional_wishes ? `
            <div class="section">
                <h2 class="section-title">Zusätzliche Wünsche</h2>
                <div class="message-box">
                    <div class="message-text">${offerRequest.additional_wishes}</div>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Diese E-Mail wurde automatisch über das Angebotsformular auf nion-events.de gesendet.
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
            to: ["info@nion-events.de"],
            subject: `🎯 Neue Angebotsanfrage: ${offerRequest.event_title} | ${offerRequest.offer_number}`,
            html: htmlContent,
        });

        console.log("Offer notification email sent successfully:", emailResponse);

        return new Response(JSON.stringify({ success: true, emailResponse }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
            },
        });
    } catch (error: any) {
        console.error("Error in send-offer-notification function:", error);
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