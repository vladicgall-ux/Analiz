"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechStatus = "idle" | "speaking" | "unsupported" | "blocked";

export function useSpeech() {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("unsupported");
      return;
    }

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const ruVoice =
        voices.find((v) => v.lang?.toLowerCase().startsWith("ru")) ?? null;
      voiceRef.current = ruVoice;
    };

    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setStatus("idle");
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("unsupported");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ru-RU";
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = (e) => {
      if (e.error === "interrupted" || e.error === "canceled") {
        setStatus("idle");
      } else {
        setStatus("blocked");
      }
    };

    utteranceRef.current = utterance;

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      setStatus("blocked");
    }
  }, []);

  return { status, speak, stop };
}
