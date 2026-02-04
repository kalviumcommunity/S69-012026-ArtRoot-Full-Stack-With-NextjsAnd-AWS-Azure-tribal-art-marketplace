import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS domains for artwork images
      },
      {
        protocol: 'http',
        hostname: '**', // Allow all HTTP domains for artwork images
      },
    ],
  },
};

export default nextConfig;
