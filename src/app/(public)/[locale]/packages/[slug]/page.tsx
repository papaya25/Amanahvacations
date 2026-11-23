import CatalogDetail, { catalogMetadata, catalogStaticParams } from "@/components/CatalogDetail";

type Props = { params: Promise<{ slug: string; locale: string }> };

export const generateStaticParams = () => catalogStaticParams("package");

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  return catalogMetadata("package", slug, locale);
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  return <CatalogDetail kind="package" slug={slug} locale={locale} />;
}
