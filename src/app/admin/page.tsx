"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WeddingLogo } from "@/components/WeddingLogo";
import { Button } from "@/components/ui/Button";

interface Session {
  id: string;
  filename: string | null;
  drive_file_id: string | null;
  drive_web_url: string | null;
  email: string | null;
  guest_name: string | null;
  downloaded: number;
  email_sent: number;
  created_at: number;
  completed_at: number | null;
}

interface Stats {
  total: number;
  downloads: number;
  emails: number;
  driveUploaded: number;
  peakHour: string | null;
}

function formatTs(ts: number) {
  return new Date(ts).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gallery" | "analytics" | "drive">("gallery");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessRes, statsRes] = await Promise.all([
        fetch("/api/admin/sessions"),
        fetch("/api/admin/stats"),
      ]);

      if (sessRes.status === 401 || statsRes.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (sessRes.ok) setSessions((await sessRes.json()).sessions);
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {
      router.replace("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main className="h-full w-full flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="text-4xl text-champagne-dark"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            ✦
          </motion.div>
          <p className="font-lato font-light text-brown text-sm tracking-widest uppercase">
            Loading…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full w-full flex flex-col overflow-auto bg-cream">
      {/* Top bar */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b"
        style={{ background: "#800020", borderColor: "#9d0027" }}
      >
        <WeddingLogo size="sm" className="brightness-0 invert" />
        <div className="flex items-center gap-4">
          <span className="font-lato font-light text-white/70 text-xs tracking-widest uppercase">
            Admin Dashboard
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white/70 border-white/20 hover:border-white/50 hover:bg-white/10"
          >
            Sign Out
          </Button>
          <a
            href="/"
            className="font-lato text-xs text-white/50 hover:text-white/80 tracking-widest uppercase transition-colors"
          >
            ← Photobooth
          </a>
        </div>
      </header>

      <div className="flex-1 px-8 py-6 max-w-7xl mx-auto w-full">
        {/* Tab navigation */}
        <div className="flex gap-1 mb-6 bg-champagne rounded-2xl p-1 w-fit">
          {(["gallery", "analytics", "drive"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-lato text-xs tracking-widest uppercase transition-all ${
                activeTab === tab
                  ? "bg-burgundy text-white shadow"
                  : "text-brown hover:text-burgundy"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-playfair text-2xl text-burgundy">
                Photo Sessions
              </h2>
              <Button variant="ghost" size="sm" onClick={fetchData}>
                Refresh
              </Button>
            </div>

            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="text-4xl text-champagne-dark">✦</div>
                <p className="font-lato font-light text-brown text-sm tracking-wider">
                  No sessions yet. Photos will appear here once guests start using the photobooth.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-champagne">
                <table className="w-full bg-white">
                  <thead>
                    <tr className="border-b border-champagne bg-cream">
                      <th className="text-left px-4 py-3 font-lato text-xs tracking-widest uppercase text-brown">
                        Timestamp
                      </th>
                      <th className="text-left px-4 py-3 font-lato text-xs tracking-widest uppercase text-brown">
                        Filename
                      </th>
                      <th className="text-left px-4 py-3 font-lato text-xs tracking-widest uppercase text-brown">
                        Guest
                      </th>
                      <th className="text-center px-4 py-3 font-lato text-xs tracking-widest uppercase text-brown">
                        DL
                      </th>
                      <th className="text-center px-4 py-3 font-lato text-xs tracking-widest uppercase text-brown">
                        Email
                      </th>
                      <th className="text-center px-4 py-3 font-lato text-xs tracking-widest uppercase text-brown">
                        Drive
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr
                        key={s.id}
                        className={`border-b border-champagne/50 hover:bg-cream/50 transition-colors ${
                          i % 2 === 0 ? "" : "bg-champagne/20"
                        }`}
                      >
                        <td className="px-4 py-3 font-lato text-xs text-brown">
                          {formatTs(s.created_at)}
                        </td>
                        <td className="px-4 py-3 font-lato text-xs text-brown/70 max-w-[180px] truncate">
                          {s.filename ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-lato text-xs text-brown">
                          {s.guest_name ? (
                            <div>
                              <div>{s.guest_name}</div>
                              <div className="text-brown/50">{s.email}</div>
                            </div>
                          ) : s.email ? (
                            <span className="text-brown/70">{s.email}</span>
                          ) : (
                            <span className="text-brown/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.downloaded ? (
                            <span className="text-green-600 text-sm">✓</span>
                          ) : (
                            <span className="text-brown/20 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.email_sent ? (
                            <span className="text-green-600 text-sm">✓</span>
                          ) : (
                            <span className="text-brown/20 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.drive_web_url ? (
                            <a
                              href={s.drive_web_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-lato text-xs text-burgundy underline hover:no-underline"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-brown/20 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && stats && (
          <div className="flex flex-col gap-6">
            <h2 className="font-playfair text-2xl text-burgundy">Analytics</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Sessions", value: stats.total, icon: "📸" },
                { label: "Downloads", value: stats.downloads, icon: "⬇️" },
                { label: "Emails Sent", value: stats.emails, icon: "✉️" },
                { label: "Drive Uploads", value: stats.driveUploaded, icon: "☁️" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-6 border border-champagne flex flex-col items-center gap-2"
                >
                  <span className="text-3xl">{stat.icon}</span>
                  <span className="font-playfair text-4xl text-burgundy font-bold">
                    {stat.value}
                  </span>
                  <span className="font-lato text-xs tracking-widest uppercase text-brown/70 text-center">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {stats.peakHour && (
              <div className="bg-white rounded-2xl p-6 border border-champagne flex items-center gap-4">
                <span className="text-3xl">⏰</span>
                <div>
                  <p className="font-playfair text-xl text-burgundy">
                    Most Active Hour: {stats.peakHour}:00 — {stats.peakHour}:59
                  </p>
                  <p className="font-lato font-light text-brown text-sm mt-1">
                    Based on local session timestamps
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-champagne">
                <p className="font-lato text-xs tracking-widest uppercase text-brown/60 mb-3">
                  Download Rate
                </p>
                <p className="font-playfair text-3xl text-burgundy">
                  {stats.total > 0
                    ? `${Math.round((stats.downloads / stats.total) * 100)}%`
                    : "—"}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-champagne">
                <p className="font-lato text-xs tracking-widest uppercase text-brown/60 mb-3">
                  Email Capture Rate
                </p>
                <p className="font-playfair text-3xl text-burgundy">
                  {stats.total > 0
                    ? `${Math.round((stats.emails / stats.total) * 100)}%`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Drive Tab */}
        {activeTab === "drive" && stats && (
          <div className="flex flex-col gap-6">
            <h2 className="font-playfair text-2xl text-burgundy">
              Google Drive Monitoring
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-champagne flex items-start gap-4">
                <div
                  className={`w-3 h-3 rounded-full mt-1 ${
                    process.env.NEXT_PUBLIC_DRIVE_CONFIGURED === "true"
                      ? "bg-green-400"
                      : "bg-yellow-400"
                  }`}
                />
                <div>
                  <p className="font-lato text-xs tracking-widest uppercase text-brown/60 mb-1">
                    Drive Status
                  </p>
                  <p className="font-playfair text-lg text-burgundy">
                    {stats.driveUploaded > 0 ? "Connected & Active" : "Configured"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-champagne">
                <p className="font-lato text-xs tracking-widest uppercase text-brown/60 mb-1">
                  Upload Success Rate
                </p>
                <p className="font-playfair text-3xl text-burgundy">
                  {stats.total > 0
                    ? `${Math.round((stats.driveUploaded / stats.total) * 100)}%`
                    : "—"}
                </p>
                <p className="font-lato text-xs text-brown/50 mt-1">
                  {stats.driveUploaded} of {stats.total} uploaded
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-champagne">
                <p className="font-lato text-xs tracking-widest uppercase text-brown/60 mb-1">
                  Folder Structure
                </p>
                <div className="font-lato text-xs text-brown/80 leading-relaxed">
                  <p>Wedding Photobooth /</p>
                  <p className="pl-3">#YanIsFinallyForTin /</p>
                  <p className="pl-6">YYYY-MM-DD /</p>
                  <p className="pl-9 text-brown/50">Strip_*.png</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-champagne overflow-hidden">
              <div className="px-6 py-4 border-b border-champagne bg-cream">
                <h3 className="font-lato text-xs tracking-widest uppercase text-brown">
                  Recent Upload Log
                </h3>
              </div>
              <div className="divide-y divide-champagne/50 max-h-72 overflow-y-auto">
                {sessions
                  .filter((s) => s.filename)
                  .slice(0, 20)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-4 px-6 py-3"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          s.drive_file_id ? "bg-green-400" : "bg-red-300"
                        }`}
                      />
                      <span className="font-lato text-xs text-brown/70 flex-1 truncate">
                        {s.filename}
                      </span>
                      <span className="font-lato text-xs text-brown/40">
                        {formatTs(s.created_at)}
                      </span>
                      {s.drive_web_url && (
                        <a
                          href={s.drive_web_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-lato text-xs text-burgundy underline hover:no-underline"
                        >
                          View
                        </a>
                      )}
                    </div>
                  ))}
                {sessions.filter((s) => s.filename).length === 0 && (
                  <div className="px-6 py-8 text-center font-lato text-xs text-brown/40">
                    No uploads yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
