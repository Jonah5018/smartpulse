"use server";

import { getSiteUrl } from "@/lib/config/site-url";
import { createClient } from "@/lib/supabase/server";

const RESET_REQUEST_MESSAGE =
  "If an account exists for that email address, password reset instructions will be sent.";

function passwordMeetsPolicy(
  password: string
): boolean {
  return (
    password.length >= 8 &&
    password.length <= 256 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function sendPasswordResetEmail(
  email: string,
  captchaToken: string
) {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const normalizedCaptchaToken =
    captchaToken.trim();

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /*
   * Keep malformed or unknown email responses generic
   * so the endpoint does not reveal account existence.
   */
  if (
    !normalizedEmail ||
    normalizedEmail.length > 254 ||
    !emailPattern.test(normalizedEmail)
  ) {
    return {
      success: true,
      message: RESET_REQUEST_MESSAGE,
    };
  }

  /*
   * CAPTCHA failure is safe to expose because it does
   * not reveal whether the email belongs to an account.
   */
  if (!normalizedCaptchaToken) {
    return {
      success: false,
      message:
        "Complete the security verification before requesting a reset link.",
    };
  }

  try {
    const supabase =
      await createClient();

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo:
            `${getSiteUrl()}/reset-password`,

          captchaToken:
            normalizedCaptchaToken,
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
          "We couldn't process the password reset request right now. Please complete the security verification again and try later.",
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
  if (!passwordMeetsPolicy(password)) {
    return {
      success: false,
      message:
        "Password must contain 8 to 256 characters, including uppercase and lowercase letters, a number, and a symbol.",
    };
  }

  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message:
          "Your password reset session is no longer valid. Request a new reset link and try again.",
      };
    }

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