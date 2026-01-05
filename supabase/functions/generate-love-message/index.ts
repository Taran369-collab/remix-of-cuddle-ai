import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientName, occasion, tone, interests } = await req.json();
    
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

    console.log("Generating love message with prompt:", userPrompt);

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

    console.log("Generated message successfully");

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
