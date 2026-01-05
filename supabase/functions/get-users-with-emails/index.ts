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
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify they're authenticated
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the requesting user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin using service role client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all auth users (admin only)
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();

    if (usersError) {
      throw usersError;
    }

    // Fetch profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      throw profilesError;
    }

    // Fetch admin roles
    const { data: adminRoles, error: rolesError2 } = await adminClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError2) {
      throw rolesError2;
    }

    const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);
    const userEmailMap = new Map(users?.map(u => [u.id, u.email]) || []);

    // Combine data - email comes from auth.users, not profiles
    const usersWithEmails = (profiles || []).map(profile => ({
      ...profile,
      email: userEmailMap.get(profile.user_id) || null,
      is_admin: adminUserIds.has(profile.user_id),
    }));

    return new Response(
      JSON.stringify({ users: usersWithEmails }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});