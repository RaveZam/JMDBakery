import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type SearchableSelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
};

type DropdownItem = { label: string; value: string };

/** A searchable dropdown that suggests from `options` and still accepts free text. */
export function SearchableSelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: SearchableSelectFieldProps) {
  const [query, setQuery] = useState("");

  const data = useMemo<DropdownItem[]>(() => {
    const items = options.map((option) => ({ label: option, value: option }));
    const trimmedQuery = query.trim();
    const hasExactMatch = options.some(
      (option) => option.toLowerCase() === trimmedQuery.toLowerCase(),
    );
    if (trimmedQuery && !hasExactMatch) {
      items.push({ label: `Use "${trimmedQuery}"`, value: trimmedQuery });
    }
    if (value && !options.includes(value)) {
      items.unshift({ label: value, value });
    }
    return items;
  }, [options, query, value]);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Dropdown
        testID={`${label}-dropdown`}
        style={[styles.input, disabled && styles.inputDisabled]}
        containerStyle={styles.dropdownContainer}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        inputSearchStyle={styles.searchInput}
        itemTextStyle={styles.itemText}
        activeColor="#F1F5F9"
        data={data}
        labelField="label"
        valueField="value"
        value={value}
        search
        searchPlaceholder="Search..."
        placeholder={placeholder}
        onChangeText={setQuery}
        onChange={(item: DropdownItem) => onChange(item.value)}
        disable={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 4 },
  label: { fontSize: 13, color: "#64748B", marginBottom: 4 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputDisabled: {
    backgroundColor: "#F1F5F9",
  },
  dropdownContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  placeholder: {
    fontSize: 14,
    color: "#94A3B8",
  },
  selectedText: {
    fontSize: 14,
    color: "#0F172A",
  },
  searchInput: {
    borderRadius: 8,
    borderColor: "#E2E8F0",
    fontSize: 14,
    color: "#0F172A",
  },
  itemText: {
    fontSize: 14,
    color: "#0F172A",
  },
});
