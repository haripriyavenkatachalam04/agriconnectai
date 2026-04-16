import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, Leaf, AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface DiseaseRecord {
  disease: string;
  confidence: number;
  severity: string;
  symptoms: string[];
  treatment: string[];
}

interface DetectionRecord {
  id: string;
  crop_type: string;
  diseases: DiseaseRecord[];
  additional_notes: string | null;
  created_at: string;
}

export default function DetectionHistory() {
  const [history, setHistory] = useState<DetectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("disease_detections")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setHistory(data as unknown as DetectionRecord[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();

    const channel = supabase
      .channel("detection-history")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "disease_detections" },
        () => fetchHistory()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const severityColor = (severity: string) => {
    switch (severity) {
      case "Healthy": return "text-green-600";
      case "Mild": return "text-yellow-600";
      case "Moderate": return "text-orange-500";
      case "Severe": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary" /> Detection History
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-4 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-primary" /> Detection History
      </h2>
      <div className="space-y-4">
        {history.map((record, idx) => {
          const primaryDisease = record.diseases?.[0];
          const isHealthy = primaryDisease?.disease === "Healthy";

          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {isHealthy ? (
                    <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{record.crop_type}</span>
                      <span className="text-xs rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
                        {primaryDisease?.disease || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="text-primary font-medium">
                        {primaryDisease?.confidence}% confidence
                      </span>
                      <span className={`font-medium ${severityColor(primaryDisease?.severity || "")}`}>
                        {primaryDisease?.severity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatDate(record.created_at)}
                </div>
              </div>

              {primaryDisease && primaryDisease.confidence > 0 && (
                <Progress value={primaryDisease.confidence} className="h-1.5 mt-3" />
              )}

              {record.diseases.length > 1 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {record.diseases.slice(1).map((d, i) => (
                    <span key={i} className="text-xs rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
                      {d.disease} ({d.confidence}%)
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
