import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StoreRow } from "../../../types/db-rows";
import { StoreFields } from "../../../services/store-save-service";
import { AddressFields } from "../AddressFields";
import type { Address } from "@/src/shared/helpers/applyAddressChange";
import { styles } from "./styles";

type Props = {
  store: StoreRow;
  onSave: (fields: StoreFields) => void;
  onCancel: () => void;
};

export function StoreEditForm({ store, onSave, onCancel }: Props) {
  const [fields, setFields] = useState<StoreFields>({
    name: store.name,
    province: store.province,
    city: store.city,
    barangay: store.barangay,
    contactName: store.contact_name,
    contactPhone: store.contact_number,
  });

  const setField = (key: keyof StoreFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));
  const setAddress = (address: Address) =>
    setFields((prev) => ({ ...prev, ...address }));

  const canSave = fields.name.trim().length > 0;

  return (
    <View style={styles.editForm}>
      <View style={styles.editHeader}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowTick} />
          <Text style={styles.eyebrow}>EDIT STORE</Text>
        </View>
        <Text style={styles.editTitle}>Update details</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.editFields}>
          <Field
            label="Store name *"
            value={fields.name}
            onChangeText={(v) => setField("name", v)}
            placeholder="e.g. Guadalupe Market"
            autoFocus
          />
          <AddressFields
            address={{
              province: fields.province,
              city: fields.city,
              barangay: fields.barangay,
            }}
            onChange={setAddress}
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

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.85}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.editButton,
            !canSave && styles.saveDisabled,
          ]}
          disabled={!canSave}
          onPress={() => onSave(fields)}
          activeOpacity={0.85}
        >
          <Text style={styles.editText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.input}
        autoFocus={autoFocus}
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}
