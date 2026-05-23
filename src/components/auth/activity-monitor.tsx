"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
const WARN_THRESHOLD_MS = 28 * 60 * 1000;

export default function ActivityMonitor({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const lastTouchRef = useRef<number>(Date.now());
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const doLogout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [clearTimers, router]);

  const resetTimers = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setCountdown(120);
    lastTouchRef.current = Date.now();

    warnTimerRef.current = setTimeout(() => {
      setShowWarning(true);

      let remaining = 120;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
        }
      }, 1000);
    }, WARN_THRESHOLD_MS);

    logoutTimerRef.current = setTimeout(() => {
      doLogout();
    }, INACTIVITY_LIMIT_MS);
  }, [clearTimers, doLogout]);

  useEffect(() => {
    resetTimers();

    const handleActivity = () => {
      lastTouchRef.current = Date.now();
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));

    const resetInterval = setInterval(() => {
      const elapsed = Date.now() - lastTouchRef.current;
      if (elapsed < WARN_THRESHOLD_MS / 2) {
        resetTimers();
      }
    }, 60 * 1000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearInterval(resetInterval);
      clearTimers();
    };
  }, [resetTimers, clearTimers]);

  const handleStayLoggedIn = () => {
    resetTimers();
  };

  const handleLogoutNow = () => {
    doLogout();
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <>
      {children}

      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-high border border-outline-variant p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-3 mb-6">
              <span className="material-symbols-outlined text-warning text-[28px]">
                timer_off
              </span>
              <div>
                <h3 className="font-sans text-[18px] leading-6 font-bold text-on-surface mb-1">
                  Session Expiring
                </h3>
                <p className="font-sans text-[14px] leading-5 text-on-surface-variant">
                  You have been inactive. Your session will end in{" "}
                  <span className="font-mono font-bold text-warning">
                    {minutes}:{String(seconds).padStart(2, "0")}
                  </span>
                  . Stay logged in?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 h-12 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                STAY LOGGED IN
              </button>
              <button
                onClick={handleLogoutNow}
                className="flex-1 h-12 bg-surface border border-outline text-error font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:bg-error/5 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                LOGOUT NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
