import { resolveCities } from "./resolve-cities";
import { findKey } from "./find-key";

/** Barangays under a province+city, or [] if either isn't in the list. */
export function listBarangays(province: string, city: string): string[] {
  const cities = resolveCities(province);
  const cityKey = findKey(Object.keys(cities), city);
  return cityKey ? cities[cityKey] : [];
}
