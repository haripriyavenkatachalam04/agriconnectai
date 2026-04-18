import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle2, AlertCircle, Upload, Loader2, FileSpreadsheet, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ActiveModel = {
  id: string;
  version: string;
  architecture: string;
  hidden_size: number;
  sequence_length: number;
  crops: string[];
  mandis: string[];
  train_samples: number | null;
  val_mape: number | null;
  notes: string | null;
  created_at: string;
  public_url: string;
};

const MAX_CSV_BYTES = 20 * 1024 * 1024; // 20 MB

export function ModelStatus() {
  const [model, setModel] = useState<ActiveModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchModel = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("active-model");
      if (error) throw error;
      setModel((data as { active: ActiveModel | null }).active);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModel();
  }, []);

  const onCsvSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset input
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      toast({ title: "CSV only", description: "Please upload a .csv file.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_CSV_BYTES) {
      toast({ title: "File too large", description: "Max 20 MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      // Get a signed upload URL
      const { data: signed, error: signErr } = await supabase.functions.invoke("upload-training-data", {
        body: { filename: file.name, contentType: "text/csv" },
      });
      if (signErr) throw signErr;
      const { uploadPath, token } = signed as { uploadPath: string; token: string };

      // Upload directly to Storage using the token
      const { error: upErr } = await supabase.storage
        .from("training-data")
        .uploadToSignedUrl(uploadPath, token, file, { contentType: "text/csv" });
      if (upErr) throw upErr;

      toast({
        title: "CSV uploaded",
        description: `Saved to training-data/${uploadPath}. Use it in the Colab notebook.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-6 glass-card rounded-2xl p-6"
    >
      <div className="flex items-start gap-3 flex-wrap">
        <Brain className="h-6 w-6 text-primary shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-display font-semibold">Forecast Model</h3>
            {loading ? (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading
              </Badge>
            ) : model ? (
              <Badge className="bg-primary/15 text-primary border border-primary/30 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                LSTM active · {model.version}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 border border-secondary/40">
                <AlertCircle className="h-3 w-3" />
                Holt-Winters fallback (no LSTM uploaded)
              </Badge>
            )}
          </div>

          {model ? (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <Stat label="Architecture" value={model.architecture} />
              <Stat label="Hidden size" value={String(model.hidden_size)} />
              <Stat label="Sequence" value={`${model.sequence_length} days`} />
              <Stat
                label="Validation MAPE"
                value={model.val_mape !== null ? `${Number(model.val_mape).toFixed(2)}%` : "—"}
              />
              <Stat label="Train samples" value={model.train_samples?.toLocaleString() ?? "—"} />
              <Stat label="Crops covered" value={String(model.crops.length)} />
              <Stat label="Mandis covered" value={String(model.mandis.length)} />
              <Stat
                label="Trained"
                value={new Date(model.created_at).toLocaleDateString()}
              />
              {model.notes && (
                <div className="col-span-2 sm:col-span-4 text-xs text-muted-foreground mt-1">
                  {model.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Forecasts currently come from a Holt-Winters seasonal model. Train and upload an LSTM via the Colab notebook
              to switch to learned predictions.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <label>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={onCsvSelected}
                disabled={uploading}
              />
              <Button asChild variant="outline" size="sm" className="cursor-pointer" disabled={uploading}>
                <span>
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  Upload training CSV
                </span>
              </Button>
            </label>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://colab.research.google.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Open Colab to train
              </a>
            </Button>
            {model && (
              <Button asChild variant="ghost" size="sm">
                <a href={model.public_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download model JSON
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={fetchModel} disabled={loading}>
              Refresh
            </Button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            CSV format: <code className="text-xs">date, crop, mandi, price</code>. After uploading, open the
            Colab notebook (provided in <code className="text-xs">/mnt/documents</code>), point it at this dataset,
            train, and the model auto-registers. Cold-start picks it up within ~1 minute.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold truncate">{value}</p>
    </div>
  );
}
