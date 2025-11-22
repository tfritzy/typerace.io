import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['spacetimedb'],
};

export default nextConfig;
