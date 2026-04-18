import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─────────────────────────────────────────────────────────────────────
// TN mandi baselines — used to seed history when LSTM is active, and
// as the full Holt-Winters forecaster when no model has been trained yet.
// ─────────────────────────────────────────────────────────────────────
type CropKey =
  | "Paddy" | "Sugarcane" | "Tomato" | "Onion" | "Cotton" | "Groundnut" | "Maize" | "Turmeric";
type MandiKey =
  | "Coimbatore" | "Madurai" | "Chennai-Koyambedu" | "Erode"
  | "Salem" | "Thanjavur" | "Trichy" | "Dindigul";

const CROP_BASE: Record<CropKey, { base: number; volatility: number; seasonAmp: number; seasonPeakDay: number }> = {
  Paddy:     { base: 2280,  volatility: 0.012, seasonAmp: 0.06, seasonPeakDay: 60 },
  Sugarcane: { base: 3450,  volatility: 0.006, seasonAmp: 0.03, seasonPeakDay: 120 },
  Tomato:    { base: 1850,  volatility: 0.055, seasonAmp: 0.35, seasonPeakDay: 180 },
  Onion:     { base: 2620,  volatility: 0.045, seasonAmp: 0.28, seasonPeakDay: 250 },
  Cotton:    { base: 6850,  volatility: 0.018, seasonAmp: 0.08, seasonPeakDay: 30 },
  Groundnut: { base: 6200,  volatility: 0.020, seasonAmp: 0.10, seasonPeakDay: 90 },
  Maize:     { base: 2150,  volatility: 0.015, seasonAmp: 0.07, seasonPeakDay: 150 },
  Turmeric:  { base: 14200, volatility: 0.022, seasonAmp: 0.12, seasonPeakDay: 45 },
};

const MANDI_FACTOR: Record<MandiKey, number> = {
  "Coimbatore": 1.00, "Madurai": 0.97, "Chennai-Koyambedu": 1.08, "Erode": 0.99,
  "Salem": 0.96, "Thanjavur": 0.95, "Trichy": 0.98, "Dindigul": 0.94,
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86400000);
}
function seasonalFactor(doy: number, peak: number, amp: number) {
  return 1 + amp * Math.cos((2 * Math.PI * (doy - peak)) / 365);
}

function buildHistory(crop: CropKey, mandi: MandiKey, days = 120) {
  const cfg = CROP_BASE[crop];
  const mfactor = MANDI_FACTOR[mandi];
  const rand = mulberry32(hashSeed(`${crop}|${mandi}`));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const hist: { date: string; price: number }[] = [];
  const trendPerDay = (rand() - 0.45) * cfg.base * 0.0006;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const seas = seasonalFactor(dayOfYear(d), cfg.seasonPeakDay, cfg.seasonAmp);
    const noise = 1 + (rand() - 0.5) * 2 * cfg.volatility;
    const price = (cfg.base * mfactor + trendPerDay * (days - i)) * seas * noise;
    hist.push({ date: d.toISOString().slice(0, 10), price: Math.round(price) });
  }
  return hist;
}

// ─────────────────────────────────────────────────────────────────────
// Pure-TS LSTM forward pass
// Matches PyTorch nn.LSTM(num_layers=1, batch_first=True) export from notebook
// ─────────────────────────────────────────────────────────────────────
type LSTMModel = {
  version: string;
  architecture: string;
  hidden_size: number;
  embedding_dim: number;
  sequence_length: number;
  crops: string[];
  mandis: string[];
  stats: Record<string, { mean: number; std: number }>;
  weights: {
    crop_emb: number[][];     // (n_crops, emb)
    mandi_emb: number[][];    // (n_mandis, emb)
    lstm_w_ih: number[][];    // (4*hidden, input)
    lstm_w_hh: number[][];    // (4*hidden, hidden)
    lstm_b_ih: number[];      // (4*hidden,)
    lstm_b_hh: number[];      // (4*hidden,)
    head_w: number[][];       // (1, hidden)
    head_b: number[];         // (1,)
  };
  metrics?: { val_mape?: number; train_samples?: number };
};

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const tanh = Math.tanh;

