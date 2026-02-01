import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Optimize bundle splitting for better performance
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  
  // Enable SWC minification for faster builds
  swcMinify: true,
};

export default nextConfig;
