import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";

const BORDER = "#E2E8F0";

type QtyStepperProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
};

export function QtyStepper({
  label = "Quantity",
  value,
  onChange,
}: QtyStepperProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onChange(Math.max(0, value - 1))}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.value}
          keyboardType="number-pad"
          value={String(value)}
          onChangeText={(v) => {
            const n = parseInt(v, 10);
            onChange(isNaN(n) || n < 0 ? 0 : n);
          }}
          selectTextOnFocus
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={() => onChange(value + 1)}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 10 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 22, color: "#475569", lineHeight: 28 },
  value: {
    width: 60,
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: BORDER,
    paddingBottom: 2,
  },
});
