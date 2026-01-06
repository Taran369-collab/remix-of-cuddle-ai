import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required. Please sign in to use this feature." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.log("Invalid token or claims error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", claimsData.claims.sub);

    const { recipientName, occasion, tone, interests } = await req.json();

    // Input validation
    if (recipientName && (typeof recipientName !== "string" || recipientName.length > 100)) {
      return new Response(
        JSON.stringify({ error: "Recipient name must be a string under 100 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (interests && (typeof interests !== "string" || interests.length > 500)) {
      return new Response(
        JSON.stringify({ error: "Interests must be a string under 500 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a romantic message writer who creates heartfelt, personalized love messages. 
Your messages should be:
- Genuine and emotionally resonant
- Appropriate for the specified tone and occasion
- Personal and specific when details are provided
- Between 2-4 sentences for short messages, or 4-6 sentences for longer ones
- Never cliché or generic

Always respond with ONLY the love message, no explanations or metadata.`;

    const userPrompt = `Create a romantic love message with these details:
${recipientName ? `- Recipient's name: ${recipientName}` : "- No specific recipient name"}
${occasion ? `- Occasion: ${occasion}` : "- General/everyday message"}
${tone ? `- Tone: ${tone}` : "- Romantic and sweet"}
${interests ? `- Their interests/things they love: ${interests}` : ""}

Generate a heartfelt message now:`;

    console.log("Generating love message for user:", claimsData.claims.sub);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content;

    if (!message) {
      throw new Error("No message generated");
    }

    console.log("Generated message successfully for user:", claimsData.claims.sub);

    return new Response(
      JSON.stringify({ message: message.trim() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating love message:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate message" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
