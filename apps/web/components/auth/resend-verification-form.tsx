"use client";

import { useState } from "react";

import {
  resendVerificationEmail,
} from "@/app/actions/verification";

export function ResendVerificationForm() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result =
        await resendVerificationEmail(
          email
        );

      setMessage(result.message);
    } catch {
      setMessage(
        "We couldn't resend the verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="verification-email"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Email address
        </label>

        <input
          id="verification-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl border border-slate-700 px-5 py-3 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Sending..."
          : "Resend verification email"}
      </button>

      {message && (
        <p
          role="status"
          className="text-sm leading-6 text-slate-400"
        >
          {message}
        </p>
      )}
    </form>
  );
}