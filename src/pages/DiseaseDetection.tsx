import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, AlertTriangle, CheckCircle2, Leaf, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const mockResults = [
  {
    disease: "Bacterial Leaf Blight",
    confidence: 94,
    severity: "Moderate",
    treatment: [
      "Apply copper-based bactericide (2g/L water)",
      "Drain field water for 3-4 days",
      "Apply potash fertilizer to strengthen resistance",
      "Remove and destroy severely infected leaves",
    ],
  },
];

export default function DiseaseDetection() {
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof mockResults[0] | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(mockResults[0]);
    }, 2500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          <Camera className="inline h-8 w-8 mr-3 text-primary" />
          Crop Disease Detection
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Upload a photo of your crop leaf and our EfficientNetV2 model will identify diseases with 94% accuracy and recommend treatments.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
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

          {preview && !analyzing && !result && (
            <Button className="mt-4 w-full rounded-xl" size="lg" onClick={() => {
              setAnalyzing(true);
              setTimeout(() => { setAnalyzing(false); setResult(mockResults[0]); }, 2500);
            }}>
              Analyze Image
            </Button>
          )}
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
                  <p className="font-medium">Analyzing crop image...</p>
                </div>
                <Progress value={66} className="h-2" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Running EfficientNetV2 inference with TensorFlow.js
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
                {/* Detection result */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-destructive mb-3">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">Disease Detected</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold">{result.disease}</h3>
                  <div className="mt-4 flex items-center gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="text-2xl font-bold text-primary">{result.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Severity</p>
                      <p className="text-lg font-semibold text-secondary">{result.severity}</p>
                    </div>
                  </div>
                </div>

                {/* Treatment */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Leaf className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Recommended Treatment</span>
                  </div>
                  <ul className="space-y-3">
                    {result.treatment.map((t, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Info */}
                <div className="flex items-start gap-3 rounded-xl bg-accent/50 p-4 text-sm">
                  <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <p className="text-muted-foreground">
                    This is a prototype demo. Results are simulated. In production, the model processes images via EfficientNetV2 fine-tuned on 500+ Tamil Nadu crop images.
                  </p>
                </div>

                <Button variant="outline" className="w-full rounded-xl" onClick={() => { setResult(null); setPreview(null); }}>
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
                  Upload a crop leaf image to get started with AI-powered disease detection.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {["Paddy", "Sugarcane", "Tomato", "Cotton"].map((crop) => (
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
