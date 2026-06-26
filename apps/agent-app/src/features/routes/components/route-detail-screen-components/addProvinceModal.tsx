import { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import { ThemedText } from "@/src/shared/components/ThemedText";
import { Colors } from "@/src/shared/constants/Colors";
import ProvincesDao from "@/src/lib/dao/province-dao";

interface AddProvinceModalProps {
  routeId: string;
  onClose: () => void;
  onAdded: () => void;
}

export function AddProvinceModal({
  routeId,
  onClose,
  onAdded,
}: AddProvinceModalProps) {
  const [provinceName, setProvinceName] = useState("");

  const handleCancel = () => {
    setProvinceName("");
    onClose();
  };

  const handleAdd = () => {
    if (!provinceName.trim()) return;
    ProvincesDao.insertProvince(routeId, provinceName.trim());
    setProvinceName("");
    onAdded();
  };

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalBackdrop}>
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
              autoFocus={true}
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
                !provinceName.trim() && styles.modalPrimaryButtonDisabled,
              ]}
              disabled={!provinceName.trim()}
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
  modalBackdrop: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
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
