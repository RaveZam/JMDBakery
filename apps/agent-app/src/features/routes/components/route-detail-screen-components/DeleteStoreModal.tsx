import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StoreRow } from "../../types/db-rows";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";

type Props = {
  store: StoreRow | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteStoreModal({ store, onConfirm, onCancel }: Props) {
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
            <Ionicons name="trash-outline" size={28} color="#EF4444" />
          </View>
          <Text style={m.title}>Delete Store</Text>
          <Text style={m.body}>
            Are you sure you want to delete{" "}
            <Text style={m.highlight}>{store?.name}</Text>?
          </Text>
          <View style={m.buttons}>
            <TouchableOpacity style={m.cancelButton} onPress={onCancel}>
              <Text style={m.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.deleteButton} onPress={onConfirm}>
              <Text style={m.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
