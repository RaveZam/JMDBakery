import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import { useStoreSearch } from "../../../hooks/useStoreSearch";
import { ExistingStoreResults } from "./ExistingStoreResults";
import { StoreSearchHeader } from "./StoreSearchHeader";
import { styles } from "./styles";
import type { AddExistingStoreModalProps } from "./types";
import type { ExistingStore } from "../../../services/store-search-service";

export function AddExistingStoreModal({
  visible,
  ...props
}: AddExistingStoreModalProps) {
  // Mounted only while open, so each opening runs a fresh search and results
  // from a previous province can never linger.
  if (!visible) return null;
  return <SearchModal {...props} />;
}

function SearchModal({
  provinceId,
  provinceName,
  onClose,
  onAdded,
}: Omit<AddExistingStoreModalProps, "visible">) {
  const search = useStoreSearch(provinceId, provinceName);

  // Stays open after each add so several stores can be taken from one search.
  const handleAdd = (store: ExistingStore): void => {
    search.add(store);
    onAdded();
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={m.backdrop}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <StoreSearchHeader search={search} />
          <ExistingStoreResults search={search} onAdd={handleAdd} />
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
