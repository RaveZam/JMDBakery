import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Route } from "../../types/routes-type";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";

type Props = {
  route: Route | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteRouteModal({ route, onCancel, onConfirm }: Props) {
  return (
    <Modal
      visible={!!route}
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
          <Text style={m.title}>Delete Route</Text>
          <Text style={m.body}>
            Are you sure you want to delete{" "}
            <Text style={m.highlight}>{route?.name}</Text>?{"\n"}
            All provinces and stores will be removed.
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
