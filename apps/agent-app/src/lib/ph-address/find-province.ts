import { data } from "./data";
import { findKey } from "./find-key";

/** The official province name matching `name`, or "" if it isn't in the list. */
export function findProvince(name: string): string {
  return findKey(Object.keys(data), name) ?? "";
}
