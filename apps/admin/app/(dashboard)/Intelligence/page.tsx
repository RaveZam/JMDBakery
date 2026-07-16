import { IntelligencePage } from "@/app/features/Intelligence";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <IntelligencePage searchParams={searchParams} />;
}
