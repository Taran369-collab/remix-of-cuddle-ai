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
    
    if (authHeader) {
      const supabaseAnon = createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabaseAnon.auth.getUser();
      userId = user?.id || null;
    }

    const body = await req.json();
    const { page_path, session_id, referrer } = body;

    // Validate required fields
    if (!page_path || typeof page_path !== "string") {
      return new Response(
        JSON.stringify({ error: "page_path is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate session_id format (should be a UUID)
    if (session_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid session_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user agent from request headers (server-side, can't be spoofed by client)
    const userAgent = req.headers.get("user-agent") || null;

    // Sanitize referrer - only accept valid URLs
    let sanitizedReferrer: string | null = null;
    if (referrer && typeof referrer === "string") {
      try {
        new URL(referrer);
        sanitizedReferrer = referrer.slice(0, 2000); // Limit length
      } catch {
        // Invalid URL, ignore
      }
    }

    // Insert page view using service role (bypasses RLS)
    const { error } = await supabaseAdmin.from("page_views").insert({
      page_path: page_path.slice(0, 500), // Limit path length
      user_agent: userAgent,
      referrer: sanitizedReferrer,
      session_id: session_id || null,
      user_id: userId,
    });

    if (error) {
      console.error("Error inserting page view:", error);
      return new Response(
        JSON.stringify({ error: "Failed to track page view" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in track-page-view:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
