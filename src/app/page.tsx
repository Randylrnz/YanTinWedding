"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePhotoboothStore } from "@/store/photoboothStore";
import { FloatingBackground } from "@/components/FloatingBackground";

export default function WelcomePage() {
  const router = useRouter();
  const { startSession, resetSession } = usePhotoboothStore();

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  function handleStart() {
    startSession();
    router.push("/camera");
  }

  return (
    <main className="h-full w-full flex flex-col items-center justify-between relative overflow-hidden bg-animated">
      <FloatingBackground />

      {/* Top + bottom accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-dark/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-dark/60 to-transparent pointer-events-none" />

      {/* Corner flourishes */}
      <div className="absolute top-5 left-5 text-champagne-dark/40 text-lg pointer-events-none select-none">✦</div>
      <div className="absolute top-5 right-5 text-champagne-dark/40 text-lg pointer-events-none select-none">✦</div>
      <div className="absolute bottom-12 left-5 text-champagne-dark/40 text-lg pointer-events-none select-none">✦</div>
      <div className="absolute bottom-12 right-5 text-champagne-dark/40 text-lg pointer-events-none select-none">✦</div>

      {/* Spacer top */}
      <div className="flex-1" />

      {/* Main content */}
      <motion.div
        className="flex flex-col items-center gap-5 z-10 w-full max-w-xs px-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Label */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="w-8 h-px bg-champagne-dark/60" />
          <span className="font-lato font-light text-brown/60 tracking-[0.35em] text-[10px] uppercase">
            Wedding Photobooth
          </span>
          <span className="w-8 h-px bg-champagne-dark/60" />
        </motion.div>

        {/* Names */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <h1 className="font-playfair font-bold text-burgundy leading-none text-5xl sm:text-6xl">
            Yan <span className="text-champagne-dark text-4xl sm:text-5xl">♥</span> Tin
          </h1>
          <p className="font-lato font-light tracking-[0.22em] text-brown/50 text-[10px] mt-0.5">
            #YanIsFinallyForTin
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-full h-px bg-gradient-to-r from-transparent via-champagne-dark/55 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />

        {/* Date & tagline */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-lato font-light text-brown/55 tracking-[0.3em] text-[10px] uppercase">
            July 5, 2026
          </p>
          <p className="font-lato font-light text-brown/65 text-sm text-center leading-relaxed">
            Capture a beautiful memory with us.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={handleStart}
          className="mt-1 w-full py-4 rounded-full bg-burgundy text-white font-lato font-semibold text-base tracking-wide shadow-lg shadow-burgundy/25 hover:bg-burgundy-dark active:scale-[0.97] transition-all duration-200 whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.97 }}
        >
          Begin
        </motion.button>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer contact */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-1 pb-6 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-champagne-dark/40 to-transparent mb-2" />
        <p className="font-lato font-light text-brown/40 text-[10px] tracking-wide text-center leading-relaxed">
          Want this for your own occasion?{" "}
          <span
            className="text-burgundy/50 underline underline-offset-2 decoration-dotted"
            style={{ userSelect: "text", WebkitUserSelect: "text" }}
          >
            rndcrllrnz@gmail.com
          </span>
        </p>
      </motion.div>
    </main>
  );
}
