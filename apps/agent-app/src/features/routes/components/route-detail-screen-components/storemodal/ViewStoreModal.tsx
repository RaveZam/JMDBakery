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
  removeStoreFromProvince,
  StoreFields,
} from "../../../services/store-save-service";
import { DeleteStoreModal } from "../DeleteStoreModal";
import { styles } from "./styles";

export function ViewStoreModal({
  store,
  provinceId,
  onClose,
  onChanged,
}: ViewStoreModalProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwn = store?.isOwn === true;

  const close = () => {
    setEditing(false);
    setConfirmDelete(false);
    onClose();
  };

  const handleSave = (fields: StoreFields) => {
    if (!store?.province_id) return;
    updateStore(store.id, store.province_id, fields);
    onChanged?.();
    close();
  };

  // Deleting someone else's store would take it off their route too, so for an
  // adopted store this only cuts the link to this province.
  const handleDelete = () => {
    if (!store) return;
    if (isOwn) {
      deleteStore(store.id);
    } else {
      removeStoreFromProvince(provinceId, store.id);
    }
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
                isOwnStore={isOwn}
                onEdit={() => setEditing(true)}
                onDelete={() => setConfirmDelete(true)}
              />
            </>
          ) : null}
        </View>
      </View>

      <DeleteStoreModal
        store={confirmDelete ? store : null}
        isOwnStore={isOwn}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Modal>
  );
}
