import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['spacetimedb'],
};

export default nextConfig;
