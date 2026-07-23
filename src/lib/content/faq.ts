/* FAQ content — written by /admin/faq (home/tours/packages lists), read by the
   pages that show FAQ blocks. Each page passes its own built-in list as the
   fallback: until the admin saves FAQs, pages keep their original (richer)
   copy; after a save, the admin's lists win. */

import { createPublicClient, supabaseConfigured } from "@/lib/supabase/public";

export type QA = { q: string; a: string };
export type FaqSection = "home" | "tours" | "packages";

export async function getFaqs(section: FaqSection, fallback: QA[]): Promise<QA[]> {
  if (!supabaseConfigured) return fallback;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", "faq")
      .maybeSingle();
    if (error || !data?.data) return fallback;
    const list = (data.data as Partial<Record<FaqSection, QA[]>>)[section];
    return Array.isArray(list) && list.length ? list : fallback;
  } catch {
    return fallback;
  }
}
