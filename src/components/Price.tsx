"use client";

import { useCurrency } from "@/lib/currency";

/** An MXN amount shown in the visitor's display currency (server pages can use it). */
export default function Price({ mxn }: { mxn: number }) {
  const { format } = useCurrency();
  return <>{format(mxn)}</>;
}
