import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert agricultural plant pathologist specializing in crop diseases common in India, particularly Tamil Nadu.

Analyze the provided crop leaf/plant image carefully. Identify:
1. The crop type visible in the image
2. Any diseases present (or confirm the plant is healthy)
3. Confidence score for each finding (0-100)
4. Severity level: Healthy, Mild, Moderate, or Severe
5. Specific treatment recommendations

You MUST respond using the "analyze_crop" tool.

If the image is not a plant/crop image, still use the tool but set is_plant to false.
If the plant appears healthy with no disease, set disease to "Healthy" with appropriate confidence.`;

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
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
              {
                type: "text",
                text: "Analyze this crop image for diseases. Provide detailed identification with confidence scores and treatment recommendations.",
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_crop",
              description: "Return structured crop disease analysis results.",
              parameters: {
                type: "object",
                properties: {
                  is_plant: {
                    type: "boolean",
                    description: "Whether the image contains a plant/crop",
                  },
                  crop_type: {
                    type: "string",
                    description: "Identified crop type e.g. Rice, Tomato, Cotton",
                  },
                  diseases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        disease: {
                          type: "string",
                          description: "Disease name or 'Healthy'",
                        },
                        confidence: {
                          type: "number",
                          description: "Confidence score 0-100",
                        },
                        severity: {
                          type: "string",
                          enum: ["Healthy", "Mild", "Moderate", "Severe"],
                        },
                        symptoms: {
                          type: "array",
                          items: { type: "string" },
                          description: "Observed symptoms in the image",
                        },
                        treatment: {
                          type: "array",
                          items: { type: "string" },
                          description: "Recommended treatment steps",
                        },
                      },
                      required: ["disease", "confidence", "severity", "symptoms", "treatment"],
                      additionalProperties: false,
                    },
                  },
                  additional_notes: {
                    type: "string",
                    description: "Any extra observations about crop health",
                  },
                },
                required: ["is_plant", "crop_type", "diseases", "additional_notes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_crop" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured results" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("disease-detect error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
