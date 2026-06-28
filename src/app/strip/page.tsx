"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotoboothStore } from "@/store/photoboothStore";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { generatePhotostrip } from "@/lib/stripGenerator";
import { FloatingBackground } from "@/components/FloatingBackground";

const FIXED_RECIPIENT = "phyrohendrixtech@gmail.com";

type DownloadState = "idle" | "downloading" | "done" | "error";

export default function StripPage() {
  const router = useRouter();
  const {
    session,
    setStripDataUrl,
    incrementDownload,
    resetSession,
    setEmailSent,
  } = usePhotoboothStore();

  const [isGenerating, setIsGenerating] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const hasGenerated = useRef(false);

  useEffect(() => {
    if (!session || session.photos.length < 3) router.replace("/");
  }, [session, router]);

  useInactivityTimer(
    90000,
    () => { resetSession(); router.replace("/"); },
    !isGenerating
  );

  const runGeneration = useCallback(async () => {
    if (!session || hasGenerated.current) return;
    hasGenerated.current = true;

    try {
      const { dataUrl, filename } = await generatePhotostrip({
        photos: session.photos.map(p => p.dataUrl),
      });
      setStripDataUrl(dataUrl, filename);
      setIsGenerating(false);
    } catch (err) {
      console.error("Strip generation failed:", err);
      setGenerationError("Failed to generate your photostrip.");
      setIsGenerating(false);
    }
  }, [session, setStripDataUrl]);

  useEffect(() => {
    if (session && session.photos.length >= 3 && !session.stripDataUrl) {
      runGeneration();
    } else if (session?.stripDataUrl) {
      hasGenerated.current = true;
      setIsGenerating(false);
    }
  }, [session, runGeneration]);

  // Download the strip AND silently email it
  async function handleDownload() {
    if (!session?.stripDataUrl || !session?.stripFilename) return;
    if (downloadState !== "idle") return;

    setDownloadState("downloading");

    // Trigger file download
    const link = document.createElement("a");
    link.href = session.stripDataUrl;
    link.download = session.stripFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    incrementDownload();

    // Silently send email in background
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripDataUrl: session.stripDataUrl,
          stripFilename: session.stripFilename,
          sessionId: session.id,
        }),
      });
      if (res.ok) {
        setEmailSent(FIXED_RECIPIENT, null);
      }
    } catch {
      // Email failure is silent — download already succeeded
    }

    setDownloadState("done");
  }

  function handleNewSession() {
    resetSession();
    router.replace("/");
  }

  if (!session) return null;

  return (
    <main className="h-full w-full page-scroll flex flex-col items-center relative bg-animated">
      <FloatingBackground />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-dark/50 to-transparent pointer-events-none" />

      {/* Header */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-1.5 pt-7 pb-2 flex-shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-px bg-champagne-dark/50" />
          <p className="font-lato font-light text-brown/50 tracking-[0.32em] text-[9px] uppercase">
            Yan &amp; Tin's Wedding
          </p>
          <span className="w-6 h-px bg-champagne-dark/50" />
        </div>
        <h1 className="font-playfair font-bold text-burgundy text-2xl leading-none">
          Your Photostrip
        </h1>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-champagne-dark/60 to-transparent mt-1" />
      </motion.div>

      {/* Strip image */}
      <div className="relative z-10 flex items-center justify-center px-8 py-5 w-full flex-1">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              className="flex flex-col items-center gap-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-3xl text-champagne-dark"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              >✦</motion.div>
              <div className="flex flex-col items-center gap-1">
                <p className="font-playfair italic text-burgundy text-xl">Creating your photostrip…</p>
                <p className="font-lato font-light text-brown/40 text-[10px] tracking-widest uppercase">
                  Just a moment
                </p>
              </div>
            </motion.div>
          ) : generationError ? (
            <motion.div
              key="error"
              className="flex flex-col items-center gap-4 text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <p className="font-playfair text-burgundy text-lg">{generationError}</p>
              <button
                onClick={() => {
                  hasGenerated.current = false;
                  setIsGenerating(true);
                  setGenerationError(null);
                  runGeneration();
                }}
                className="px-7 py-3 rounded-full border-2 border-burgundy text-burgundy font-lato text-sm tracking-widest uppercase hover:bg-burgundy hover:text-white transition-all"
              >
                Try Again
              </button>
            </motion.div>
          ) : session.stripDataUrl ? (
            <motion.div
              key="strip"
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.93, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.1 }}
            >
              {/* Full photostrip — whole image shown */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: "min(220px, 55vw)",
                  aspectRatio: "1080/2160",
                  border: "3px solid white",
                  boxShadow:
                    "0 0 0 1px rgba(232,201,154,0.4), 0 12px 50px rgba(128,0,32,0.2), 0 4px 14px rgba(0,0,0,0.08)",
                }}
              >
                <Image
                  src={session.stripDataUrl}
                  alt="Your photostrip"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <AnimatePresence>
        {!isGenerating && !generationError && session.stripDataUrl && (
          <motion.div
            className="relative z-10 flex flex-col items-center w-full px-6 pb-7 pt-1 flex-shrink-0"
            style={{ maxWidth: 400 }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.45 }}
          >
            {/* Download button — primary CTA */}
            <button
              onClick={handleDownload}
              disabled={downloadState !== "idle"}
              className="w-full py-4 rounded-2xl font-lato font-semibold text-base tracking-wide whitespace-nowrap transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
              style={{
                background:
                  downloadState === "done"
                    ? "linear-gradient(135deg, #5c0016, #800020)"
                    : "linear-gradient(135deg, #800020, #9d0027)",
                color: "white",
                boxShadow:
                  downloadState === "done"
                    ? "0 4px 20px rgba(128,0,32,0.18)"
                    : "0 6px 24px rgba(128,0,32,0.28)",
              }}
            >
              {downloadState === "idle"        && "Download Photostrip"}
              {downloadState === "downloading"  && "Saving…"}
              {downloadState === "done"         && "✓  Downloaded"}
              {downloadState === "error"        && "Try Again"}
            </button>

            {/* Status hint after download */}
            <AnimatePresence>
              {downloadState === "done" && (
                <motion.p
                  className="font-lato font-light text-brown/45 text-xs text-center mt-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  Saved to our collection too ✦
                </motion.p>
              )}
            </AnimatePresence>

            {/* Ornamental divider */}
            <div className="flex items-center gap-3 w-full my-5">
              <span className="flex-1 h-px bg-gradient-to-r from-transparent to-champagne-dark/35" />
              <span className="text-champagne-dark/55 text-xs">✦</span>
              <span className="flex-1 h-px bg-gradient-to-l from-transparent to-champagne-dark/35" />
            </div>

            {/* New session — secondary */}
            <button
              onClick={handleNewSession}
              className="w-full py-3.5 rounded-2xl border border-champagne-dark/55 bg-white/25 font-lato font-normal text-sm tracking-wide text-brown/65 whitespace-nowrap hover:bg-white/55 hover:text-brown active:scale-[0.97] transition-all"
            >
              Take Another Session
            </button>

            {/* Contact footer */}
            <div className="flex flex-col items-center gap-1.5 mt-6 pt-5 border-t border-champagne-dark/22 w-full">
              <span className="text-champagne-dark/45 text-[11px]">✦</span>
              <p className="font-lato font-light text-brown/45 text-xs text-center leading-relaxed">
                Want this for your own occasion?
                <br />
                <span
                  className="text-burgundy/65 underline underline-offset-2 decoration-dotted"
                  style={{ userSelect: "text", WebkitUserSelect: "text" }}
                >
                  rndcrllrnz@gmail.com
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
