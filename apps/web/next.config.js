const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname, "..", ".."),
  },
  async rewrites() {
    const rawApiBase = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";
    const apiBaseUrl = rawApiBase.replace(/\/api\/?$/, "");
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
