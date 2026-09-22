"use server";

import { getSiteUrl } from "@/lib/config/site-url";
import { createClient } from "@/lib/supabase/server";

const RESET_REQUEST_MESSAGE =
  "If an account exists for that email address, password reset instructions will be sent.";

export async function sendPasswordResetEmail(
  email: string
) {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  if (
    !normalizedEmail ||
    normalizedEmail.length > 254
  ) {
    return {
      success: true,
      message: RESET_REQUEST_MESSAGE,
    };
  }

  try {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo:
            `${getSiteUrl()}/reset-password`,
        }
      );

    if (error) {
      console.error(
        "Password reset request failed.",
        {
          code: error.code,
          status: error.status,
        }
      );

      return {
        success: false,
        message:
          "We couldn't process the password reset request right now. Please try again later.",
      };
    }

    /*
     * Deliberately generic.
     * Do not reveal whether an account exists.
     */
    return {
      success: true,
      message: RESET_REQUEST_MESSAGE,
    };
  } catch (error) {
    console.error(
      "Unexpected password reset error.",
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
        "We couldn't process the password reset request right now. Please try again later.",
    };
  }
}

export async function updatePassword(
  password: string
) {
  if (
    password.length < 8 ||
    password.length > 256
  ) {
    return {
      success: false,
      message:
        "Choose a password between 8 and 256 characters.",
    };
  }

  try {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      console.error(
        "Password update failed.",
        {
          code: error.code,
          status: error.status,
        }
      );

      return {
        success: false,
        message:
          "We couldn't update your password. Request a new reset link and try again.",
      };
    }

    return {
      success: true,
      message:
        "Password updated successfully.",
    };
  } catch (error) {
    console.error(
      "Unexpected password update error.",
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
        "We couldn't update your password right now. Please try again.",
    };
  }
}