import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@language-learning/api-contract", "@language-learning/ui"]
};

export default nextConfig;
