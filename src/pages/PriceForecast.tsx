import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Loader2, Lightbulb, Info } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ModelStatus } from "@/components/ModelStatus";

const CROPS = ["Paddy", "Sugarcane", "Tomato", "Onion", "Cotton", "Groundnut", "Maize", "Turmeric"] as const;
const MANDIS = [
  "Coimbatore",
  "Madurai",
  "Chennai-Koyambedu",
  "Erode",
  "Salem",
  "Thanjavur",
  "Trichy",
  "Dindigul",
] as const;

type ForecastPoint = { date: string; price: number; lower: number; upper: number };
type HistoryPoint = { date: string; price: number };
type WeeklyRow = { week: number; avg: number; min: number; max: number };
type Insight = {
  recommendation: "sell_now" | "sell_soon" | "hold";
  headline: string;
  expected_gain_per_quintal: number;
  best_sell_date: string;
  drivers: string[];
};
type ApiResponse = {
  crop: string;
  mandi: string;
  currentPrice: number;
  history: HistoryPoint[];
  forecast: ForecastPoint[];
  weekly: WeeklyRow[];
  peak: { date: string; price: number };
  trough: { date: string; price: number };
  endPrice: number;
  insight: Insight | null;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function PriceForecast() {
  const { t, lang } = useLanguage();
  const [crop, setCrop] = useState<string>("Paddy");
  const [mandi, setMandi] = useState<string>("Coimbatore");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const { data: res, error } = await supabase.functions.invoke("price-forecast", {
          body: { crop, mandi, language: lang },
        });
        if (cancelled) return;
        if (error) throw error;
        setData(res as ApiResponse);
      } catch (e) {
        console.error(e);
        toast({ title: "Forecast failed", description: "Please try again.", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [crop, mandi, lang]);

  // Merge history + forecast into a single chart series
  const chartData = data
    ? [
        ...data.history.map((h) => ({
          date: h.date,
          actual: h.price,
        })),
        ...data.forecast.map((f) => ({
          date: f.date,
          predicted: f.price,
          lower: f.lower,
          upper: f.upper,
          band: [f.lower, f.upper] as [number, number],
        })),
      ]
    : [];

  const change = data ? data.endPrice - data.currentPrice : 0;
  const changePct = data && data.currentPrice ? (change / data.currentPrice) * 100 : 0;
  const trendUp = change >= 0;

  const recColor =
    data?.insight?.recommendation === "sell_now"
      ? "bg-destructive/15 text-destructive border-destructive/30"
      : data?.insight?.recommendation === "sell_soon"
      ? "bg-secondary/20 text-secondary-foreground border-secondary/40"
      : "bg-primary/15 text-primary border-primary/30";

  const recLabel =
    data?.insight?.recommendation === "sell_now"
      ? t("pf_rec_sell_now")
      : data?.insight?.recommendation === "sell_soon"
      ? t("pf_rec_sell_soon")
      : t("pf_rec_hold");

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          <BarChart3 className="inline h-8 w-8 mr-3 text-primary" />
          {t("pf_title")}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">{t("pf_desc")}</p>
      </motion.div>

      {/* Controls */}
      <div className="mt-8 flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">{t("pf_crop")}</label>
          <Select value={crop} onValueChange={setCrop}>
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CROPS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">{t("pf_mandi")}</label>
          <Select value={mandi} onValueChange={setMandi}>
            <SelectTrigger className="w-52 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MANDIS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4 text-sm pt-5 flex-wrap">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary" /> {t("pf_actual")}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-secondary" /> {t("pf_predicted")}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-secondary/30" /> {t("pf_confidence")}
          </span>
        </div>
      </div>

      {/* Chart */}
      <motion.div
        key={`${crop}-${mandi}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 glass-card rounded-2xl p-6 relative min-h-[440px]"
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 font-medium">{t("pf_loading")}</p>
            <p className="text-sm text-muted-foreground">{t("pf_loading_sub")}</p>
          </div>
        )}
        {data && (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={fmtDate}
                minTickGap={30}
              />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(var(--border))",
                  fontSize: 13,
                  background: "hsl(var(--background))",
                }}
                labelFormatter={(l) => fmtDate(l as string)}
                formatter={(value: number | number[], name: string) => {
                  if (Array.isArray(value)) return [`₹${value[0]} – ₹${value[1]}`, t("pf_confidence")];
                  return [`₹${value}/quintal`, name];
                }}
              />
              {/* Confidence band */}
              <Area
                type="monotone"
                dataKey="band"
                stroke="none"
                fill="hsl(var(--secondary))"
                fillOpacity={0.18}
                isAnimationActive={false}
              />
              {/* Actual history */}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                fill="url(#gradActual)"
                strokeWidth={2.5}
                connectNulls={false}
                name={t("pf_actual")}
              />
              {/* Forecast line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="hsl(var(--secondary))"
                strokeWidth={2.5}
                strokeDasharray="6 3"
                dot={false}
                connectNulls={false}
                name={t("pf_predicted")}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Summary cards */}
      {data && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-5"
          >
            <p className="text-sm text-muted-foreground">{t("pf_current")}</p>
            <p className="mt-1 text-2xl font-bold">₹{data.currentPrice.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("pf_per_quintal")}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-5"
          >
            <p className="text-sm text-muted-foreground">{t("pf_30day")}</p>
            <p className="mt-1 text-2xl font-bold">₹{data.endPrice.toLocaleString()}</p>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trendUp ? "text-primary" : "text-destructive"
              }`}
            >
              {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {trendUp ? t("pf_upward") : t("pf_downward")} ({changePct >= 0 ? "+" : ""}
              {changePct.toFixed(1)}%)
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-5"
          >
            <p className="text-sm text-muted-foreground">{t("pf_best_window")}</p>
            <div className="mt-1 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <p className="text-lg font-semibold">{fmtDate(data.peak.date)}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              ₹{data.peak.price.toLocaleString()} · {t("pf_best_window_sub")}
            </p>
          </motion.div>
        </div>
      )}

      {/* AI Insight */}
      {data?.insight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 glass-card rounded-2xl p-6"
        >
          <div className="flex items-start gap-3 flex-wrap">
            <Lightbulb className="h-6 w-6 text-secondary shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-display font-semibold">{t("pf_insight_title")}</h3>
                <Badge className={`${recColor} border`}>{recLabel}</Badge>
              </div>
              <p className="mt-2 text-base">{data.insight.headline}</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span>
                  <span className="text-muted-foreground">{t("pf_expected_gain")}: </span>
                  <span
                    className={`font-semibold ${
                      data.insight.expected_gain_per_quintal >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {data.insight.expected_gain_per_quintal >= 0 ? "+" : ""}₹
                    {Math.round(data.insight.expected_gain_per_quintal).toLocaleString()}/quintal
                  </span>
                </span>
                <span>
                  <span className="text-muted-foreground">{t("pf_best_window")}: </span>
                  <span className="font-semibold">{fmtDate(data.insight.best_sell_date)}</span>
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">{t("pf_drivers")}</p>
                <ul className="space-y-1">
                  {data.insight.drivers.map((d, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Weekly summary */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-display font-semibold mb-4">{t("pf_weekly_title")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.weekly.map((w) => {
              const diff = w.avg - data.currentPrice;
              const pct = data.currentPrice ? (diff / data.currentPrice) * 100 : 0;
              const up = diff >= 0;
              return (
                <div key={w.week} className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("pf_week")} {w.week}
                  </p>
                  <p className="mt-1 text-xl font-bold">₹{w.avg.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("pf_range")}: ₹{w.min}–₹{w.max}
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 flex items-center gap-1 ${
                      up ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {pct >= 0 ? "+" : ""}
                    {pct.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <ModelStatus />

      <p className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
        <Info className="h-3.5 w-3.5" />
        {t("pf_model_note")}
      </p>
    </div>
  );
}
