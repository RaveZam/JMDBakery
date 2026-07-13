import { fetchSessions } from "@/app/features/records/server/fetch-sessions";
import { RecordsClient } from "@/app/features/records/components/RecordsClient";

type SearchParams = Record<string, string | string[] | undefined>;

export async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const sp = await searchParams;
  const sessions = await fetchSessions();

  return <RecordsClient sessions={sessions} sp={sp} />;
}

export default RecordsPage;
