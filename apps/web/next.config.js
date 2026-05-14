/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === "1";

const nextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    if (isVercel) return [];
    const rawApiBase = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";
    const apiBaseUrl = rawApiBase.replace(/\/api\/?$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
