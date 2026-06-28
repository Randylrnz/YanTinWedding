"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { usePhotoboothStore } from "@/store/photoboothStore";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { FloatingBackground } from "@/components/FloatingBackground";

type CaptureState = "idle" | "countdown" | "flash" | "pause" | "done";

const PHOTO_COUNT = 3;
const COUNTDOWN_SECONDS = 3;
const PAUSE_AFTER_MS = 1500;

export default function CameraPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const { session, addPhoto, setScreen, resetSession } = usePhotoboothStore();

  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [cameraError, setCameraError] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (!session) router.replace("/");
  }, [session, router]);

  useInactivityTimer(
    60000,
    () => { resetSession(); router.replace("/"); },
    captureState === "idle"
  );

  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return null;
    return webcamRef.current.getScreenshot({ width: 1920, height: 1080 });
  }, []);

  const runCaptureSequence = useCallback(async () => {
    const photosTaken = session?.photos.length ?? 0;
    const photosRemaining = PHOTO_COUNT - photosTaken;

    for (let i = 0; i < photosRemaining; i++) {
      const photoNumber = photosTaken + i + 1;
      setCurrentPhoto(photoNumber);

      setCaptureState("countdown");
      for (let c = COUNTDOWN_SECONDS; c >= 1; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }

      setCaptureState("flash");
      const dataUrl = capturePhoto();
      if (dataUrl) addPhoto(dataUrl);
      await new Promise(r => setTimeout(r, 300));

      if (photoNumber < PHOTO_COUNT) {
        setCaptureState("pause");
        await new Promise(r => setTimeout(r, PAUSE_AFTER_MS));
      } else {
        setCaptureState("done");
      }
    }
  }, [session?.photos.length, capturePhoto, addPhoto]);

  // Skip preview — go directly to strip
  useEffect(() => {
    if (captureState === "done" && session && session.photos.length >= PHOTO_COUNT) {
      const timer = setTimeout(() => {
        setScreen("generating");
        router.push("/strip");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [captureState, session, setScreen, router]);

  function handleShutter() {
    if (isStarted || captureState !== "idle") return;
    setIsStarted(true);
    runCaptureSequence();
  }

  function handleExit() {
    resetSession();
    router.replace("/");
  }

  const photosTaken = session?.photos.length ?? 0;
  const isCapturing = captureState !== "idle" && captureState !== "done";

  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: "user",
  };

  if (cameraError) {
    return (
      <main className="h-full w-full flex flex-col items-center justify-center px-8 bg-animated relative overflow-hidden">
        <FloatingBackground />
        <div className="flex flex-col items-center gap-4 max-w-xs text-center">
          <div className="text-4xl">📷</div>
          <h2 className="font-playfair text-xl text-burgundy">Camera Unavailable</h2>
          <p className="font-lato font-light text-brown text-sm leading-relaxed">
            Unable to access your camera. Please allow camera access and try again.
          </p>
          <button
            onClick={handleExit}
            className="mt-2 px-7 py-3 rounded-full border-2 border-burgundy text-burgundy font-lato text-sm tracking-widest uppercase hover:bg-burgundy hover:text-white transition-all"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full w-full flex flex-col items-center relative overflow-hidden bg-animated">
      <FloatingBackground />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-dark/50 to-transparent" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between w-full px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={handleExit}
          className="font-lato text-[10px] text-brown/50 tracking-[0.3em] uppercase hover:text-brown/80 transition-colors py-1"
        >
          ← Exit
        </button>

        {/* Center brand */}
        <div className="flex flex-col items-center">
          <span className="font-playfair text-burgundy font-bold text-lg leading-none">
            Yan <span className="text-champagne-dark text-base">♥</span> Tin
          </span>
          <span className="font-lato text-brown/50 tracking-[0.2em] text-[9px] uppercase mt-0.5">
            Photobooth
          </span>
        </div>

        {/* Photo dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full border transition-all duration-400"
              style={{
                borderColor: i < photosTaken ? "#800020" : "rgba(232,201,154,0.7)",
                backgroundColor: i < photosTaken ? "#800020" : "transparent",
              }}
            />
          ))}
        </div>
      </div>

      {/* Decorative line */}
      <div className="relative z-10 w-36 h-px bg-gradient-to-r from-transparent via-champagne-dark/50 to-transparent mb-3 flex-shrink-0" />

      {/* Photo label */}
      <AnimatePresence mode="wait">
        {captureState === "idle" && (
          <motion.p
            className="relative z-10 font-lato text-brown/50 text-[10px] tracking-[0.3em] uppercase mb-2 flex-shrink-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            Position yourself in the frame
          </motion.p>
        )}
        {captureState === "countdown" && (
          <motion.p
            className="relative z-10 font-lato text-brown/60 text-[10px] tracking-[0.3em] uppercase mb-2 flex-shrink-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            Photo {currentPhoto} of {PHOTO_COUNT}
          </motion.p>
        )}
        {(captureState === "pause" || captureState === "flash") && (
          <motion.p
            className="relative z-10 font-lato text-brown/50 text-[10px] tracking-[0.3em] uppercase mb-2 flex-shrink-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {captureState === "pause" ? `Get ready for photo ${currentPhoto + 1}` : " "}
          </motion.p>
        )}
        {captureState === "done" && (
          <motion.p
            className="relative z-10 font-lato text-burgundy text-[10px] tracking-[0.3em] uppercase mb-2 flex-shrink-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            All photos taken!
          </motion.p>
        )}
      </AnimatePresence>

      {/* Camera viewfinder — the framed portion */}
      <div className="relative z-10 flex items-center justify-center flex-1 w-full px-6">
        <div
          className="relative"
          style={{ width: "min(420px, 88vw)" }}
        >
          {/* Decorative corner brackets outside */}
          <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-champagne-dark/60 rounded-tl" />
          <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-champagne-dark/60 rounded-tr" />
          <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-champagne-dark/60 rounded-bl" />
          <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-champagne-dark/60 rounded-br" />

          {/* Viewfinder frame */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              aspectRatio: "4/3",
              border: "2px solid rgba(232,201,154,0.45)",
              boxShadow: "0 6px 32px rgba(128,0,32,0.12), 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Webcam */}
            <Webcam
              ref={webcamRef}
              audio={false}
              videoConstraints={videoConstraints}
              screenshotFormat="image/png"
              screenshotQuality={1}
              onUserMediaError={() => setCameraError(true)}
              className="w-full h-full object-cover"
              mirrored={true}
            />

            {/* Soft vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.25) 100%)" }}
            />

            {/* Inner corner guides */}
            <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-white/50 rounded-tl" />
            <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-white/50 rounded-tr" />
            <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-white/50 rounded-bl" />
            <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-white/50 rounded-br" />

            {/* Countdown overlay */}
            <AnimatePresence>
              {captureState === "countdown" && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                  style={{ background: "rgba(0,0,0,0.35)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={countdown}
                      className="font-playfair text-white"
                      style={{ fontSize: "clamp(3.5rem, 14vw, 6rem)", lineHeight: 1 }}
                      initial={{ opacity: 0, scale: 1.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.22 }}
                    >
                      {countdown}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flash */}
            <AnimatePresence>
              {captureState === "flash" && (
                <motion.div
                  className="absolute inset-0 bg-white pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.92 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                />
              )}
            </AnimatePresence>

            {/* Pause overlay */}
            <AnimatePresence>
              {captureState === "pause" && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-champagne text-2xl"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 0.9 }}
                  >✦</motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Done overlay */}
            <AnimatePresence>
              {captureState === "done" && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                  style={{ background: "rgba(0,0,0,0.45)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="font-playfair text-champagne text-4xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 220 }}
                  >♥</motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Shutter button area */}
      <div className="relative z-10 flex flex-col items-center gap-2 py-6 flex-shrink-0">
        <AnimatePresence mode="wait">
          {captureState === "idle" && (
            <motion.button
              key="shutter"
              onClick={handleShutter}
              disabled={isStarted}
              className="relative focus:outline-none disabled:opacity-40"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 180, damping: 16 }}
              whileTap={{ scale: 0.88 }}
              aria-label="Take photo"
            >
              {/* Outer ring — camera button style */}
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all"
                style={{
                  border: "3px solid rgba(128,0,32,0.25)",
                  background: "rgba(247,231,206,0.25)",
                  boxShadow: "0 4px 18px rgba(128,0,32,0.14)",
                }}
              >
                {/* Inner fill — the actual shutter circle */}
                <div
                  className="w-[52px] h-[52px] rounded-full bg-white"
                  style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.12)" }}
                />
              </div>
            </motion.button>
          )}

          {isCapturing && (
            <motion.div
              key="shooting"
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
              style={{
                border: "3px solid rgba(128,0,32,0.15)",
                background: "rgba(247,231,206,0.15)",
              }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="w-[52px] h-[52px] rounded-full bg-white/40" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {captureState === "idle" && (
            <motion.p
              className="font-lato text-xs text-brown/45 tracking-wide"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              Tap to shoot
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
