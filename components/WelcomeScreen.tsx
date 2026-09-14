"use client";

import { Camera, Sparkles, Volume2, ScanText } from "lucide-react";

export default function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-base-950 px-6 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/30 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-[110px]" />
        <div className="absolute bottom-10 left-0 h-64 w-64 rounded-full bg-cyan-500/20 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl glass shadow-2xl shadow-indigo-500/10">
          <ScanText className="h-10 w-10 text-indigo-300" strokeWidth={1.75} />
        </div>

        <h1 className="max-w-sm text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          AI&nbsp;Репетитор
        </h1>
        <p className="mt-4 max-w-xs text-base leading-relaxed text-white/50 sm:max-w-sm sm:text-lg">
          Наведи камеру на задачу или вопрос — получи развёрнутый ответ текстом и голосом
        </p>

        <div className="mt-10 flex gap-6 text-white/40">
          <div className="flex flex-col items-center gap-2">
            <Camera className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-xs">Снимок</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-xs">Анализ</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Volume2 className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-xs">Голос</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="group relative mt-12 flex items-center gap-3 overflow-hidden rounded-full bg-white px-10 py-4 text-lg font-semibold text-base-950 shadow-2xl shadow-indigo-500/20 transition-transform duration-300 active:scale-95 sm:hover:scale-105"
        >
          <span className="relative z-10">Начать</span>
          <Camera className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:rotate-6" />
        </button>

        <p className="mt-6 text-xs text-white/30">
          Потребуется доступ к камере устройства
        </p>
      </div>
    </div>
  );
}