function matVec(W: number[][], x: number[]): number[] {
  const rows = W.length;
  const out = new Array(rows).fill(0);
  for (let r = 0; r < rows; r++) {
    let s = 0;
    const row = W[r];
    for (let c = 0; c < x.length; c++) s += row[c] * x[c];
    out[r] = s;
  }
  return out;
}

function lstmStep(
  x: number[],
  hPrev: number[],
  cPrev: number[],
  W_ih: number[][],
  W_hh: number[][],
  b_ih: number[],
  b_hh: number[],
  hidden: number,
): { h: number[]; c: number[] } {
  // gates layout: [i, f, g, o] each `hidden` long
  const ih = matVec(W_ih, x);
  const hh = matVec(W_hh, hPrev);
  const h = new Array(hidden);
  const c = new Array(hidden);
  for (let k = 0; k < hidden; k++) {
    const i = sigmoid(ih[k]              + hh[k]              + b_ih[k]              + b_hh[k]);
    const f = sigmoid(ih[k + hidden]     + hh[k + hidden]     + b_ih[k + hidden]     + b_hh[k + hidden]);
    const g = tanh(   ih[k + 2 * hidden] + hh[k + 2 * hidden] + b_ih[k + 2 * hidden] + b_hh[k + 2 * hidden]);
    const o = sigmoid(ih[k + 3 * hidden] + hh[k + 3 * hidden] + b_ih[k + 3 * hidden] + b_hh[k + 3 * hidden]);
    c[k] = f * cPrev[k] + i * g;
    h[k] = o * tanh(c[k]);
  }
  return { h, c };
}

function lstmForward(model: LSTMModel, sequence: number[], cropIdx: number, mandiIdx: number): number {
  const H = model.hidden_size;
  const cropEmb = model.weights.crop_emb[cropIdx];
  const mandiEmb = model.weights.mandi_emb[mandiIdx];
  let h = new Array(H).fill(0);
  let c = new Array(H).fill(0);
  for (let t = 0; t < sequence.length; t++) {
    const x = [sequence[t], ...cropEmb, ...mandiEmb];
    ({ h, c } = lstmStep(
      x, h, c,
      model.weights.lstm_w_ih,
      model.weights.lstm_w_hh,
      model.weights.lstm_b_ih,
      model.weights.lstm_b_hh,
      H,
    ));
  }
  // Output head: 1 x H matmul -> scalar
  let y = model.weights.head_b[0];
  const wRow = model.weights.head_w[0];
  for (let k = 0; k < H; k++) y += wRow[k] * h[k];
  return y;
}

// ─────────────────────────────────────────────────────────────────────
// Model loading (cached across warm invocations)
// ─────────────────────────────────────────────────────────────────────
let cachedModel: LSTMModel | null = null;
let cachedVersion: string | null = null;
let cachedAt = 0;
const MODEL_CACHE_MS = 5 * 60 * 1000;

