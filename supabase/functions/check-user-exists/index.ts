// @ts-expect-error - Deno imports are not recognized by TypeScript in the main project
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error - Supabase imports are valid in Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // First check if the calling user is an administrator
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Check if user has administrator role
    const { data: hasAdminRole, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'administrator' });

    if (roleError) {
      console.error("Error checking user role:", roleError);
      return json({ error: "Failed to verify permissions" }, 500);
    }

    if (!hasAdminRole) {
      return json({ error: "Insufficient permissions" }, 403);
    }

    const { email } = await req.json();

    if (!email) {
      return json({ error: "Email is required" }, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error checking auth users:", authError);
      return json({ error: "Failed to check user existence" }, 500);
    }

    const userExists = authUsers.users.some(user => 
      user.email?.toLowerCase() === normalizedEmail
    );

    if (userExists) {
      return json({ 
        exists: true, 
        message: "Ein Benutzer mit dieser E-Mail-Adresse ist bereits registriert." 
      });
    }

    // Also check for pending invitations
    const { data: invitation, error: invitationError } = await supabase
      .from("employee_invitations")
      .select("id, status, expires_at")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (invitationError) {
      console.error("Error checking invitations:", invitationError);
      return json({ error: "Failed to check invitations" }, 500);
    }

    if (invitation) {
      if (invitation.status === "accepted") {
        return json({ 
          exists: true, 
          message: "Ein Benutzer mit dieser E-Mail-Adresse ist bereits als Mitarbeiter registriert." 
        });
      } else if (invitation.status === "pending") {
        const expiresAt = new Date(invitation.expires_at);
        if (expiresAt > new Date()) {
          return json({ 
            exists: true, 
            message: "Für diese E-Mail-Adresse existiert bereits eine ausstehende Einladung." 
          });
        }
      }
    }

    return json({ exists: false });
  } catch (error: any) {
    console.error("Error in check-user-exists function:", error);
    return json({ error: error?.message || "Internal Server Error" }, 500);
  }
});