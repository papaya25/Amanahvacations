"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import type { ContactInfo } from "@/lib/content/contact";

/* The admin area (/admin/*) renders its own chrome, so the public Header and
   Footer are hidden there. */
export default function SiteFrame({
  children,
  contact,
}: {
  children: React.ReactNode;
  contact?: ContactInfo;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Header />}
      {children}
      {!isAdmin && <Footer contact={contact} />}
    </>
  );
}
