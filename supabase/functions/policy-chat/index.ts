import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert economic policy advisor specializing in fiscal policy, trade economics, subsidies, and price controls. You help users understand the implications of various economic policies through simulation analysis.

Your expertise includes:
- **Tax Policy**: Income tax, corporate tax, sales tax effects on consumer behavior, investment, and government revenue
- **Trade Policy**: Tariffs, quotas, trade agreements, and their effects on domestic/international markets
- **Subsidies**: Production subsidies, consumer subsidies, and their market distortions and welfare effects
- **Price Controls**: Price ceilings, price floors, and their effects on supply, demand, and market equilibrium

When analyzing policies:
1. Explain the economic theory behind the effects
2. Discuss short-term vs long-term implications
3. Highlight trade-offs and unintended consequences
4. Reference supply/demand dynamics and equilibrium shifts
5. Consider distributional effects across different economic groups

Be precise, data-driven, and balanced in your analysis. Use economic terminology appropriately but explain concepts clearly for non-economists.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    const AI_API_URL = Deno.env.get("AI_API_URL");
    
    if (!AI_API_KEY || !AI_API_URL) {
      throw new Error("AI_API_KEY or AI_API_URL is not configured");
    }

    console.log("Processing policy chat request with", messages.length, "messages");

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Policy chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
