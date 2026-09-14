"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, RefreshCw, AlertTriangle, ScanLine } from "lucide-react";

type FacingMode = "user" | "environment";

export default function CameraView({
  onCapture,
  onBack,
}: {
  onCapture: (dataUrl: string) => void;
  onBack: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [canSwitch, setCanSwitch] = useState(true);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async (mode: FacingMode) => {
    setError(null);
    setIsReady(false);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsReady(true);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setCanSwitch(videoInputs.length > 1);
      } catch {
        setCanSwitch(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError(
            "Доступ к камере запрещён. Разрешите доступ в настройках браузера и обновите страницу."
          );
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setError("Камера не найдена на этом устройстве.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setError("Камера занята другим приложением. Закройте его и попробуйте снова.");
        } else {
          setError("Не удалось получить доступ к камере: " + err.message);
        }
      } else {
        setError("Не удалось получить доступ к камере.");
      }
    }
  }, [stopStream]);

  useEffect(() => {
    startStream(facingMode);
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitchCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startStream(next);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isReady) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    stopStream();
    onCapture(dataUrl);
  };

  const handleBack = () => {
    stopStream();
    onBack();
  };

  return (
    <div className="relative flex h-dvh w-full flex-col bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

      <div className="relative z-10 flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <button
          onClick={handleBack}
          aria-label="Назад"
          className="flex h-11 w-11 items-center justify-center rounded-full glass text-white active:scale-90 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {canSwitch && (
          <button
            onClick={handleSwitchCamera}
            aria-label="Переключить камеру"
            className="flex h-11 w-11 items-center justify-center rounded-full glass text-white active:scale-90 transition-transform"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        )}
      </div>

      {isReady && !error && (
        <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center px-8">
          <div className="relative aspect-[3/4] w-full max-w-md">
            <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-2 border-t-2 border-white/70" />
            <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-2 border-t-2 border-white/70" />
            <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-2 border-l-2 border-white/70" />
            <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-2 border-r-2 border-white/70" />
          </div>
        </div>
      )}

      {!isReady && !error && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3 text-white/70">
          <ScanLine className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Включаем камеру…</p>
        </div>
      )}

      {error && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-white/80">{error}</p>
          <button
            onClick={() => startStream(facingMode)}
            className="mt-2 rounded-full glass px-6 py-2.5 text-sm font-medium text-white active:scale-95 transition-transform"
          >
            Попробовать снова
          </button>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-6">
        <button
          onClick={handleCapture}
          disabled={!isReady}
          aria-label="Сделать снимок и спросить"
          className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/90 bg-white/10 backdrop-blur-sm transition-transform active:scale-90 disabled:opacity-30"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <Camera className="h-7 w-7 text-base-950" strokeWidth={2} />
          </div>
        </button>
        <p className="text-sm font-medium text-white/80">
          Сделать снимок и спросить
        </p>
      </div>
    </div>
  );
}
