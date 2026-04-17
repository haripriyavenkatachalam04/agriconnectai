import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Leaf, Sun, CloudRain, MapPin, Loader2, Star, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

const soilTypes = ["Alluvial", "Red Soil", "Black Cotton", "Laterite", "Sandy", "Clay", "Loamy", "Saline"];
const weatherOptions = ["Hot & Dry", "Hot & Humid", "Warm & Moderate", "Cool & Wet", "Monsoon Season", "Post-Monsoon"];
const regions = ["Thanjavur", "Erode", "Coimbatore", "Dindigul", "Namakkal", "Tiruvarur", "Madurai", "Salem", "Trichy", "Other"];

interface Recommendation {
  crop: string;
  score: number;
  reason: string;
  expectedYield: string;
  plantingWindow: string;
  careTips: string[];
}

interface AIResult {
  recommendations: Recommendation[];
  summary: string;
}

export default function CropRecommend() {
  const { t } = useLanguage();
  const [soilType, setSoilType] = useState("");
  const [weather, setWeather] = useState("");
  const [cropHistory, setCropHistory] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const handleSubmit = async () => {
    if (!soilType || !weather || !cropHistory.trim()) {
      toast.error(t("cr_required"));
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("crop-recommend", {
        body: { soilType, weather, cropHistory: cropHistory.trim(), region },
      });

      if (error) {
        throw new Error(error.message || "Failed to get recommendations");
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("cr_err_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          <Sprout className="inline h-8 w-8 mr-3 text-primary" />
          {t("cr_title")}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          {t("cr_desc")}
        </p>
      </motion.div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[420px_1fr]">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Leaf className="h-4 w-4 text-primary" /> {t("cr_soil")} *
              </Label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("cr_soil_ph")} />
                </SelectTrigger>
                <SelectContent>
                  {soilTypes.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Sun className="h-4 w-4 text-secondary" /> {t("cr_weather")} *
              </Label>
              <Select value={weather} onValueChange={setWeather}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("cr_weather_ph")} />
                </SelectTrigger>
                <SelectContent>
                  {weatherOptions.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <CloudRain className="h-4 w-4 text-agri-sky" /> {t("cr_history")} *
              </Label>
              <Input
                placeholder={t("cr_history_ph")}
                value={cropHistory}
                onChange={(e) => setCropHistory(e.target.value)}
                className="rounded-xl"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">{t("cr_history_help")}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-destructive" /> {t("cr_region")}
              </Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("cr_region_ph")} />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full rounded-xl text-base"
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("cr_loading")}
                </>
              ) : (
                <>
                  <Sprout className="mr-2 h-5 w-5" />
                  {t("cr_get")}
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Results */}
        <div>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card rounded-2xl p-8 text-center"
              >
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                <p className="mt-4 font-medium">{t("cr_analyzing")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("cr_analyzing_sub")}
                </p>
              </motion.div>
            )}

            {!loading && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Summary */}
                {result.summary && (
                  <div className="glass-card rounded-2xl p-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
                  </div>
                )}

                {/* Cards */}
                {result.recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.crop}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-2xl p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-display font-bold">{rec.crop}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{rec.reason}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-accent px-3 py-1">
                        <Star className="h-4 w-4 text-secondary fill-current" />
                        <span className="text-sm font-bold">{rec.score}/10</span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Sprout className="h-4 w-4 text-primary shrink-0" />
                        <span><span className="font-medium">{t("cr_yield")}:</span> {rec.expectedYield}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-secondary shrink-0" />
                        <span><span className="font-medium">{t("cr_plant")}:</span> {rec.plantingWindow}</span>
                      </div>
                    </div>

                    {rec.careTips.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("cr_care_tips")}</p>
                        <ul className="space-y-1.5">
                          {rec.careTips.map((tip, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}

                <Button variant="outline" className="w-full rounded-xl" onClick={() => setResult(null)}>
                  {t("cr_try_again")}
                </Button>
              </motion.div>
            )}

            {!loading && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-10 text-center"
              >
                <Sprout className="h-14 w-14 mx-auto text-muted-foreground/30" />
                <p className="mt-4 text-lg font-medium">{t("cr_empty_title")}</p>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  {t("cr_empty_desc")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
