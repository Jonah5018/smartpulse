"use server";

import { getSiteUrl } from "@/lib/config/site-url";
import { createClient } from "@/lib/supabase/server";

const GENERIC_MESSAGE =
  "If that email is awaiting verification, a new verification message will be sent.";

export async function resendVerificationEmail(
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
      message: GENERIC_MESSAGE,
    };
  }

  try {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,

        options: {
          emailRedirectTo:
            `${getSiteUrl()}/auth/callback`,
        },
      });

    if (error) {
      console.error(
        "Verification resend failed.",
        {
          code: error.code,
          status: error.status,
        }
      );

      return {
        success: false,
        message:
          "We couldn't resend the verification email right now. Please wait a moment and try again.",
      };
    }

    return {
      success: true,
      message: GENERIC_MESSAGE,
    };
  } catch (error) {
    console.error(
      "Unexpected verification resend error.",
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
        "We couldn't resend the verification email right now. Please try again.",
    };
  }
}