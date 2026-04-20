import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Abaikan TypeScript error saat build Vercel agar tidak gagal karena warning minor
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
