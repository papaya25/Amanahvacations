/* Renders a JSON-LD structured-data block. Works in server components; Google
   reads these to show rich results (prices, ratings, breadcrumbs, FAQs). */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
