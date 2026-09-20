"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
      className="rounded-lg border border-slate-800 p-2 hover:bg-slate-900"
    >
      <Sun size={18} className="hidden dark:block" aria-hidden="true" />
      <Moon size={18} className="block dark:hidden" aria-hidden="true" />
    </button>
  );
}
