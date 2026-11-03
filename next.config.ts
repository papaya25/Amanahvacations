import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Localized pages translate their content on first render (then cache it
  // permanently in Supabase). The very first production build warms that cache
  // language-by-language, so give static generation ample time before the
  // cache is populated; subsequent builds and requests are fast.
  staticPageGenerationTimeout: 300,
  // Admin photo uploads go through a server action; Next's default request cap
  // is 1 MB, which rejected every normal photo with a 500 before our own 8 MB
  // check could run. 10 MB = our limit + form encoding overhead.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    // Vercel bills every resize. Keep resized copies 31 days (default ~4h made
    // the same photo re-transform several times a day) and generate 5 widths
    // instead of 15 — each width is a separate billed transformation.
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 1080, 1920],
    imageSizes: [96, 256],
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
