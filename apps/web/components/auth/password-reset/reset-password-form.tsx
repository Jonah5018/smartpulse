"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { updatePassword } from "@/app/actions/password";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    const result =
      await updatePassword(password);

    setLoading(false);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    router.replace("/login");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          New Password
        </label>

        <Input
          type="password"
          required
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Confirm Password
        </label>

        <Input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
        />
      </div>

      {message && (
        <p className="text-sm text-red-400">
          {message}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {loading
          ? "Updating..."
          : "Update Password"}
      </Button>
    </form>
  );
}