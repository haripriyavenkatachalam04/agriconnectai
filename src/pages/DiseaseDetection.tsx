import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, AlertTriangle, CheckCircle2, Leaf, Info, ShieldCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiseaseResult {
  disease: string;
  confidence: number;
  severity: "Healthy" | "Mild" | "Moderate" | "Severe";
  symptoms: string[];
  treatment: string[];
}

interface AnalysisResult {
  is_plant: boolean;
  crop_type: string;
  diseases: DiseaseResult[];
  additional_notes: string;
}

export default function DiseaseDetection() {
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    setResult(null);
    setProgressValue(10);

    try {
      const base64 = await fileToBase64(file);
      setProgressValue(30);

      const interval = setInterval(() => {
        setProgressValue((prev) => Math.min(prev + 8, 85));
      }, 400);

      const { data, error } = await supabase.functions.invoke("disease-detect", {
        body: { imageBase64: base64 },
      });

      clearInterval(interval);
      setProgressValue(100);

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Analysis failed. Please try again.");
        setAnalyzing(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setAnalyzing(false);
        return;
      }

      if (!data?.is_plant) {
        toast.warning("The uploaded image doesn't appear to be a plant. Please upload a crop leaf image.");
        setAnalyzing(false);
        return;
      }

      setResult(data as AnalysisResult);
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    analyzeImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case "Healthy": return "text-green-600";
      case "Mild": return "text-yellow-600";
      case "Moderate": return "text-orange-500";
      case "Severe": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const isHealthy = result?.diseases?.every((d) => d.disease === "Healthy");

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          <Camera className="inline h-8 w-8 mr-3 text-primary" />
          AI Crop Disease Detection
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Upload a photo of your crop leaf and our AI vision model will identify diseases with confidence scores and recommend treatments.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Upload zone */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors cursor-pointer ${
              dragActive ? "border-primary bg-accent/50" : "border-border hover:border-primary/50 hover:bg-accent/30"
            } ${preview ? "min-h-[300px]" : "min-h-[400px]"}`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            {preview ? (
              <img src={preview} alt="Uploaded crop" className="max-h-[350px] rounded-xl object-contain" />
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                  <Upload className="h-7 w-7 text-accent-foreground" />
                </div>
                <p className="mt-4 text-lg font-medium">Drop your crop image here</p>
                <p className="mt-1 text-sm text-muted-foreground">or click to browse (JPG, PNG)</p>
              </>
            )}
            <input id="file-input" type="file" accept="image/*" className="hidden" onChange={handleInput} />
          </div>
        </motion.div>

        {/* Results */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {analyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                  <p className="font-medium">Analyzing crop image with AI...</p>
                </div>
                <Progress value={progressValue} className="h-2" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Running AI vision analysis to detect diseases and assess severity
                </p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Crop identification */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Crop Identified</span>
                  </div>
                  <p className="text-xl font-display font-bold">{result.crop_type}</p>
                </div>

                {/* Disease results */}
                {result.diseases.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {d.disease === "Healthy" ? (
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="font-semibold">
                        {d.disease === "Healthy" ? "Plant is Healthy" : "Disease Detected"}
                      </span>
                    </div>

                    <h3 className="text-2xl font-display font-bold">{d.disease}</h3>

                    <div className="mt-4 flex items-center gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Confidence</p>
                        <p className="text-2xl font-bold text-primary">{d.confidence}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Severity</p>
                        <p className={`text-lg font-semibold ${severityColor(d.severity)}`}>
                          {d.severity}
                        </p>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="mt-3">
                      <Progress value={d.confidence} className="h-2" />
                    </div>

                    {/* Symptoms */}
                    {d.symptoms.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Observed Symptoms</span>
                        </div>
                        <ul className="space-y-1">
                          {d.symptoms.map((s, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Treatment */}
                    {d.treatment.length > 0 && d.disease !== "Healthy" && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Recommended Treatment</span>
                        </div>
                        <ul className="space-y-2">
                          {d.treatment.map((t, j) => (
                            <li key={j} className="flex items-start gap-3">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <span className="text-sm leading-relaxed">{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Additional notes */}
                {result.additional_notes && (
                  <div className="flex items-start gap-3 rounded-xl bg-accent/50 p-4 text-sm">
                    <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <p className="text-muted-foreground">{result.additional_notes}</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => { setResult(null); setPreview(null); }}
                >
                  Upload Another Image
                </Button>
              </motion.div>
            )}

            {!analyzing && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-8 text-center"
              >
                <Camera className="h-12 w-12 mx-auto text-muted-foreground/40" />
                <p className="mt-4 text-muted-foreground">
                  Upload a crop leaf image to get AI-powered disease detection with confidence scores.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {["Paddy", "Sugarcane", "Tomato", "Cotton", "Groundnut", "Banana"].map((crop) => (
                    <span key={crop} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                      {crop}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
