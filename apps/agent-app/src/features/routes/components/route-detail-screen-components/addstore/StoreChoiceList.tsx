import { Text, TouchableOpacity } from "react-native";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import { StoreChoice } from "./StoreChoice";
import { styles } from "./styles";
import type { AddStoreChoiceModalProps } from "./types";

type Props = Omit<AddStoreChoiceModalProps, "provinceName" | "visible">;

/** The two ways to add a store, plus the way out. */
export function StoreChoiceList({
  onRegisterNew,
  onAddExisting,
  onClose,
}: Props) {
  return (
    <>
      <StoreChoice
        icon="storefront-outline"
        label="Register a new store"
        caption="Enter the details of a store nobody has added yet"
        onPress={onRegisterNew}
        testID="add-store-register-new"
      />
      <StoreChoice
        icon="search-outline"
        label="Add an existing store"
        caption="Find a store another agent already registered"
        onPress={onAddExisting}
        testID="add-store-add-existing"
      />
      <TouchableOpacity
        style={[m.cancelButton, styles.cancel]}
        onPress={onClose}
      >
        <Text style={m.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </>
  );
}
