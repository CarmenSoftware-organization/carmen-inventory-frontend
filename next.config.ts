import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "radix-ui",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@dnd-kit/modifiers",
      "@tanstack/react-table",
      "react-day-picker",
      "cmdk",
    ],
  },
};

export default nextConfig;
