import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { ThemedText } from "@/src/shared/components/ThemedText";
import { Colors } from "@/src/shared/constants/Colors";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import { createStore, StoreFields } from "../../services/store-save-service";

type AddStoreModalProps = {
  provinceId: string;
  provinceName: string;
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
};

const EMPTY_FIELDS: StoreFields = {
  name: "",
  province: "",
  city: "",
  barangay: "",
  contactName: "",
  contactPhone: "",
};

export function AddStoreModal({
  provinceId,
  provinceName,
  visible,
  onClose,
  onAdded,
}: AddStoreModalProps) {
  const [fields, setFields] = useState<StoreFields>({
    ...EMPTY_FIELDS,
    province: provinceName,
  });
  const setField = (key: keyof StoreFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const canSubmit = fields.name.trim().length > 0;

  const reset = () => setFields({ ...EMPTY_FIELDS, province: provinceName });

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleAdd = () => {
    if (!canSubmit) return;
    createStore(provinceId, fields);
    reset();
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
        <KeyboardAvoidingView
          style={styles.modalContent}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
            Add Store
          </ThemedText>
          <Text style={styles.modalSubtitle}>{provinceName}</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.fields}>
              <Field
                label="Store name *"
                value={fields.name}
                onChangeText={(v) => setField("name", v)}
                placeholder="e.g. Guadalupe Market"
                autoFocus
              />
              <Field
                label="Province"
                value={fields.province}
                onChangeText={(v) => setField("province", v)}
                placeholder="e.g. Metro Manila"
              />
              <Field
                label="City"
                value={fields.city}
                onChangeText={(v) => setField("city", v)}
                placeholder="e.g. Makati City"
              />
              <Field
                label="Barangay"
                value={fields.barangay}
                onChangeText={(v) => setField("barangay", v)}
                placeholder="e.g. Guadalupe Nuevo"
              />
              <Field
                label="Contact name"
                value={fields.contactName}
                onChangeText={(v) => setField("contactName", v)}
                placeholder="e.g. Rico"
              />
              <Field
                label="Contact number"
                value={fields.contactPhone}
                onChangeText={(v) => setField("contactPhone", v)}
                placeholder="0917 000 0000"
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>

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
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  keyboardType?: "default" | "phone-pad";
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoFocus,
  keyboardType,
}: FieldProps) {
  return (
    <View style={styles.modalField}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.modalInput}
        autoFocus={autoFocus}
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
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
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: -8,
  },
  fields: {
    gap: 12,
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
