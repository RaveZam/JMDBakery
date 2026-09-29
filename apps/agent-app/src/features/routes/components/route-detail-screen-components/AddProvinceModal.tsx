import { StyleSheet, View, TouchableOpacity, Text, Modal } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/src/shared/components/ThemedText";
import { SearchableSelectField } from "@/src/shared/components/SearchableSelectField";
import { Colors } from "@/src/shared/constants/Colors";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import { createProvince } from "../../services/province-save-service";
import { listProvinces } from "@/src/lib/ph-address/list-provinces";

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

          <SearchableSelectField
            label="Province or Municipality name"
            value={provinceName}
            options={listProvinces()}
            onChange={setProvinceName}
            placeholder="e.g. Makati, Quezon City"
          />

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
