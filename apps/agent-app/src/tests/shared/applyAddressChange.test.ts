import { applyAddressChange } from "@/src/shared/helpers/applyAddressChange";

describe("applyAddressChange", () => {
  const address = {
    province: "Cagayan",
    city: "Tuguegarao City",
    barangay: "Atulayan Norte",
  };

  it("clears city and barangay when the province changes", () => {
    expect(applyAddressChange(address, "province", "Isabela")).toEqual({
      province: "Isabela",
      city: "",
      barangay: "",
    });
  });

  it("clears barangay when the city changes", () => {
    expect(applyAddressChange(address, "city", "Alcala")).toEqual({
      province: "Cagayan",
      city: "Alcala",
      barangay: "",
    });
  });

  it("only touches barangay when the barangay changes", () => {
    expect(applyAddressChange(address, "barangay", "Annafunan East")).toEqual(
      {
        province: "Cagayan",
        city: "Tuguegarao City",
        barangay: "Annafunan East",
      },
    );
  });
});
