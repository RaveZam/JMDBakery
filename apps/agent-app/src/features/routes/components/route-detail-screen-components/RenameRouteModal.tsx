import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useState } from "react";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";

type Props = {
  visible: boolean;
  currentName: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
};

export function RenameRouteModal({
  visible,
  currentName,
  onSubmit,
  onClose,
}: Props) {
  const [name, setName] = useState(currentName);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSubmit(name);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      onShow={() => setName(currentName)}
    >
      <View style={m.backdrop}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowTick} />
              <Text style={styles.eyebrow}>EDIT ROUTE</Text>
            </View>
            <Text style={styles.title}>Rename route</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Route name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter route name"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              autoFocus
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !canSave && styles.saveDisabled]}
              disabled={!canSave}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 3,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eyebrowTick: {
    width: 3,
    height: 11,
    borderRadius: 2,
    backgroundColor: "#E8B04B",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#B8923F",
  },
  title: {
    fontSize: 19,
    fontWeight: "600",
    color: "#1E293B",
    letterSpacing: -0.3,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 14,
    fontWeight: "400",
    color: "#1E293B",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  saveButton: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b4c29",
  },
  saveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  saveDisabled: {
    backgroundColor: "#94A3B8",
  },
});
