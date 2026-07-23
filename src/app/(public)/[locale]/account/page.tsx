import { redirect } from "next/navigation";
import { localizeHref, isLocale, type Locale } from "@/lib/i18n/config";

export default async function AccountIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  redirect(localizeHref("/account/orders", locale));
}
