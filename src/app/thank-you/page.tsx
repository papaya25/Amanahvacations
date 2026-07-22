import type { Metadata } from "next";
import { Suspense } from "react";
import ThankYouClient from "./ThankYouClient";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your Amanah Vacations booking has been received.",
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <Suspense>
      <ThankYouClient />
    </Suspense>
  );
}
