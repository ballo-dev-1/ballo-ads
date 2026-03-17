import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/staging-admin/:path*",
        destination: "/dev-admin/:path*",
      },
    ];
  },
};

export default nextConfig;
