import { useMemo, useState } from "react";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { RecordView } from "../types";

/** View/search/province/agent/product filter state, plus the dropdown option lists derived from the dataset. */
export function useRecordsFieldFilters(allRecords: SalesRecord[]) {
  const [view, setView] = useState<RecordView>("all");
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [agent, setAgent] = useState("");
  const [product, setProduct] = useState("");

  const agentOptions = useMemo(
    () => Array.from(new Set(allRecords.map((r) => r.agent))).sort(),
    [allRecords],
  );
  const productOptions = useMemo(
    () => Array.from(new Set(allRecords.map((r) => r.product))).sort(),
    [allRecords],
  );

  return {
    view,
    setView,
    search,
    setSearch,
    province,
    setProvince,
    agent,
    setAgent,
    agentOptions,
    product,
    setProduct,
    productOptions,
  };
}
