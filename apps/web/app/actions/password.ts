"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendPasswordResetEmail(
  email: string
) {
  const supabase = await createClient();

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          "http://localhost:3000/reset-password",
      }
    );

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message:
      "Password reset instructions have been sent to your email.",
  };
}

export async function updatePassword(
  password: string
) {
  const supabase = await createClient();

  const { error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message:
      "Password updated successfully.",
  };
}