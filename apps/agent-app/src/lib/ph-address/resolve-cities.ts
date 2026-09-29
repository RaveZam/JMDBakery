import { data } from "./data";
import { findKey } from "./find-key";

/** The city->barangays map for a province, or {} if the province isn't in the list. */
export function resolveCities(province: string): Record<string, string[]> {
  const provinceKey = findKey(Object.keys(data), province);
  return provinceKey ? data[provinceKey] : {};
}
