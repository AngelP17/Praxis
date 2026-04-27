import { headers } from "next/headers";

const DEFAULT_INTERNAL_API_URL = "http://127.0.0.1:8000";

export const getServerApiUrl = async (path: string) => {
  const configuredBase =
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_INTERNAL_API_URL;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const appendPath = (base: string) => {
    const cleanBase = base.replace(/\/$/, "");
    if (cleanBase.endsWith("/api") && normalizedPath.startsWith("/api/")) {
      return `${cleanBase}${normalizedPath.slice(4)}`;
    }
    return `${cleanBase}${normalizedPath}`;
  };

  if (configuredBase.startsWith("http://") || configuredBase.startsWith("https://")) {
    return appendPath(configuredBase);
  }

  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost || requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";

  if (host) {
    return appendPath(`${protocol}://${host}${configuredBase}`);
  }

  return appendPath(DEFAULT_INTERNAL_API_URL);
};
