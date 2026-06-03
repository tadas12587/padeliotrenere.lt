import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      // Next.js standalone doesn't serve public/ files directly.
      // Rewrite /sw.js to the API route so the Node server handles it.
      { source: "/sw.js", destination: "/api/sw" },
    ];
  },
};

export default nextConfig;
