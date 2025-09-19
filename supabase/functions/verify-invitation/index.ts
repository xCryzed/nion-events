// @ts-expect-error - Deno imports are not recognized by TypeScript in the main project
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error - Supabase imports are valid in Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client with service role key
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
    const { token, email } = (await req
      .json()
      .catch(() => ({ token: undefined, email: undefined }))) as {
      token?: string;
      email?: string;
    };

    const emailNorm = email ? email.toLowerCase().trim() : null;
    const tokenNorm = (token || "").trim();

    if (!tokenNorm) {
      return json({ error: "Token ist erforderlich" }, 400);
    }

    // Load invitation directly with service role (bypasses RLS)
    let query = supabase
      .from("employee_invitations")
      .select("id, invitation_token, email, status, expires_at, role")
      .eq("invitation_token", tokenNorm)
      .eq("status", "pending");

    // If email is provided, filter by email as well
    if (emailNorm) {
      query = query.eq("email", emailNorm);
    }

    const { data: invitation, error } = await query.single();

    if (error || !invitation) {
      return json(
        { error: "Einladung nicht gefunden oder nicht mehr gültig" },
        404,
      );
    }

    const expired =
      invitation.expires_at && new Date(invitation.expires_at) < new Date();
    if (expired) {
      return json({ error: "Einladung ist abgelaufen" }, 400);
    }

    // Only return essential information for security
    return json({
      valid: true,
      email: invitation.email, // Only return email for form pre-filling
    });
  } catch (e: any) {
    console.error("verify-invitation error", e);
    return json({ error: e?.message || "Internal Server Error" }, 500);
  }
});
