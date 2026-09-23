"use client";

import { Input } from "@/components/ui/input";
import { useRecordsFilters } from "../context/RecordsFiltersContext";
import { RecordsFilterSelect } from "./RecordsFilterSelect";
import { RecordsSearchInput } from "./RecordsSearchInput";

/** Agent/product dropdowns, the province text filter, and the store search box. */
export function RecordsAttributeFilters() {
  const { filters } = useRecordsFilters();

  return (
    <>
      <RecordsFilterSelect
        label="Agent"
        allLabel="All agents"
        value={filters.agent}
        onChange={filters.setAgent}
        options={filters.agentOptions}
      />
      <RecordsFilterSelect
        label="Product"
        allLabel="All products"
        value={filters.product}
        onChange={filters.setProduct}
        options={filters.productOptions}
      />
      <Input
        value={filters.province}
        onChange={(e) => filters.setProvince(e.target.value)}
        placeholder="Province"
        className="w-auto"
        aria-label="Province"
      />
      <RecordsSearchInput />
    </>
  );
}
