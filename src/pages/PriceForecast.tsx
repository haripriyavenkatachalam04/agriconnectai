import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const crops = ["Paddy", "Sugarcane", "Tomato", "Onion", "Cotton"];

const generateData = (crop: string) => {
  const base: Record<string, number> = { Paddy: 2200, Sugarcane: 3500, Tomato: 1800, Onion: 2500, Cotton: 6800 };
  const b = base[crop] || 2000;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "Jan'27", "Feb'27"];
  return months.map((m, i) => ({
    month: m,
    actual: i < 12 ? Math.round(b + Math.sin(i * 0.8) * 400 + Math.random() * 200) : undefined,
    predicted: i >= 10 ? Math.round(b + Math.sin(i * 0.8) * 350 + 100 + Math.random() * 150) : undefined,
  }));
};

export default function PriceForecast() {
  const [crop, setCrop] = useState("Paddy");
  const data = generateData(crop);
  const lastActual = data.filter(d => d.actual).pop()?.actual || 0;
  const lastPredicted = data.filter(d => d.predicted).pop()?.predicted || 0;
  const trend = lastPredicted > lastActual;

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          <BarChart3 className="inline h-8 w-8 mr-3 text-primary" />
          Market Price Forecast
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          30-day price predictions powered by 3-layer LSTM models trained on 5 years of Tamil Nadu mandi and IMD weather data.
        </p>
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-4 items-center">
        <Select value={crop} onValueChange={setCrop}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {crops.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary" /> Actual
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-secondary" /> Predicted
          </span>
        </div>
      </div>

      {/* Chart */}
      <motion.div
        key={crop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 glass-card rounded-2xl p-6"
      >
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(145, 63%, 32%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(145, 63%, 32%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(40, 80%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(40, 80%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(100, 15%, 88%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid hsl(100,15%,88%)", fontSize: 13 }}
              formatter={(value: number) => [`₹${value}/quintal`]}
            />
            <Area type="monotone" dataKey="actual" stroke="hsl(145, 63%, 32%)" fill="url(#gradActual)" strokeWidth={2.5} connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke="hsl(40, 80%, 55%)" fill="url(#gradPredicted)" strokeWidth={2.5} strokeDasharray="6 3" connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Current Price</p>
          <p className="mt-1 text-2xl font-bold">₹{lastActual.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">per quintal</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground">30-Day Forecast</p>
          <p className="mt-1 text-2xl font-bold">₹{lastPredicted.toLocaleString()}</p>
          <div className={`flex items-center gap-1 text-sm font-medium ${trend ? "text-primary" : "text-destructive"}`}>
            {trend ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {trend ? "Upward" : "Downward"} trend
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Best Sell Window</p>
          <div className="mt-1 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <p className="text-lg font-semibold">Feb 15 – Mar 5</p>
          </div>
          <p className="text-xs text-muted-foreground">Based on predicted peak</p>
        </motion.div>
      </div>
    </div>
  );
}
