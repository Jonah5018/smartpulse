const LOCAL_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string): string {
  const trimmed = value.trim();

  const withProtocol =
    /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

  const url = new URL(withProtocol);

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "SmartPulse site URL must use HTTP or HTTPS."
    );
  }

  return url.origin;
}

export function getSiteUrl(): string {
  const configuredUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl?.trim()) {
    return normalizeSiteUrl(configuredUrl);
  }

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (vercelUrl?.trim()) {
    return normalizeSiteUrl(vercelUrl);
  }

  return LOCAL_SITE_URL;
}