import { Cormorant_Garamond, Outfit } from "next/font/google";
import "../globals.css";

/* Admin has its own independent root layout (Next.js route-group "multiple
   root layouts" pattern) — no locale, no cart/currency providers, since the
   admin panel is intentionally never translated and never shows a cart. */

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${outfit.variable} antialiased`}>{children}</body>
    </html>
  );
}
