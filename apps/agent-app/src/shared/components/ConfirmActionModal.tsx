import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  body?: string;
  confirmLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function ConfirmActionModal({
  visible,
  onConfirm,
  onCancel,
  title = "Start Session",
  body = "Are you sure you want to start this route session?",
  confirmLabel = "Start",
  icon = "play",
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={m.backdrop}>
        <View style={m.content}>
          <View style={m.confirmIconWrap}>
            <Ionicons name={icon} size={28} color="#0b4c29" />
          </View>
          <Text style={m.title}>{title}</Text>
          <Text style={m.body}>{body}</Text>
          <View style={m.buttons}>
            <TouchableOpacity style={m.cancelButton} onPress={onCancel}>
              <Text style={m.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.confirmButton} onPress={onConfirm}>
              <Text style={m.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
