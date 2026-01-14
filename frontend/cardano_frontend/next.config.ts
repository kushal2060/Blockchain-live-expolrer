import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,        
  swcMinify: true,            
  output: "standalone",        
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  typescript: {
    ignoreBuildErrors: false,   
  },
};

export default nextConfig;
