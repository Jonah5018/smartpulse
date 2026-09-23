"use server";

import { getSiteUrl } from "@/lib/config/site-url";
import { createClient } from "@/lib/supabase/server";

interface SignUpInput {
  firstName: string;
  otherNames?: string;
  lastName: string;
  email: string;
  password: string;
  timezone: string;
  acceptedLegal: boolean;
  captchaToken: string;
}

export async function signUpUser({
  firstName,
  otherNames,
  lastName,
  email,
  password,
  timezone,
  acceptedLegal,
  captchaToken,
}: SignUpInput) {
  /*
   * Legal acknowledgement must also be checked
   * on the server. Client-side validation alone
   * can be bypassed.
   */
  if (!acceptedLegal) {
    return {
      success: false,
      message:
        "You must accept the Terms of Service and confirm the legal notices before creating an account.",
    };
  }

  const normalizedFirstName = firstName.trim();
  const normalizedOtherNames =
    otherNames?.trim() || "";
  const normalizedLastName = lastName.trim();
  const normalizedEmail = email
    .trim()
    .toLowerCase();
  const normalizedTimezone = timezone.trim();

  /*
   * Server-side validation protects the action
   * even when a request does not originate from
   * the registration form.
   */
  if (
    !normalizedFirstName ||
    !normalizedLastName
  ) {
    return {
      success: false,
      message:
        "First name and last name are required.",
    };
  }

  if (
    normalizedFirstName.length > 80 ||
    normalizedLastName.length > 80 ||
    normalizedOtherNames.length > 160
  ) {
    return {
      success: false,
      message:
        "Please check the length of your name information.",
    };
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return {
      success: false,
      message:
        "Please enter a valid email address.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      message:
        "Password must contain at least 8 characters.",
    };
  }

  try {
    new Intl.DateTimeFormat("en", {
      timeZone: normalizedTimezone,
    }).format();
  } catch {
    return {
      success: false,
      message:
        "A valid timezone is required.",
    };
  }

  if (!captchaToken.trim()) {
    return {
      success: false,
      message:
        "Complete the security verification before creating your account.",
   };
 }

  try {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.signUp({
        email: normalizedEmail,
        password,

        options: {
          captchaToken,
          emailRedirectTo:
            `${getSiteUrl()}/auth/callback`,

          data: {
            first_name:
              normalizedFirstName,

            other_names:
              normalizedOtherNames ||
              null,

            last_name:
              normalizedLastName,

            timezone:
              normalizedTimezone,
          },
        },
      });

    if (error) {
      console.error(
        "Account registration failed.",
        {
          code: error.code,
          status: error.status,
        }
      );

      return {
        success: false,
        message:
          "We could not create your account. Please check your details and try again.",
      };
    }

    return {
      success: true,
      message:
        "Account created successfully. Please verify your email.",
    };
  } catch (error) {
    console.error(
      "Unexpected account registration error.",
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
        "Something went wrong while creating your account. Please try again.",
    };
  }
}