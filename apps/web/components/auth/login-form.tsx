"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { signInUser } from "@/app/actions/login";
import {
  TurnstileWidget,
} from "@/components/auth/turnstile-widget";
import {
  loginDestination,
} from "@/lib/auth/login-destination";

export default function LoginForm() {
  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    captchaToken,
    setCaptchaToken,
  ] = useState<string | null>(null);

  const [
    captchaResetSignal,
    setCaptchaResetSignal,
  ] = useState(0);

  function resetCaptcha() {
    setCaptchaToken(null);

    setCaptchaResetSignal(
      (value) => value + 1
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setMessage("");

    if (!captchaToken) {
      setMessage(
        "Complete the security verification before signing in."
      );

      return;
    }

    setLoading(true);

    const formData =
      new FormData(
        event.currentTarget
      );

    try {
      const result =
        await signInUser({
          email:
            String(
              formData.get(
                "email"
              ) ?? ""
            ).trim(),

          password:
            String(
              formData.get(
                "password"
              ) ?? ""
            ),

          captchaToken,
        });

      if (!result.success) {
        setMessage(result.message);

        resetCaptcha();

        return;
      }

      const returnTo =
        new URLSearchParams(
          window.location.search
        ).get("returnTo");

      window.location.assign(
        loginDestination(
          returnTo
        )
      );
    } catch (error) {
      console.error(
        "Login request failed.",
        {
          error:
            error instanceof Error
              ? error.name
              : "UnknownError",
        }
      );

      resetCaptcha();

      setMessage(
        "We couldn't complete sign-in. Please check your connection and try again. If this continues, reload this page."
      );
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
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-medium"
        >
          Email
          <span className="text-red-500">
            {" "}
            *
          </span>
        </label>

        <input
          type="email"
          id="login-email"
          name="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-medium"
        >
          Password
          <span className="text-red-500">
            {" "}
            *
          </span>
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
            maxLength={256}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 pr-12"
          />

          <button
            type="button"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={
              showPassword
            }
            onClick={() =>
              setShowPassword(
                (value) => !value
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showPassword ? (
              <EyeOff
                size={18}
                aria-hidden="true"
              />
            ) : (
              <Eye
                size={18}
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </div>

      <TurnstileWidget
        onTokenChange={
          setCaptchaToken
        }
        resetSignal={
          captchaResetSignal
        }
      />

      <button
        type="submit"
        disabled={
          loading ||
          !captchaToken
        }
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Signing In..."
          : "Sign In"}
      </button>

      {message && (
        <p
          role="alert"
          aria-live="polite"
          className="text-center text-sm text-red-400"
        >
          {message}
        </p>
      )}
    </form>
  );
}