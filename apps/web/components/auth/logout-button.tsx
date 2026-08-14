"use client";

import { LogOut } from "lucide-react";
import { signOutUser } from "@/app/actions/logout";

export function LogoutButton() {
  return (
    <form action={signOutUser}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
      >
        <LogOut size={16} />
        Logout
      </button>
    </form>
  );
}