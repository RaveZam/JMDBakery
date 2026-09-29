import { data } from "./data";

export function listProvinces(): string[] {
  return Object.keys(data);
}
