import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.STATIC_EXPORT === "true" ? "export" : undefined,
  basePath: "/dota-stats",
  images: { unoptimized: true },
};

export default nextConfig;
