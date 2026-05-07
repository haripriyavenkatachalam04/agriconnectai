import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";

interface MicButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function MicButton({ onTranscript, className }: MicButtonProps) {
  const { lang } = useLanguage();
  const { listening, supported, start, stop } = useSpeechRecognition({
    lang: lang === "ta" ? "ta-IN" : "en-IN",
    onResult: (text) => onTranscript(text),
  });

  if (!supported) return null;

  const label = lang === "ta" ? "பேசவும்" : "Speak";

  return (
    <Button
      type="button"
      variant={listening ? "default" : "outline"}
      size="icon"
      className={`relative h-10 w-10 rounded-xl shrink-0 ${className ?? ""}`}
      onClick={() => (listening ? stop() : start())}
      aria-label={label}
      title={label}
    >
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      {listening && (
        <motion.span
          className="absolute inset-0 rounded-xl border-2 border-primary"
          animate={{ scale: [1, 1.25], opacity: [0.7, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </Button>
  );
}
