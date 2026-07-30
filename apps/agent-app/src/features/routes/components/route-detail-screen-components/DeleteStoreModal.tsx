import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StoreRow } from "../../types/db-rows";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import { DeleteStoreBody } from "./DeleteStoreBody";

type Props = {
  store: StoreRow | null;
  /** False for another agent's store, where confirming only unlinks it. */
  isOwnStore: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteStoreModal({
  store,
  isOwnStore,
  onConfirm,
  onCancel,
}: Props) {
  const verb = isOwnStore ? "Delete" : "Remove";
  return (
    <Modal
      visible={!!store}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={m.backdrop}>
        <View style={m.content}>
          <View style={m.deleteIconWrap}>
            <Ionicons
              name={isOwnStore ? "trash-outline" : "remove-circle-outline"}
              size={28}
              color="#EF4444"
            />
          </View>
          <Text style={m.title}>{verb} Store</Text>
          <DeleteStoreBody store={store} isOwnStore={isOwnStore} />
          <View style={m.buttons}>
            <TouchableOpacity style={m.cancelButton} onPress={onCancel}>
              <Text style={m.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.deleteButton} onPress={onConfirm}>
              <Text style={m.deleteText}>{verb}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
