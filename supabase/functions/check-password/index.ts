import { serve } from "https://deno.land/std@0.192.0/http/server.ts"

// Dynamic CORS based on environment
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [];
  const defaultOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';
  
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return defaultOrigin;
};

const getCorsHeaders = (requestOrigin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(requestOrigin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

async function sha1(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest("SHA-1", data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { password } = await req.json()

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: "Password required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate password length to prevent abuse
    if (password.length > 128) {
      return new Response(
        JSON.stringify({ error: "Password too long" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log("Checking password against HaveIBeenPwned API...")

    const hash = await sha1(password)
    const prefix = hash.slice(0, 5).toUpperCase()
    const suffix = hash.slice(5).toUpperCase()

    const res = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { headers: { "Add-Padding": "true" } }
    )

    if (!res.ok) {
      console.error("HaveIBeenPwned API error:", res.status)
      return new Response(
        JSON.stringify({ error: "Password check service unavailable" }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const leaked = (await res.text()).includes(suffix)
    console.log("Password check complete, leaked:", leaked)

    return new Response(
      JSON.stringify({ leaked }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error checking password:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
