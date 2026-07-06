import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import { useSessionRoute } from "../context/useSessionRoute";

export function EndRouteModal() {
  const { session } = useSessionRoute();
  return (
    <Modal
      visible={session.isEndModalOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={session.closeEndModal}
    >
      <View style={m.backdrop}>
        <View style={m.content}>
          <View style={m.deleteIconWrap}>
            <Ionicons name="navigate-outline" size={28} color="#EF4444" />
          </View>
          <Text style={m.title}>End Route</Text>
          <Text style={m.body}>
            Are you sure you want to end this route session?
          </Text>
          <View style={m.buttons}>
            <TouchableOpacity
              style={m.cancelButton}
              onPress={session.closeEndModal}
            >
              <Text style={m.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={m.deleteButton}
              onPress={session.actions.endRoute}
            >
              <Text style={m.deleteText}>End Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
