"use client";

import { useCallback, useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import CameraView from "@/components/CameraView";
import ResultView from "@/components/ResultView";

type Screen = "welcome" | "camera" | "result";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [image, setImage] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(async (dataUrl: string) => {
    setImage(dataUrl);
    setAnswer(null);
    setError(null);
    setScreen("result");
    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Не удалось получить ответ от ИИ.");
      }

      setAnswer(data.answer);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при обращении к серверу."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetake = useCallback(() => {
    setImage(null);
    setAnswer(null);
    setError(null);
    setScreen("camera");
  }, []);

  const handleBackToWelcome = useCallback(() => {
    setImage(null);
    setAnswer(null);
    setError(null);
    setScreen("welcome");
  }, []);

  if (screen === "welcome") {
    return <WelcomeScreen onStart={() => setScreen("camera")} />;
  }

  if (screen === "camera") {
    return <CameraView onCapture={handleCapture} onBack={handleBackToWelcome} />;
  }

  return (
    <ResultView
      image={image!}
      answer={answer}
      isLoading={isLoading}
      error={error}
      onRetake={handleRetake}
      onBack={handleBackToWelcome}
    />
  );
}
