const destinations = ["/dashboard", "/intelligence", "/journal", "/markets", "/watchlist", "/settings", "/billing"];

export function loginDestination(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) {
    return "/dashboard";
  }
  const url = new URL(value, "https://smartpulse.local");
  if (url.origin !== "https://smartpulse.local" || !destinations.some(path => url.pathname === path || url.pathname.startsWith(`${path}/`))) {
    return "/dashboard";
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
