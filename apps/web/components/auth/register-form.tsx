"use client";

import Link from "next/link";
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

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    legalAccepted,
    setLegalAccepted,
  ] = useState(false);

  function getPasswordStrength(
    value: string
  ): PasswordStrength {
    let score = 0;

    if (value.length >= 8) {
      score += 1;
    }

    if (value.length >= 12) {
      score += 1;
    }

    if (value.length >= 16) {
      score += 1;
    }

    if (/[A-Z]/.test(value)) {
      score += 1;
    }

    if (/[a-z]/.test(value)) {
      score += 1;
    }

    if (/[0-9]/.test(value)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(value)) {
      score += 1;
    }

    if (score <= 3) {
      return "Weak";
    }

    if (score <= 5) {
      return "Medium";
    }

    if (score <= 6) {
      return "Strong";
    }

    return "Very Strong";
  }

  const strength =
    getPasswordStrength(password);

  const canSubmit =
    (strength === "Strong" ||
      strength === "Very Strong") &&
    legalAccepted;

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
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const form =
        event.currentTarget;

      const formData =
        new FormData(form);

      const submittedPassword =
        formData.get("password") as string;

      const confirmPassword =
        formData.get(
          "confirmPassword"
        ) as string;

      if (
        submittedPassword !==
        confirmPassword
      ) {
        setMessage(
          "Passwords do not match."
        );

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

      if (!legalAccepted) {
        setMessage(
          "You must confirm the legal terms before creating an account."
        );

        return;
      }

      const timezone =
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone;

      const result =
        await signUpUser({
          firstName:
            formData.get(
              "firstName"
            ) as string,

          otherNames:
            (formData.get(
              "otherNames"
            ) as string) || "",

          lastName:
            formData.get(
              "lastName"
            ) as string,

          email:
            formData.get(
              "email"
            ) as string,

          password:
            submittedPassword,

          timezone,

          acceptedLegal:
            legalAccepted,
        });

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      form.reset();

      setPassword("");
      setLegalAccepted(false);

      router.push(
        "/verify-email"
      );
    } catch (error) {
      console.error(
        "Registration request failed.",
        {
          error:
            error instanceof Error
              ? error.name
              : "UnknownError",
        }
      );

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
        <span className="text-red-500">
          *
        </span>{" "}
        Fields marked are required
      </p>

      <div>
        <label className="mb-2 block text-sm font-medium">
          First Name{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <input
          name="firstName"
          required
          maxLength={80}
          autoComplete="given-name"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Other Name(s)
        </label>

        <input
          name="otherNames"
          maxLength={160}
          autoComplete="additional-name"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Last Name{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <input
          name="lastName"
          required
          maxLength={80}
          autoComplete="family-name"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Email{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Password{" "}
          <span className="text-red-500">
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
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 pr-12"
          />

          <button
            type="button"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            onClick={() =>
              setShowPassword(
                !showPassword
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

        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all ${strengthColor()}`}
              style={{
                width:
                  strengthWidth(),
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
            Use uppercase,
            lowercase, numbers and
            special characters.
          </p>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Confirm Password{" "}
          <span className="text-red-500">
            *
          </span>
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
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 pr-12"
          />

          <button
            type="button"
            aria-label={
              showConfirmPassword
                ? "Hide confirmed password"
                : "Show confirmed password"
            }
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showConfirmPassword ? (
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

      <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm leading-6 text-slate-300">
        <input
          type="checkbox"
          checked={legalAccepted}
          onChange={(event) =>
            setLegalAccepted(
              event.target.checked
            )
          }
          required
          className="mt-1 size-4 shrink-0"
        />

        <span>
          I confirm that I am at
          least 18 years old, agree
          to the{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Terms of Service
          </Link>
          , acknowledge the{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Privacy Policy
          </Link>
          , and have read the{" "}
          <Link
            href="/risk-disclosure"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Trading Risk Disclosure
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={
          loading ||
          !canSubmit
        }
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>

      {message && (
        <p
          role="status"
          className="text-center text-sm text-slate-300"
        >
          {message}
        </p>
      )}
    </form>
  );
}