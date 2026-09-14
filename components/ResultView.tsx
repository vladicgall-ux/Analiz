"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, Camera as CameraIcon, Volume2, Square, Loader2 } from "lucide-react";
import { formatAnswer, stripMarkdownForSpeech } from "@/lib/formatAnswer";
import { useSpeech } from "@/lib/useSpeech";

export default function ResultView({
  image,
  answer,
  isLoading,
  error,
  onRetake,
  onBack,
}: {
  image: string;
  answer: string | null;
  isLoading: boolean;
  error: string | null;
  onRetake: () => void;
  onBack: () => void;
}) {
  const { status, speak, stop } = useSpeech();
  const hasAutoSpoken = useRef(false);

  useEffect(() => {
    if (answer && !hasAutoSpoken.current) {
      hasAutoSpoken.current = true;
      const speechText = stripMarkdownForSpeech(answer);
      const timer = setTimeout(() => speak(speechText), 300);
      return () => clearTimeout(timer);
    }
  }, [answer, speak]);

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleSpeech = () => {
    if (status === "speaking") {
      stop();
    } else if (answer) {
      speak(stripMarkdownForSpeech(answer));
    }
  };

  const handleRetake = () => {
    stop();
    onRetake();
  };

  const handleBack = () => {
    stop();
    onBack();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-base-950">
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4">
        <button
          onClick={handleBack}
          aria-label="Назад"
          className="flex h-11 w-11 items-center justify-center rounded-full glass text-white active:scale-90 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-medium text-white/60">Результат анализа</h2>
        <div className="h-11 w-11" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-32">
        <div className="mx-auto max-w-lg">
          <div className="mb-5 overflow-hidden rounded-2xl border border-white/10 shadow-xl animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Снимок" className="max-h-64 w-full object-cover" />
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl glass px-6 py-12 text-center animate-fade-in">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
              <div>
                <p className="font-medium text-white">ИИ думает и ищет ответ…</p>
                <p className="mt-1 text-sm text-white/40">
                  Обычно это занимает несколько секунд
                </p>
              </div>
              <div className="mt-2 w-full space-y-2">
                <div className="h-3 w-full animate-pulse-slow rounded-full bg-white/10" />
                <div className="h-3 w-5/6 animate-pulse-slow rounded-full bg-white/10" />
                <div className="h-3 w-4/6 animate-pulse-slow rounded-full bg-white/10" />
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300 animate-fade-in">
              {error}
            </div>
          )}

          {answer && !isLoading && (
            <div className="animate-slide-up rounded-2xl glass p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                  <Volume2 className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-white/70">
                  Ответ ассистента
                </span>
              </div>
              <div className="answer-content text-[15px] text-white/90">
                {formatAnswer(answer)}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={handleToggleSpeech}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500/90 px-4 py-3 text-sm font-medium text-white transition-transform active:scale-95 hover:bg-indigo-500"
                >
                  {status === "speaking" ? (
                    <>
                      <Square className="h-4 w-4" />
                      Остановить
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Озвучить повторно
                    </>
                  )}
                </button>
              </div>

              {status === "blocked" && (
                <p className="mt-3 text-center text-xs text-white/40">
                  Браузер заблокировал автозапуск звука — нажмите «Озвучить повторно»
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/5 bg-base-950/90 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 backdrop-blur-xl">
        <div className="mx-auto max-w-lg">
          <button
            onClick={handleRetake}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-base font-semibold text-base-950 transition-transform active:scale-95"
          >
            <CameraIcon className="h-5 w-5" />
            Сделать новый снимок
          </button>
        </div>
      </div>
    </div>
  );
}
