import type { SalesRecord } from "@/app/server/getBaseData";
import { IntelligenceForecastChart } from "./IntelligenceForecastChart";

export function ForecastSection({ data }: { data: SalesRecord[] }) {
  return (
    <section>
      <IntelligenceForecastChart data={data} />
    </section>
  );
}
