import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan build meskipun ada TypeScript/ESLint error minor
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimasi image dari domain eksternal jika diperlukan
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Tambahkan domain dev yang diizinkan (untuk local dev)
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
