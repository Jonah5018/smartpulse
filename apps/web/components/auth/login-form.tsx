"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { signInUser } from "@/app/actions/login";

export default function LoginForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);

    const result = await signInUser({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (!result.success) {
      setMessage(result.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Email
          <span className="text-red-500"> *</span>
        </label>

        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
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
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 pr-12"
          />

          <button
            type="button"
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
        <p className="text-center text-sm text-red-400">
          {message}
        </p>
      )}
    </form>
  );
}