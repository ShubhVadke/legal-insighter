import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "https://legal-reader-backend.onrender.com/api/:path*", // Tumhara Render URL
      },
    ];
  },
};

export default nextConfig;
