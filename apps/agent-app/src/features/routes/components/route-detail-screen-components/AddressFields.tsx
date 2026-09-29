import { StyleSheet, View } from "react-native";
import { SearchableSelectField } from "@/src/shared/components/SearchableSelectField";
import {
  applyAddressChange,
  type Address,
} from "@/src/shared/helpers/applyAddressChange";
import { listProvinces } from "@/src/lib/ph-address/list-provinces";
import { listCities } from "@/src/lib/ph-address/list-cities";
import { listBarangays } from "@/src/lib/ph-address/list-barangays";

type AddressFieldsProps = {
  address: Address;
  onChange: (address: Address) => void;
};

/** Province -> City -> Barangay, each scoped to the parent already picked. */
export function AddressFields({ address, onChange }: AddressFieldsProps) {
  const cities = listCities(address.province);
  const barangays = listBarangays(address.province, address.city);

  return (
    <View style={styles.group}>
      <SearchableSelectField
        label="Province"
        value={address.province}
        options={listProvinces()}
        onChange={(value) =>
          onChange(applyAddressChange(address, "province", value))
        }
        placeholder="e.g. Metro Manila"
      />
      <SearchableSelectField
        label="City"
        value={address.city}
        options={cities}
        onChange={(value) =>
          onChange(applyAddressChange(address, "city", value))
        }
        placeholder="e.g. Makati City"
        disabled={!address.province}
      />
      <SearchableSelectField
        label="Barangay"
        value={address.barangay}
        options={barangays}
        onChange={(value) =>
          onChange(applyAddressChange(address, "barangay", value))
        }
        placeholder="e.g. Guadalupe Nuevo"
        disabled={!address.city}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 12 },
});
