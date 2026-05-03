import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Middleware clones request bodies (default 10MB). Large Apple Notes zips need a higher cap.
    proxyClientMaxBodySize: "150mb",
  },
};

export default nextConfig;
