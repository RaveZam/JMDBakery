export type Address = {
  province: string;
  city: string;
  barangay: string;
};

/**
 * Applies one field edit to an address, clearing the fields that depend on
 * it: a new province invalidates city and barangay, a new city invalidates
 * barangay.
 */
export function applyAddressChange(
  address: Address,
  key: keyof Address,
  value: string,
): Address {
  if (key === "province") {
    return { province: value, city: "", barangay: "" };
  }
  if (key === "city") {
    return { ...address, city: value, barangay: "" };
  }
  return { ...address, barangay: value };
}
