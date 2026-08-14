"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUpUser({
  firstName,
  otherNames,
  lastName,
  email,
  password,
  timezone,
}: {
  firstName: string;
  otherNames?: string;
  lastName: string;
  email: string;
  password: string;
  timezone: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,

    options: {
      emailRedirectTo:
        "http://localhost:3000/auth/callback",

      data: {
        first_name: firstName,
        other_names: otherNames ?? null,
        last_name: lastName,
        timezone,
      },
    },
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
      "Account created successfully. Please verify your email.",
  };
}