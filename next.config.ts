import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude Supabase functions from build
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
