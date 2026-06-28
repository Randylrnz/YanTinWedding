"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePhotoboothStore } from "@/store/photoboothStore";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { Button } from "@/components/ui/Button";
import { WeddingLogo } from "@/components/WeddingLogo";

export default function PreviewPage() {
  const router = useRouter();
  const { session, retakeSession, setScreen, resetSession } = usePhotoboothStore();

  useEffect(() => {
    if (!session || session.photos.length < 3) {
      router.replace("/");
    }
  }, [session, router]);

  useInactivityTimer(
    60000,
    () => {
      resetSession();
      router.replace("/");
    },
    true
  );

  function handleRetake() {
    retakeSession();
    router.push("/camera");
  }

  function handleGenerate() {
    setScreen("generating");
    router.push("/strip");
  }

  if (!session || session.photos.length < 3) return null;

  return (
    <main
      className="h-full w-full flex flex-col items-center justify-between py-8 px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F5F1E8 0%, #F7E7CE 60%, #F5F1E8 100%)" }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #800020 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WeddingLogo size="sm" />
        <div className="w-40 h-px bg-gradient-to-r from-transparent via-champagne-dark to-transparent mt-2" />
        <p className="font-lato font-light text-brown tracking-[0.3em] text-xs uppercase mt-1">
          Preview Your Photos
        </p>
      </motion.div>

      {/* Photo grid */}
      <motion.div
        className="flex flex-row gap-4 items-center justify-center z-10 flex-1 py-6 w-full max-w-4xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {session.photos.map((photo, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center gap-2 flex-1 max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * index, duration: 0.5 }}
          >
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{
                aspectRatio: "16/9",
                border: "3px solid white",
                boxShadow: "0 8px 32px rgba(128, 0, 32, 0.12), 0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Image
                src={photo.dataUrl}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="font-lato font-light text-brown text-xs tracking-widest uppercase">
              Photo {index + 1}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom controls */}
      <motion.div
        className="flex flex-col items-center gap-4 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className="font-lato font-light text-brown/70 text-xs tracking-wider text-center">
          Happy with your photos? Generate your photostrip!
        </p>
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="lg" onClick={handleRetake}>
            Retake Session
          </Button>
          <Button variant="primary" size="lg" onClick={handleGenerate}>
            Generate Photostrip
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
