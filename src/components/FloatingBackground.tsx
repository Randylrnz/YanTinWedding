"use client";

import { motion } from "framer-motion";

const blobs = [
  { left: "8%",  top: "18%", size: 180, color: "rgba(247,231,206,0.55)", dur: 14, delay: 0 },
  { left: "78%", top: "12%", size: 130, color: "rgba(232,201,154,0.35)", dur: 18, delay: 2 },
  { left: "55%", top: "68%", size: 220, color: "rgba(247,231,206,0.4)",  dur: 11, delay: 1 },
  { left: "12%", top: "72%", size: 110, color: "rgba(232,201,154,0.3)",  dur: 20, delay: 4 },
  { left: "88%", top: "55%", size: 150, color: "rgba(247,231,206,0.45)", dur: 15, delay: 3 },
  { left: "42%", top: "8%",  size: 100, color: "rgba(232,201,154,0.25)", dur: 17, delay: 6 },
];

export function FloatingBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 40% 40%, ${b.color}, transparent 70%)`,
            filter: "blur(18px)",
            transform: "translate(-50%, -50%)",
            willChange: "transform",
          }}
          animate={{
            x: [0, 28, -18, 22, -10, 0],
            y: [0, -22, 18, -14, 24, 0],
            scale: [1, 1.07, 0.94, 1.05, 0.97, 1],
          }}
          transition={{
            duration: b.dur,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop",
          }}
        />
      ))}
    </div>
  );
}
