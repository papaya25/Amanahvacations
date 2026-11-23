import CatalogDetail, { catalogMetadata, catalogStaticParams } from "@/components/CatalogDetail";

type Props = { params: Promise<{ slug: string; locale: string }> };

export const generateStaticParams = () => catalogStaticParams("tour");

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  return catalogMetadata("tour", slug, locale);
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  return <CatalogDetail kind="tour" slug={slug} locale={locale} />;
}
