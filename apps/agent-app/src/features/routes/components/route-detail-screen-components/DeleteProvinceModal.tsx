import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProvinceRow } from "../../types/db-rows";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";

type Props = {
  province: ProvinceRow | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteProvinceModal({ province, onConfirm, onCancel }: Props) {
  return (
    <Modal
      visible={!!province}
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
          <Text style={m.title}>Delete Province</Text>
          <Text style={m.body}>
            Are you sure you want to delete{" "}
            <Text style={m.highlight}>{province?.name}</Text>?{"\n"}
            All stores in this province will also be removed.
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
