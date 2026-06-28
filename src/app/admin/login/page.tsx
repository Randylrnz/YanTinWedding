"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { WeddingLogo } from "@/components/WeddingLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="h-full w-full flex flex-col items-center justify-center px-8"
      style={{ background: "linear-gradient(160deg, #F5F1E8 0%, #F7E7CE 60%, #F5F1E8 100%)" }}
    >
      <motion.div
        className="w-full max-w-sm flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <WeddingLogo size="md" />

        <div
          className="w-full bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-burgundy/8"
          style={{ border: "1px solid rgba(247, 231, 206, 0.8)" }}
        >
          <h2 className="font-playfair text-xl text-burgundy mb-6 text-center">Admin Access</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-lato text-xs tracking-widest text-brown uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl bg-cream border border-champagne-dark/40 font-lato text-sm text-brown placeholder:text-brown/40 focus:outline-none focus:border-burgundy transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-lato text-xs tracking-widest text-brown uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-cream border border-champagne-dark/40 font-lato text-sm text-brown placeholder:text-brown/40 focus:outline-none focus:border-burgundy transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-600 text-xs font-lato text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>
        </div>

        <a
          href="/"
          className="font-lato text-xs text-brown/50 hover:text-brown/80 tracking-widest uppercase transition-colors"
        >
          ← Back to Photobooth
        </a>
      </motion.div>
    </main>
  );
}
