"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotoboothStore } from "@/store/photoboothStore";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { Button } from "@/components/ui/Button";
import { WeddingLogo } from "@/components/WeddingLogo";

type EmailState = "form" | "sending" | "success" | "error";

export default function EmailPage() {
  const router = useRouter();
  const { session, setEmailSent, resetSession } = usePhotoboothStore();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailState, setEmailState] = useState<EmailState>("form");
  const [errorMsg, setErrorMsg] = useState("");

  useInactivityTimer(
    60000,
    () => {
      resetSession();
      router.replace("/");
    },
    emailState === "form"
  );

  async function handleSend() {
    if (!email.trim() || !session?.stripDataUrl) return;

    setEmailState("sending");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          stripDataUrl: session.stripDataUrl,
          stripFilename: session.stripFilename,
          sessionId: session.id,
        }),
      });

      if (res.ok) {
        setEmailSent(email.trim(), name.trim() || null);
        setEmailState("success");
      } else {
        const data = await res.json();
        setErrorMsg(data.error ?? "Failed to send email. Please try again.");
        setEmailState("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setEmailState("error");
    }
  }

  function handleFinish() {
    resetSession();
    router.replace("/");
  }

  function handleSkip() {
    router.push("/strip");
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <main
      className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden px-8"
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

      <div className="flex flex-col items-center gap-8 z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WeddingLogo size="sm" />
        </motion.div>

        {/* Content card */}
        <motion.div
          className="w-full bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-burgundy/8"
          style={{ border: "1px solid rgba(247, 231, 206, 0.8)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <AnimatePresence mode="wait">
            {/* Form state */}
            {emailState === "form" && (
              <motion.div
                key="form"
                className="flex flex-col gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <h2 className="font-playfair text-2xl text-burgundy text-center">
                    Want a copy sent to your email?
                  </h2>
                  <p className="font-lato font-light text-brown text-sm text-center tracking-wide">
                    We&apos;ll send your photostrip straight to your inbox.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-lato text-xs tracking-widest text-brown uppercase">
                      Email Address <span className="text-burgundy">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-cream border border-champagne-dark/40 font-lato text-sm text-brown placeholder:text-brown/40 focus:outline-none focus:border-burgundy transition-colors"
                      autoComplete="email"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-lato text-xs tracking-widest text-brown uppercase">
                      Your Name <span className="text-brown/40">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maria Santos"
                      className="w-full px-4 py-3 rounded-xl bg-cream border border-champagne-dark/40 font-lato text-sm text-brown placeholder:text-brown/40 focus:outline-none focus:border-burgundy transition-colors"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSend}
                    disabled={!isValidEmail}
                    className="w-full"
                  >
                    Send Photo
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleSkip}
                    className="w-full"
                  >
                    Skip
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Sending state */}
            {emailState === "sending" && (
              <motion.div
                key="sending"
                className="flex flex-col items-center gap-6 py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="text-4xl text-champagne-dark"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  ✦
                </motion.div>
                <p className="font-playfair italic text-burgundy text-xl text-center">
                  Sending your photostrip…
                </p>
              </motion.div>
            )}

            {/* Success state */}
            {emailState === "success" && (
              <motion.div
                key="success"
                className="flex flex-col items-center gap-6 py-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-burgundy flex items-center justify-center text-champagne text-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                >
                  ✓
                </motion.div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h3 className="font-playfair text-2xl text-burgundy">
                    Email sent!
                  </h3>
                  <p className="font-lato font-light text-brown text-sm">
                    Your photostrip is on its way to{" "}
                    <span className="font-normal text-burgundy">{email}</span>
                  </p>
                  <p className="font-lato font-light text-brown/60 text-xs">
                    Thank you for celebrating with Yan & Tin!
                  </p>
                </div>
                <Button variant="primary" size="lg" onClick={handleFinish}>
                  Done
                </Button>
              </motion.div>
            )}

            {/* Error state */}
            {emailState === "error" && (
              <motion.div
                key="error"
                className="flex flex-col items-center gap-5 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-14 h-14 rounded-full border-2 border-red-300 flex items-center justify-center text-red-500 text-xl">
                  ✕
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h3 className="font-playfair text-xl text-burgundy">
                    Couldn&apos;t send email
                  </h3>
                  <p className="font-lato font-light text-brown text-sm">{errorMsg}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setEmailState("form")}
                  >
                    Try Again
                  </Button>
                  <Button variant="ghost" size="md" onClick={handleFinish}>
                    Skip
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
