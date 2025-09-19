// @ts-expect-error - Deno imports are not recognized by TypeScript in the main project
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error - Supabase imports are valid in Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// @ts-expect-error - Deno global is available in Deno runtime
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// @ts-expect-error - Deno global is available in Deno runtime
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function createScopedClient(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  // @ts-expect-error - Deno global is available in Deno runtime
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  return createClient(SUPABASE_URL, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
}

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

const BUCKET = "app-config";
const CONFIG_PATH = "registration.json";

async function readRegistrationEnabled(): Promise<boolean> {
  const { data } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(CONFIG_PATH);
  if (!data) {
    return true; // default enabled if not configured
  }
  try {
    const text = await data.text();
    const parsed = JSON.parse(text);
    return Boolean(parsed?.enabled);
  } catch {
    return true;
  }
}

async function writeRegistrationEnabled(enabled: boolean) {
  const payload = JSON.stringify({
    enabled,
    updated_at: new Date().toISOString(),
  });
  const blob = new Blob([payload], { type: "application/json" });
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(CONFIG_PATH, blob, {
      upsert: true,
      contentType: "application/json",
    });
  if (error) throw error;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const { action, enabled } = await req
      .json()
      .catch(() => ({ action: undefined }));

    if (action === "get") {
      const current = await readRegistrationEnabled();
      return json({ enabled: current });
    }

    if (action === "set") {
      const scoped = createScopedClient(req);
      const { data: userData } = await scoped.auth.getUser();
      if (!userData?.user) {
        return json({ error: "Unauthorized" }, 401);
      }

      const { data: isAdmin, error: roleErr } = await scoped.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "administrator",
      });
      if (roleErr) {
        console.error("Error checking role:", roleErr);
        return json({ error: "Failed to verify permissions" }, 500);
      }
      if (!isAdmin) {
        return json({ error: "Insufficient permissions" }, 403);
      }

      if (typeof enabled !== "boolean") {
        return json({ error: "'enabled' must be a boolean" }, 400);
      }

      await writeRegistrationEnabled(enabled);
      return json({ enabled });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (err: any) {
    console.error("registration-status error:", err);
    return json({ error: err?.message || "Internal Server Error" }, 500);
  }
});
