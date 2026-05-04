import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/staging-admin/:path*",
        destination: "/dev-admin/:path*",
      },
      {
        source: "/api/crm/:path*",
        destination: "https://dev-api.balloads.com/api/crm/:path*",
      },
    ];
  },
};

export default nextConfig;
