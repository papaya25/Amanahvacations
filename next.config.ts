import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Localized pages translate their content on first render (then cache it
  // permanently in Supabase). The very first production build warms that cache
  // language-by-language, so give static generation ample time before the
  // cache is populated; subsequent builds and requests are fast.
  staticPageGenerationTimeout: 300,
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
