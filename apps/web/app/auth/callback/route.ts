import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

function safeNextPath(
  value: string | null
): string {
  if (!value) {
    return "/legal-consent";
  }

  if (
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/legal-consent";
  }

  return value;
}

export async function GET(
  request: Request
) {
  const requestUrl =
    new URL(request.url);

  const code =
    requestUrl.searchParams.get(
      "code"
    );

  const next =
    safeNextPath(
      requestUrl.searchParams.get(
        "next"
      )
    );

  if (code) {
    const supabase =
      await createClient();

    const { error } =
      await supabase.auth
        .exchangeCodeForSession(
          code
        );

    if (!error) {
      return NextResponse.redirect(
        new URL(
          next,
          requestUrl.origin
        )
      );
    }

    console.error(
      "Authentication callback failed.",
      {
        code: error.code,
        status: error.status,
      }
    );
  }

  return NextResponse.redirect(
    new URL(
      "/login?error=email_verification_failed",
      requestUrl.origin
    )
  );
}