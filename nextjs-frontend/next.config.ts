import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['spacetimedb'],
  skipTrailingSlashRedirect: true,
  distDir: 'out',
};

export default nextConfig;
