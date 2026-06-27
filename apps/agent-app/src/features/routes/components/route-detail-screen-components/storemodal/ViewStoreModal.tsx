import { Modal, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import { ViewStoreModalProps } from "./types";
import { StoreHeader } from "./StoreHeader";
import { ContactCard } from "./ContactCard";
import { StoreActions } from "./StoreActions";
import { StoreEditForm } from "./StoreEditForm";
import {
  updateStore,
  deleteStore,
  StoreFields,
} from "../../../services/store-save-service";
import { styles } from "./styles";

export function ViewStoreModal({
  store,
  onClose,
  onChanged,
}: ViewStoreModalProps) {
  const [editing, setEditing] = useState(false);

  const close = () => {
    setEditing(false);
    onClose();
  };

  const handleSave = (fields: StoreFields) => {
    if (!store) return;
    updateStore(store.id, store.province_id, fields);
    onChanged?.();
    close();
  };

  const handleDelete = () => {
    if (!store) return;
    deleteStore(store.id);
    onChanged?.();
    close();
  };

  return (
    <Modal
      visible={!!store}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View style={m.backdrop}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={close}
            hitSlop={8}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={18} color="#64748B" />
          </TouchableOpacity>

          {store && editing ? (
            <StoreEditForm
              key={store.id}
              store={store}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          ) : store ? (
            <>
              <StoreHeader store={store} />
              <ContactCard store={store} />
              <StoreActions
                onEdit={() => setEditing(true)}
                onDelete={handleDelete}
              />
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
