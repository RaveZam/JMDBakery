import { listProvinces } from "@/src/lib/ph-address/list-provinces";
import { listCities } from "@/src/lib/ph-address/list-cities";
import { listBarangays } from "@/src/lib/ph-address/list-barangays";
import { findProvince } from "@/src/lib/ph-address/find-province";

test("lists provinces, merging NCR into Metro Manila", () => {
  const provinces = listProvinces();

  expect(provinces).toContain("Metro Manila");
  expect(provinces).toContain("Cagayan");
});

test("lists Metro Manila's cities, including the province-less municipality", () => {
  const cities = listCities("Metro Manila");

  expect(cities).toEqual(expect.arrayContaining(["City of Manila", "Pateros"]));
});

test("matches province lookups case-insensitively", () => {
  expect(listCities("cagayan")).toContain("Tuguegarao City");
});

test("returns no cities for an unknown province", () => {
  expect(listCities("Neverland")).toEqual([]);
});

test("lists barangays for a known province and city", () => {
  const barangays = listBarangays("Cagayan", "Tuguegarao City");

  expect(barangays).toContain("Atulayan Norte");
  expect(barangays.length).toBeGreaterThan(0);
});

test("returns no barangays for an unknown city", () => {
  expect(listBarangays("Cagayan", "Neverland")).toEqual([]);
});

test("finds the official province name regardless of case", () => {
  expect(findProvince("cagayan")).toBe("Cagayan");
});

test("returns an empty string when the province isn't in the list", () => {
  expect(findProvince("Cagayan Valley")).toBe("");
});
