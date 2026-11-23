import { notFound } from "next/navigation";
import { getDocument } from "../actions";
import DocEditor from "./DocEditor";

export const dynamic = "force-dynamic";

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) notFound();
  return <DocEditor doc={doc} />;
}
