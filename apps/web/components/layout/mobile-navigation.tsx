"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { AppNavigation } from "./app-sidebar";

export function MobileNavigation() {
  const dialog = useRef<HTMLDialogElement>(null);
  const previousOverflow = useRef<string | null>(null);
  const [open, setOpen] = useState(false);

  function restoreScrolling() {
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
  }

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialog.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      restoreScrolling();
    };
  }, []);

  return (
    <div className="shrink-0 lg:hidden">
      <button type="button" aria-label="Open navigation" aria-haspopup="dialog" aria-expanded={open}
        onClick={() => {
          dialog.current?.showModal();
          previousOverflow.current = document.body.style.overflow;
          document.body.style.overflow = "hidden";
          setOpen(true);
        }}
        className="flex size-10 items-center justify-center rounded-lg border border-slate-800 hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-blue-500">
        <Menu size={20} aria-hidden="true" />
      </button>
      <dialog ref={dialog} aria-labelledby="mobile-navigation-title"
        onClose={() => { restoreScrolling(); setOpen(false); }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-80 max-w-[calc(100vw-2rem)] overflow-y-auto border-r border-slate-800 bg-slate-950 p-0 text-slate-100 backdrop:bg-black/60 lg:hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 p-4">
          <h2 id="mobile-navigation-title" className="font-bold">SmartPulse</h2>
          <button type="button" aria-label="Close navigation" onClick={() => dialog.current?.close()}
            className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-blue-500">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <AppNavigation onNavigate={() => dialog.current?.close()} />
      </dialog>
    </div>
  );
}
