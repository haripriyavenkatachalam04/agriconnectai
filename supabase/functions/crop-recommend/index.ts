import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { soilType, weather, cropHistory, region } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are AgriConnect AI, an expert agricultural advisor for Tamil Nadu, India. 
Given farmer inputs about soil type, weather conditions, crop history, and region, provide personalized crop recommendations.

For each recommended crop, provide:
- Crop name
- Suitability score (1-10)
- Reason why it's suitable
- Expected yield per acre
- Best planting window
- Key care tips

Keep recommendations practical and region-specific to Tamil Nadu. Recommend 3-5 crops. Format your response as JSON using the tool provided.`;

    const userPrompt = `Farmer details:
- Soil Type: ${soilType}
- Current Weather: ${weather}
- Previous Crops Grown: ${cropHistory}
- Region: ${region || "Tamil Nadu (general)"}

Please recommend the best crops for this farmer.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_crops",
              description: "Return crop recommendations for the farmer",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        crop: { type: "string" },
                        score: { type: "number" },
                        reason: { type: "string" },
                        expectedYield: { type: "string" },
                        plantingWindow: { type: "string" },
                        careTips: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                      required: ["crop", "score", "reason", "expectedYield", "plantingWindow", "careTips"],
                      additionalProperties: false,
                    },
                  },
                  summary: { type: "string" },
                },
                required: ["recommendations", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_crops" } },
      }),
    });

    if (!response.ok) {
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
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: return raw content
    const content = data.choices?.[0]?.message?.content || "No recommendations available";
    return new Response(JSON.stringify({ summary: content, recommendations: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("crop-recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
