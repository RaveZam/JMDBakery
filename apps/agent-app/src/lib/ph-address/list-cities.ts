import { resolveCities } from "./resolve-cities";

/** Cities/municipalities under a province, or [] if the province isn't in the list. */
export function listCities(province: string): string[] {
  return Object.keys(resolveCities(province));
}
