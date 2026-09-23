"use server";

import { createClient } from "@/lib/supabase/server";

interface SignInInput {
  email: string;
  password: string;
  captchaToken: string;
}

export async function signInUser({
  email,
  password,
  captchaToken,
}: SignInInput) {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const normalizedCaptchaToken =
    captchaToken.trim();

  if (
    !normalizedEmail ||
    !password
  ) {
    return {
      success: false,
      message:
        "Enter your email address and password.",
    };
  }

  if (!normalizedCaptchaToken) {
    return {
      success: false,
      message:
        "Complete the security verification before signing in.",
    };
  }

  try {
    const supabase =
      await createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,

        options: {
          captchaToken:
            normalizedCaptchaToken,
        },
      });

    if (error) {
      console.error(
        "Sign-in failed.",
        {
          code: error.code,
          status: error.status,
        }
      );

      return {
        success: false,
        message:
          "We couldn't sign you in. Check your email, password, email verification status, and security verification.",
      };
    }

    return {
      success: true,
      message: "Login successful.",
    };
  } catch (error) {
    console.error(
      "Unexpected sign-in error.",
      {
        error:
          error instanceof Error
            ? error.name
            : "UnknownError",
      }
    );

    return {
      success: false,
      message:
        "We couldn't complete sign-in right now. Please try again.",
    };
  }
}