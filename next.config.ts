import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admin-uploaded photos live in Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rokrdabaujexuzcaiaum.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
