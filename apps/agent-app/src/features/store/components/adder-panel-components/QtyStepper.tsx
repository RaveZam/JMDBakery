import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";

const BORDER = "#E2E8F0";

export function QtyStepper({
  label,
  value,
  onChange,
  accent,
  autoFocus,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  accent?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, accent && styles.labelAccent]}>
        {label}
      </Text>
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
          autoFocus={autoFocus}
        />

        <TouchableOpacity
          style={[styles.btn, accent && styles.btnAccent]}
          onPress={() => onChange(value + 1)}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, accent && styles.btnTextAccent]}>
            +
          </Text>
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
  labelAccent: { color: "#F97316" },
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
  btnAccent: {
    borderColor: "#FDBA74",
    backgroundColor: "#FFF7ED",
  },
  btnText: { fontSize: 22, color: "#475569", lineHeight: 28 },
  btnTextAccent: { color: "#F97316" },
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
