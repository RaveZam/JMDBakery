import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import { useState } from "react";
import { ThemedText } from "@/src/shared/components/ThemedText";
import { Colors } from "@/src/shared/constants/Colors";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import { createProvince } from "../../services/province-save-service";

type AddProvinceModalProps = {
  routeId: string;
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
};

export function AddProvinceModal({
  routeId,
  visible,
  onClose,
  onAdded,
}: AddProvinceModalProps) {
  const [provinceName, setProvinceName] = useState("");
  const canSubmit = provinceName.trim().length > 0;

  const handleCancel = () => {
    setProvinceName("");
    onClose();
  };

  const handleAdd = () => {
    if (!canSubmit) return;
    createProvince(routeId, provinceName);
    setProvinceName("");
    onAdded();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={m.backdrop}>
        <View style={styles.modalContent}>
          <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
            Add Province/Municipality
          </ThemedText>

          <View style={styles.modalField}>
            <Text style={styles.label}>Province or Municipality name</Text>
            <TextInput
              value={provinceName}
              onChangeText={setProvinceName}
              placeholder="e.g. Makati, Quezon City"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
              autoFocus
            />
          </View>

          <View style={styles.modalButtonsRow}>
            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={handleCancel}
            >
              <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalPrimaryButton,
                !canSubmit && styles.modalPrimaryButtonDisabled,
              ]}
              disabled={!canSubmit}
              onPress={handleAdd}
            >
              <Text style={styles.modalPrimaryButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    color: Colors.light.text,
  },
  modalField: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 14,
    color: "#0F172A",
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  modalSecondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  modalSecondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  modalPrimaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.tint,
  },
  modalPrimaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalPrimaryButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
});
