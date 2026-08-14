"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { SessionExpiryModal } from "@/components/auth/session-expiry-modal";

const INACTIVITY_TIMEOUT_MS = 14 * 60 * 1000;
const WARNING_DURATION_MS = 60 * 1000;
const KEEP_ALIVE_INTERVAL_MS = 4 * 60 * 1000;

export function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();

  const supabaseRef = useRef(createClient());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [hasActivity, setHasActivity] = useState(true);

  const clearTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    if (warningCountdownRef.current) {
      clearInterval(warningCountdownRef.current);
      warningCountdownRef.current = null;
    }

    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  const signOutAndRedirect = useCallback(async () => {
    clearTimers();
    setWarningOpen(false);

    try {
      await supabaseRef.current.auth.signOut();
    } finally {
      const returnTo = encodeURIComponent(pathname || "/dashboard");
      router.push(`/login?returnTo=${returnTo}`);
      router.refresh();
    }
  }, [clearTimers, pathname, router]);

  const startWarningCountdown = useCallback(() => {
    setWarningOpen(true);
    setSecondsLeft(60);

    warningCountdownRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearTimers();
          void signOutAndRedirect();
          return 0;
        }

        return current - 1;
      });
    }, 1000);
  }, [clearTimers, signOutAndRedirect]);

  const startInactivityTimer = useCallback(() => {
    if (document.visibilityState === "hidden") {
      return;
    }

    if (!hasActivity) {
      return;
    }

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      startWarningCountdown();
    }, INACTIVITY_TIMEOUT_MS);
  }, [hasActivity, startWarningCountdown]);

  const registerActivity = useCallback(() => {
    setHasActivity(true);

    if (warningOpen) {
      return;
    }

    startInactivityTimer();
  }, [startInactivityTimer, warningOpen]);

  const handleStaySignedIn = useCallback(async () => {
    clearTimers();
    setWarningOpen(false);
    setSecondsLeft(60);

    try {
      await supabaseRef.current.auth.refreshSession();
    } finally {
      startInactivityTimer();
    }
  }, [clearTimers, startInactivityTimer]);

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ] as const;

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        registerActivity();
      }
    };

    events.forEach((event) =>
      window.addEventListener(event, registerActivity, { passive: true })
    );

    document.addEventListener("visibilitychange", onVisibilityChange);

    startInactivityTimer();

    keepAliveIntervalRef.current = setInterval(async () => {
      if (!warningOpen && hasActivity) {
        try {
          await supabaseRef.current.auth.refreshSession();
        } catch {
          // Keep-alive should never break the UI.
        }
      }
    }, KEEP_ALIVE_INTERVAL_MS);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, registerActivity)
      );
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimers();
    };
  }, [clearTimers, hasActivity, registerActivity, startInactivityTimer, warningOpen]);

  return (
    <SessionExpiryModal
      open={warningOpen}
      secondsLeft={secondsLeft}
      onStaySignedIn={handleStaySignedIn}
      onLogOut={signOutAndRedirect}
    />
  );
}