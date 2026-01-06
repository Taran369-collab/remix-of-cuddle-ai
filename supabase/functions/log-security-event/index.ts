import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client for inserting
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header if present
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;
    
    if (authHeader) {
      const supabaseAnon = createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabaseAnon.auth.getUser();
      userId = user?.id || null;
      userEmail = user?.email || null;
    }

    const body = await req.json();
    const { action, success, details, page_path } = body;

    // Validate required fields
    if (!action || typeof action !== "string") {
      return new Response(
        JSON.stringify({ error: "action is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user agent and IP from request headers (server-side, can't be spoofed)
    const userAgent = req.headers.get("user-agent") || null;
    
    // Get IP address from various headers (Cloudflare, etc.)
    const ipAddress = req.headers.get("cf-connecting-ip") || 
                      req.headers.get("x-real-ip") || 
                      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                      null;

    // Sanitize details - only accept object
    let sanitizedDetails: Record<string, unknown> | null = null;
    if (details && typeof details === "object" && !Array.isArray(details)) {
      // Limit the size of details
      const detailsStr = JSON.stringify(details);
      if (detailsStr.length <= 10000) {
        sanitizedDetails = details;
      }
    }

    // Insert security log using service role (bypasses RLS)
    const { error } = await supabaseAdmin.from("security_logs").insert({
      user_id: userId,
      user_email: userEmail,
      action: action.slice(0, 100), // Limit action length
      success: Boolean(success),
      details: sanitizedDetails,
      page_path: page_path ? String(page_path).slice(0, 500) : null,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    if (error) {
      console.error("Error inserting security log:", error);
      return new Response(
        JSON.stringify({ error: "Failed to log security event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in log-security-event:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
