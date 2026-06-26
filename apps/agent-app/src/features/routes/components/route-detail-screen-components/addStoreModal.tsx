import { useState } from "react";
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
import { ThemedText } from "@/src/shared/components/ThemedText";
import { Colors } from "@/src/shared/constants/Colors";
import StoresDao from "@/src/lib/dao/store-dao";
import { useAddStore } from "../../hooks/useAddStore";
import { useUpdateStore } from "../../hooks/useUpdateStore";

type ExistingStore = {
  id: string;
  name: string;
  province: string;
  city: string;
  barangay: string;
  contact_name: string;
  contact_number: string;
};

interface AddStoreModalProps {
  provinceId: string;
  provinceName: string;
  onClose: () => void;
  onAdded: () => void;
  initialStore?: ExistingStore;
  onUpdated?: () => void;
}

export function AddStoreModal({
  provinceId,
  provinceName,
  onClose,
  onAdded,
  initialStore,
  onUpdated,
}: AddStoreModalProps) {
  const isEditing = !!initialStore;

  const [name, setName] = useState(initialStore?.name ?? "");
  const [province, setProvince] = useState(initialStore?.province ?? "");
  const [city, setCity] = useState(initialStore?.city ?? "");
  const [barangay, setBarangay] = useState(initialStore?.barangay ?? "");
  const [contactName, setContactName] = useState(
    initialStore?.contact_name ?? "",
  );
  const [contactPhone, setContactPhone] = useState(
    initialStore?.contact_number ?? "",
  );

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (isEditing && initialStore) {
      await useUpdateStore(
        initialStore.id,
        name.trim(),
        province.trim(),
        city.trim(),
        barangay.trim(),
        contactName.trim(),
        contactPhone.trim(),
      );
      onUpdated?.();
    } else {
      await useAddStore(
        provinceId,
        name.trim(),
        province.trim(),
        city.trim(),
        barangay.trim(),
        contactName.trim(),
        contactPhone.trim(),
      );

      onAdded();
    }
    handleCancel();
  };

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
              {isEditing ? "Edit Store" : "Add Store"}
            </ThemedText>
            <Text style={styles.subtitle}>
              {isEditing ? `in ${provinceName}` : `to ${provinceName}`}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.fields}>
                <View style={styles.field}>
                  <Text style={styles.label}>Store name *</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Guadalupe Market"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    autoFocus={true}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Province</Text>
                  <TextInput
                    value={province}
                    onChangeText={setProvince}
                    placeholder="e.g. Metro Manila"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                      value={city}
                      onChangeText={setCity}
                      placeholder="e.g. Makati City"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Barangay</Text>
                    <TextInput
                      value={barangay}
                      onChangeText={setBarangay}
                      placeholder="e.g. Guadalupe Nuevo"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Contact name</Text>
                    <TextInput
                      value={contactName}
                      onChangeText={setContactName}
                      placeholder="e.g. Rico"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Contact number</Text>
                    <TextInput
                      value={contactPhone}
                      onChangeText={setContactPhone}
                      placeholder="0917 000 0000"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !name.trim() && styles.addButtonDisabled,
                ]}
                disabled={!name.trim()}
                onPress={handleSubmit}
              >
                <Text style={styles.addButtonText}>
                  {isEditing ? "Save Changes" : "Add Store"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
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
    paddingTop: 20,
    paddingBottom: 24,
    gap: 4,
  },
  modalTitle: {
    fontSize: 18,
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
  },
  fields: {
    gap: 12,
    paddingTop: 4,
  },
  field: {
    gap: 4,
  },
  fieldHalf: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 14,
    color: "#0F172A",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  addButton: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.tint,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
});