async function loadActiveModel(): Promise<{ model: LSTMModel | null; version: string | null; valMape: number | null }> {
  const now = Date.now();
  if (cachedModel && now - cachedAt < MODEL_CACHE_MS) {
    return { model: cachedModel, version: cachedVersion, valMape: cachedModel.metrics?.val_mape ?? null };
  }
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: row, error } = await supabase
      .from("ml_models")
      .select("version, storage_path, val_mape")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !row) {
      console.log("No active model registered");
      cachedModel = null; cachedVersion = null; cachedAt = now;
      return { model: null, version: null, valMape: null };
    }

    const url = `${SUPABASE_URL}/storage/v1/object/public/ml-models/${row.storage_path}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error("Model fetch failed", resp.status);
      return { model: null, version: null, valMape: null };
    }
    const json = (await resp.json()) as LSTMModel;
    cachedModel = json;
    cachedVersion = row.version;
    cachedAt = now;
    console.log(`Loaded LSTM model ${row.version}, MAPE=${row.val_mape}`);
    return { model: json, version: row.version, valMape: Number(row.val_mape) };
  } catch (e) {
    console.error("loadActiveModel error", e);
    return { model: null, version: null, valMape: null };
  }
}

// ─────────────────────────────────────────────────────────────────────
// Forecasters
// ─────────────────────────────────────────────────────────────────────
function holtWintersForecast(crop: CropKey, mandi: MandiKey) {
  const cfg = CROP_BASE[crop];
  const history = buildHistory(crop, mandi, 90);
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const recent = history.slice(-14).map((p) => p.price);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const last30 = history.slice(-30);
  const slope = (last30[last30.length - 1].price - last30[0].price) / last30.length;
  const forecast = [];
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today.getTime() + i * 86400000);
    const seasNow = seasonalFactor(dayOfYear(d), cfg.seasonPeakDay, cfg.seasonAmp);
    const seasBase = seasonalFactor(dayOfYear(today), cfg.seasonPeakDay, cfg.seasonAmp);
    const projected = (recentAvg + slope * i) * (seasNow / seasBase);
    const sigma = projected * cfg.volatility * Math.sqrt(i) * 1.6;
    forecast.push({
      date: d.toISOString().slice(0, 10),
      price: Math.round(projected),
      lower: Math.round(projected - sigma),
      upper: Math.round(projected + sigma),
    });
  }
  return { history, forecast };
}

function lstmForecast(crop: CropKey, mandi: MandiKey, model: LSTMModel) {
  const history = buildHistory(crop, mandi, 90);
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const cfg = CROP_BASE[crop];

  const cropIdx = model.crops.indexOf(crop);
  const mandiIdx = model.mandis.indexOf(mandi);
  if (cropIdx < 0 || mandiIdx < 0) {
    // Model doesn't know this combo — fall back
    return holtWintersForecast(crop, mandi);
  }

  const statsKey = `${crop}|${mandi}`;
  const stats = model.stats[statsKey];
  if (!stats) return holtWintersForecast(crop, mandi);

  const seqLen = model.sequence_length;
  // Build initial normalised sequence from last `seqLen` history prices
  let seq = history.slice(-seqLen).map((p) => (p.price - stats.mean) / stats.std);

  const forecast = [];
  for (let i = 1; i <= 30; i++) {
    const yNorm = lstmForward(model, seq, cropIdx, mandiIdx);
    const yPrice = yNorm * stats.std + stats.mean;
    const d = new Date(today.getTime() + i * 86400000);
    // Confidence band from per-crop volatility, widening with horizon
    const sigma = yPrice * cfg.volatility * Math.sqrt(i) * 1.4;
    forecast.push({
      date: d.toISOString().slice(0, 10),
      price: Math.round(yPrice),
      lower: Math.round(yPrice - sigma),
      upper: Math.round(yPrice + sigma),
    });
    // Slide window: drop oldest, append predicted (autoregressive)
    seq = [...seq.slice(1), yNorm];
  }
  return { history, forecast };
}

function weeklySummary(forecast: { date: string; price: number }[]) {
  const out: { week: number; avg: number; min: number; max: number }[] = [];
  for (let w = 0; w < 4; w++) {
    const slice = forecast.slice(w * 7, w * 7 + 7);
    if (!slice.length) break;
    const prices = slice.map((p) => p.price);
    out.push({
      week: w + 1,
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      min: Math.min(...prices),
      max: Math.max(...prices),
    });
  }
  return out;
}

async function generateInsight(args: {
  crop: string; mandi: string; currentPrice: number;
  forecastPeak: { date: string; price: number };
  forecastTrough: { date: string; price: number };
  endPrice: number;
  weekly: { week: number; avg: number }[];
  language: "en" | "ta";
  modelKind: "lstm" | "holt-winters";
}) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return null;
  const langInstr = args.language === "ta"
    ? "Respond entirely in Tamil (தமிழ்). Keep it natural and farmer-friendly."
    : "Respond in clear, simple English.";
  const sys = `You are AgriConnect AI, a market advisor for Tamil Nadu farmers. Forecast was produced by a ${args.modelKind === "lstm" ? "trained LSTM model" : "Holt-Winters statistical model"}. Give an honest, concise sell/hold recommendation and 2-3 key drivers. ${langInstr}`;
  const user = `Crop: ${args.crop}
