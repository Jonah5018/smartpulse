"use client";

import { useEffect } from "react";

interface SessionExpiryModalProps {
  open: boolean;
  secondsLeft: number;
  onStaySignedIn: () => void;
  onLogOut: () => void;
}

export function SessionExpiryModal({
  open,
  secondsLeft,
  onStaySignedIn,
  onLogOut,
}: SessionExpiryModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!open) return;

      if (event.key === "Escape") {
        onStaySignedIn();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onStaySignedIn]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white">
          Your session is about to expire
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          For your security, you will be signed out in{" "}
          <span className="font-semibold text-white">
            {secondsLeft}
          </span>{" "}
          seconds due to inactivity.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStaySignedIn}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            Stay Signed In
          </button>

          <button
            type="button"
            onClick={onLogOut}
            className="flex-1 rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-200 transition hover:bg-slate-900"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}