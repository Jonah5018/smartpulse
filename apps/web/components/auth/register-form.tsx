"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signUpUser } from "@/app/actions/auth";

type PasswordStrength =
  | "Weak"
  | "Medium"
  | "Strong"
  | "Very Strong";

export default function RegisterForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  function getPasswordStrength(
    password: string
  ): PasswordStrength {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 3) return "Weak";
    if (score <= 5) return "Medium";
    if (score <= 6) return "Strong";

    return "Very Strong";
  }

  const strength = getPasswordStrength(password);

  const canSubmit =
    strength === "Strong" ||
    strength === "Very Strong";

  function strengthWidth() {
    switch (strength) {
      case "Weak":
        return "25%";

      case "Medium":
        return "50%";

      case "Strong":
        return "75%";

      case "Very Strong":
        return "100%";
    }
  }

  function strengthColor() {
    switch (strength) {
      case "Weak":
        return "bg-red-500";

      case "Medium":
        return "bg-yellow-500";

      case "Strong":
        return "bg-blue-500";

      case "Very Strong":
        return "bg-green-500";
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const password =
        formData.get("password") as string;

      const confirmPassword =
        formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }

      if (
        strength !== "Strong" &&
        strength !== "Very Strong"
      ) {
        setMessage(
          "Password must be Strong or Very Strong."
        );
        return;
      }

      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

      const result = await signUpUser({
        firstName: formData.get("firstName") as string,
        otherNames:
          (formData.get("otherNames") as string) || "",
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        password,
        timezone,
      });

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      form.reset();
      setPassword("");

      router.push("/verify-email");
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong. Please try again."
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
      <p className="text-xs text-slate-400">
        <span className="text-red-500">*</span>{" "}
        Fields marked are required
      </p>

      <div>
        <label className="mb-2 block text-sm font-medium">
          First Name{" "}
          <span className="text-red-500">*</span>
        </label>

        <input
          name="firstName"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Other Name(s)
        </label>

        <input
          name="otherNames"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Last Name{" "}
          <span className="text-red-500">*</span>
        </label>

        <input
          name="lastName"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Email{" "}
          <span className="text-red-500">*</span>
        </label>

        <input
          type="email"
          name="email"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Password{" "}
          <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            minLength={8}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 pr-12"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
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

        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all ${strengthColor()}`}
              style={{
                width: strengthWidth(),
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Strength:
            <span className="ml-1 font-medium">
              {" "}
              {strength}
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Use uppercase, lowercase, numbers and
            special characters.
          </p>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Confirm Password{" "}
          <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <input
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            name="confirmPassword"
            required
            minLength={8}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 pr-12"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showConfirmPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Creating Account..."
          : "Start Free Trial"}
      </button>

      {message && (
        <p className="text-center text-sm text-slate-300">
          {message}
        </p>
      )}
    </form>
  );
}