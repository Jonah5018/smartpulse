"use client";

import { useState } from "react";

import Link from "next/link";

import { sendPasswordResetEmail } from "@/app/actions/password";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const result =
      await sendPasswordResetEmail(email);

    setMessage(result.message);

    setLoading(false);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Email
          </label>

          <Input
            type="email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="you@example.com"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </Button>
      </form>

      {message && (
        <p className="text-center text-sm text-slate-300">
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