Mandi: ${args.mandi}
Current price: ₹${args.currentPrice}/quintal
30-day forecast peak: ₹${args.forecastPeak.price} on ${args.forecastPeak.date}
30-day forecast trough: ₹${args.forecastTrough.price} on ${args.forecastTrough.date}
Day-30 price: ₹${args.endPrice}
Weekly averages: ${args.weekly.map((w) => `W${w.week}=₹${w.avg}`).join(", ")}

Decide: sell now, sell within X days, or hold. Quantify expected ₹/quintal gain or loss vs today.`;
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        tools: [{
          type: "function",
          function: {
            name: "market_insight",
            description: "Sell/hold recommendation with rationale",
            parameters: {
              type: "object",
              properties: {
                recommendation: { type: "string", enum: ["sell_now", "sell_soon", "hold"] },
                headline: { type: "string" },
                expected_gain_per_quintal: { type: "number" },
                best_sell_date: { type: "string" },
                drivers: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
              },
              required: ["recommendation", "headline", "expected_gain_per_quintal", "best_sell_date", "drivers"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "market_insight" } },
      }),
    });
    if (!resp.ok) { console.error("AI insight failed", resp.status); return null; }
    const data = await resp.json();
    const tc = data.choices?.[0]?.message?.tool_calls?.[0];
    return tc?.function?.arguments ? JSON.parse(tc.function.arguments) : null;
  } catch (e) { console.error("insight error", e); return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { crop, mandi, language } = await req.json();
    const cropKey = (crop ?? "Paddy") as CropKey;
    const mandiKey = (mandi ?? "Coimbatore") as MandiKey;
    const lang = (language === "ta" ? "ta" : "en") as "en" | "ta";

    if (!CROP_BASE[cropKey] || !MANDI_FACTOR[mandiKey]) {
      return new Response(JSON.stringify({ error: "Invalid crop or mandi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try LSTM first; fall back to Holt-Winters
    const { model, version, valMape } = await loadActiveModel();
    let history, forecast;
    let modelKind: "lstm" | "holt-winters" = "holt-winters";
    let modelVersion: string | null = null;
    let modelMape: number | null = null;

    if (model && model.architecture === "lstm-embeddings-v1") {
      try {
        const r = lstmForecast(cropKey, mandiKey, model);
        history = r.history; forecast = r.forecast;
        modelKind = "lstm";
        modelVersion = version;
        modelMape = valMape;
      } catch (e) {
        console.error("LSTM inference failed, falling back", e);
        const r = holtWintersForecast(cropKey, mandiKey);
        history = r.history; forecast = r.forecast;
      }
    } else {
      const r = holtWintersForecast(cropKey, mandiKey);
      history = r.history; forecast = r.forecast;
    }

    const currentPrice = history[history.length - 1].price;
    const endPrice = forecast[forecast.length - 1].price;
    const peak = forecast.reduce((a, b) => (b.price > a.price ? b : a));
    const trough = forecast.reduce((a, b) => (b.price < a.price ? b : a));
    const weekly = weeklySummary(forecast);

    const insight = await generateInsight({
      crop: cropKey, mandi: mandiKey, currentPrice,
      forecastPeak: { date: peak.date, price: peak.price },
      forecastTrough: { date: trough.date, price: trough.price },
      endPrice, weekly, language: lang, modelKind,
    });

    return new Response(
      JSON.stringify({
        crop: cropKey, mandi: mandiKey, currentPrice,
        history, forecast, weekly,
        peak: { date: peak.date, price: peak.price },
        trough: { date: trough.date, price: trough.price },
        endPrice,
        modelInfo: {
          method: modelKind === "lstm"
            ? `Trained LSTM with crop+mandi embeddings (${model?.hidden_size} hidden, seq=${model?.sequence_length})`
            : "Holt-Winters seasonal forecast (no trained model uploaded yet)",
          kind: modelKind,
          version: modelVersion,
          valMape: modelMape,
          horizonDays: 30,
          historyDays: history.length,
        },
        insight,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("price-forecast error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
