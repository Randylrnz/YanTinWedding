"use client";

import { useEffect, useRef, useCallback } from "react";

export function useInactivityTimer(
  timeoutMs: number,
  onTimeout: () => void,
  enabled = true
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, timeoutMs);
  }, [enabled, onTimeout, timeoutMs]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "click"];
    const handleActivity = () => reset();

    events.forEach((e) => window.addEventListener(e, handleActivity));
    reset(); // start timer immediately

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      stop();
    };
  }, [enabled, reset, stop]);

  return { reset, stop };
}
