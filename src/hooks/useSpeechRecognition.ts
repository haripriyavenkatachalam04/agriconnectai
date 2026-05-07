import { useCallback, useEffect, useRef, useState } from "react";

type SR = any;

interface Options {
  lang?: string;
  onResult?: (transcript: string) => void;
}

export function useSpeechRecognition({ lang = "en-IN", onResult }: Options = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SR | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const r = new SpeechRecognition();
      r.continuous = false;
      r.interimResults = false;
      r.maxAlternatives = 1;
      recognitionRef.current = r;
    }
  }, []);

  const start = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    r.lang = lang;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript as string;
      setTranscript(text);
      onResult?.(text);
    };
    try {
      r.start();
    } catch {
      // already started
    }
  }, [lang, onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { listening, transcript, supported, start, stop };
}
