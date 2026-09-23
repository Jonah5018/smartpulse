"use client";

import Link from "next/link";
import { useState } from "react";

import {
  sendPasswordResetEmail,
} from "@/app/actions/password";

import {
  TurnstileWidget,
} from "@/components/auth/turnstile-widget";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

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
        "Complete the security verification before requesting a reset link."
      );

      return;
    }

    setLoading(true);

    try {
      const result =
        await sendPasswordResetEmail(
          email,
          captchaToken
        );

      setMessage(result.message);

      /*
       * Turnstile tokens are single use.
       * Always request a fresh challenge
       * after the password reset request.
       */
      resetCaptcha();
    } catch (error) {
      console.error(
        "Password reset request failed.",
        {
          error:
            error instanceof Error
              ? error.name
              : "UnknownError",
        }
      );

      resetCaptcha();

      setMessage(
        "We couldn't process the password reset request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="forgot-password-email"
            className="mb-2 block text-sm font-medium"
          >
            Email
          </label>

          <Input
            id="forgot-password-email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            placeholder="you@example.com"
          />
        </div>

        <TurnstileWidget
          onTokenChange={
            setCaptchaToken
          }
          resetSignal={
            captchaResetSignal
          }
        />

        <Button
          type="submit"
          disabled={
            loading ||
            !captchaToken
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </Button>
      </form>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className="text-center text-sm text-slate-300"
        >
          {message}
        </p>
      )}

      <div className="border-t border-slate-800 pt-6 text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-blue-500 hover:text-blue-400"
        >
          Back to Login
        </Link>
      </div>
    </>
  );
}