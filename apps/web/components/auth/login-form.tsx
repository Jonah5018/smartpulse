"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signInUser } from "@/app/actions/login";
import { loginDestination } from "@/lib/auth/login-destination";

export default function LoginForm() {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signInUser({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      // Load the protected page using the newly written session cookies.
      window.location.assign(loginDestination(new URLSearchParams(window.location.search).get("returnTo")));
    } catch {
      setMessage("We couldn't complete sign-in. Please check your connection and try again. If this continues, reload this page.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label htmlFor="login-email" className="mb-2 block text-sm font-medium">
          Email
          <span className="text-red-500"> *</span>
        </label>

        <input
          type="email"
          id="login-email"
          autoComplete="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="mb-2 block text-sm font-medium">
          Password
          <span className="text-red-500"> *</span>
        </label>

        <div className="relative">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            name="password"
            id="login-password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 pr-12"
          />

          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {loading
          ? "Signing In..."
          : "Sign In"}
      </button>

      {message && (
        <p role="alert" className="text-center text-sm text-red-400">
          {message}
        </p>
      )}
    </form>
  );
}
