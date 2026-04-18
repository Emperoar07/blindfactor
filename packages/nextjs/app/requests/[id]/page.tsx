import { RequestDetailView } from "~~/components/blindfactor/RequestDetailView";

export default async function RequestPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <RequestDetailView requestId={Number(id)} />
    </div>
  );
}
