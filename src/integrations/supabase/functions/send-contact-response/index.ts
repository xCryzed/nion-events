// @ts-expect-error - Deno imports are not recognized by TypeScript in the main project
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error - npm imports are valid in Deno runtime
import { Resend } from "npm:resend@2.0.0";
// @ts-expect-error - ESM import for Deno runtime only
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// @ts-expect-error - Deno global is available in Deno runtime
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
// @ts-expect-error - Deno global is available in Deno runtime
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// @ts-expect-error - Deno global is available in Deno runtime
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactResponseRequest {
  requestId: string;
  responseMessage: string;
  customerName: string;
  customerEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      requestId,
      responseMessage,
      customerName,
      customerEmail,
    }: ContactResponseRequest = await req.json();

    console.log("Sending response email for contact request:", requestId);

    // Update contact request status
    const { error: updateError } = await supabase
      .from("contact_requests")
      .update({
        status: "geantwortet",
        response_message: responseMessage,
        responded_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error updating contact request:", updateError);
      throw new Error("Failed to update contact request");
    }

    // Send response email to customer
    const emailResponse = await resend.emails.send({
      from: "NION Events <info@nion-events.de>",
      to: [customerEmail],
      subject: `Antwort auf Ihre Kontaktanfrage - NION Events (ID: ${requestId})`,
      html: `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Antwort auf Ihre Kontaktanfrage - NION Events</title>
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
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1a1a1a;
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
        
        .response-content {
            background: white;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(102, 126, 234, 0.1);
            font-size: 16px;
            line-height: 1.8;
            color: #1a1a1a;
            white-space: pre-wrap;
        }
        
        .info-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid rgba(102, 126, 234, 0.1);
            margin-bottom: 15px;
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
        
        .request-id {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            display: inline-block;
            margin: 20px 0;
            font-family: monospace;
        }
        
        @media (max-width: 600px) {
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
            <h1 class="title">💬 Antwort auf Ihre Kontaktanfrage</h1>
            
            <div class="greeting">
                Liebe/r ${customerName},
            </div>
            
            <p style="margin-bottom: 20px;">vielen Dank für Ihre Kontaktanfrage. Gerne antworten wir Ihnen wie folgt:</p>
            
            <div class="section">
                <h2 class="section-title">Unsere Antwort</h2>
                <div class="response-content">${responseMessage}</div>
            </div>
            
            <p style="margin-bottom: 20px;">Sollten Sie weitere Fragen haben, können Sie gerne jederzeit auf diese E-Mail antworten oder uns direkt kontaktieren.</p>
            
            <div style="text-align: center;">
                <span class="request-id">📋 Anfrage-ID: ${requestId}</span>
            </div>
            
            <div class="section">
                <h2 class="section-title">Kontakt</h2>
                <div class="info-item">
                    <div class="info-label">E-Mail</div>
                    <div class="info-value">info@nion-events.de</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Telefon</div>
                    <div class="info-value">+49 1575 2046096</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Website</div>
                    <div class="info-value">www.nion-events.de</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                NION Events - Ihr Partner für unvergessliche Veranstaltungen
            </div>
            <div class="footer-contact">
                Diese E-Mail wurde automatisch generiert als Antwort auf Ihre Kontaktanfrage.
            </div>
        </div>
    </div>
</body>
</html>
      `,
    });

    console.log("Response email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Response sent successfully",
        emailId: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  } catch (error: any) {
    console.error("Error in send-contact-response function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send response",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }
};

serve(handler);
