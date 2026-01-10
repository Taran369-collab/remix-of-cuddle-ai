import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid event types and payment methods
const VALID_EVENT_TYPES = ['copy_address', 'view_qr', 'page_view'] as const;
const VALID_PAYMENT_METHODS = ['UPI', 'BTC', 'ETH'] as const;

type EventType = typeof VALID_EVENT_TYPES[number];
type PaymentMethod = typeof VALID_PAYMENT_METHODS[number];

interface TrackEventRequest {
  event_type: string;
  payment_method: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    let body: TrackEventRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { event_type, payment_method } = body;

    // Validate event_type
    if (!event_type || typeof event_type !== 'string') {
      return new Response(
        JSON.stringify({ error: 'event_type is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!VALID_EVENT_TYPES.includes(event_type as EventType)) {
      return new Response(
        JSON.stringify({ error: `Invalid event_type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate payment_method
    if (!payment_method || typeof payment_method !== 'string') {
      return new Response(
        JSON.stringify({ error: 'payment_method is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!VALID_PAYMENT_METHODS.includes(payment_method as PaymentMethod)) {
      return new Response(
        JSON.stringify({ error: `Invalid payment_method. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get server-side user agent (cannot be spoofed by client)
    const userAgent = req.headers.get('user-agent') || null;

    // Insert donation event with admin client
    const { error: insertError } = await supabaseAdmin
      .from('donation_events')
      .insert({
        event_type: event_type,
        payment_method: payment_method,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error('Failed to insert donation event:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to track event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Tracked donation event: ${event_type} for ${payment_method}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-donation-event function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
