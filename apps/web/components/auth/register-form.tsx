"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { signUpUser } from "@/app/actions/auth";
import {
  TurnstileWidget,
} from "@/components/auth/turnstile-widget";

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

  const [
    captchaToken,
    setCaptchaToken,
  ] = useState<string | null>(null);

  const [
    captchaResetSignal,
    setCaptchaResetSignal,
  ] = useState(0);

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

  function passwordMeetsPolicy(
    value: string
  ): boolean {
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[^A-Za-z0-9]/.test(value)
    );
  }

  const strength =
    getPasswordStrength(password);

  const validPassword =
    passwordMeetsPolicy(password);

  const canSubmit =
    validPassword &&
    legalAccepted &&
    Boolean(captchaToken);

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

    setLoading(true);
    setMessage("");

    try {
      const form =
        event.currentTarget;

      const formData =
        new FormData(form);

      const submittedPassword =
        String(
          formData.get("password") ?? ""
        );

      const confirmPassword =
        String(
          formData.get(
            "confirmPassword"
          ) ?? ""
        );

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
        !passwordMeetsPolicy(
          submittedPassword
        )
      ) {
        setMessage(
          "Password must contain at least 8 characters, including uppercase and lowercase letters, a number, and a symbol."
        );

        return;
      }

      if (!legalAccepted) {
        setMessage(
          "You must confirm the legal terms before creating an account."
        );

        return;
      }

      if (!captchaToken) {
        setMessage(
          "Complete the security verification before creating your account."
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
            String(
              formData.get(
                "firstName"
              ) ?? ""
            ),

          otherNames:
            String(
              formData.get(
                "otherNames"
              ) ?? ""
            ),

          lastName:
            String(
              formData.get(
                "lastName"
              ) ?? ""
            ),

          email:
            String(
              formData.get(
                "email"
              ) ?? ""
            ),

          password:
            submittedPassword,

          timezone,

          acceptedLegal:
            legalAccepted,

          captchaToken,
        });

      if (!result.success) {
        setMessage(result.message);

        resetCaptcha();

        return;
      }

      form.reset();

      setPassword("");
      setLegalAccepted(false);
      setCaptchaToken(null);

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

      resetCaptcha();

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
        <label
          htmlFor="firstName"
          className="mb-2 block text-sm font-medium"
        >
          First Name{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <input
          id="firstName"
          name="firstName"
          required
          maxLength={80}
          autoComplete="given-name"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label
          htmlFor="otherNames"
          className="mb-2 block text-sm font-medium"
        >
          Other Name(s)
        </label>

        <input
          id="otherNames"
          name="otherNames"
          maxLength={160}
          autoComplete="additional-name"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label
          htmlFor="lastName"
          className="mb-2 block text-sm font-medium"
        >
          Last Name{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <input
          id="lastName"
          name="lastName"
          required
          maxLength={80}
          autoComplete="family-name"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label
          htmlFor="registerEmail"
          className="mb-2 block text-sm font-medium"
        >
          Email{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <input
          id="registerEmail"
          type="email"
          name="email"
          required
          maxLength={254}
          autoComplete="email"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      <div>
        <label
          htmlFor="registerPassword"
          className="mb-2 block text-sm font-medium"
        >
          Password{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <div className="relative">
          <input
            id="registerPassword"
            type={
              showPassword
                ? "text"
                : "password"
            }
            name="password"
            required
            minLength={8}
            maxLength={256}
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
            Use at least 8 characters
            with uppercase and lowercase
            letters, a number, and a
            symbol.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium"
        >
          Confirm Password{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <div className="relative">
          <input
            id="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            name="confirmPassword"
            required
            minLength={8}
            maxLength={256}
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
            aria-pressed={
              showConfirmPassword
            }
            onClick={() =>
              setShowConfirmPassword(
                (value) => !value
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

      <div>
        <TurnstileWidget
          onTokenChange={
            setCaptchaToken
          }
          resetSignal={
            captchaResetSignal
          }
        />
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