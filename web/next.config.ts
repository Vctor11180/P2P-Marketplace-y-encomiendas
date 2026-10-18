import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @chaski/sdk se distribuye como TypeScript fuente
  transpilePackages: ["@chaski/sdk"],
};

export default nextConfig;
