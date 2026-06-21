import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (all projects)
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/**' },
      // Allow all HTTPS sources for user-uploaded images (gallery, story, hero, etc.)
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
