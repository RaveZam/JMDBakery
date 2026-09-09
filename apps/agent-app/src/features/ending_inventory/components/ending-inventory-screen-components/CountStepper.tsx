import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { parseCountEntry } from "../../core/parse-count-entry";

const GREEN = "#0b4c29";

type Props = {
  expected: number;
  value: number;
  testIDPrefix: string;
  onStep: (delta: number) => void;
  onSet: (next: number) => void;
};

/**
 * One count column of a product row: the expected number on top, a stepper under
 * it whose value can also be typed straight in for a large count.
 */
export function CountStepper({
  expected,
  value,
  testIDPrefix,
  onStep,
  onSet,
}: Props) {
  return (
    <View style={styles.column}>
      <Text style={styles.expected}>exp {expected}</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          testID={`${testIDPrefix}-decrement`}
          onPress={() => onStep(-1)}
          hitSlop={8}
        >
          <Ionicons name="remove-circle-outline" size={20} color={GREEN} />
        </TouchableOpacity>
        {/* the count drifting off what the system expects is the thing worth noticing */}
        <TextInput
          testID={`${testIDPrefix}-input`}
          style={[styles.value, value !== expected && styles.valueOff]}
          keyboardType="number-pad"
          value={String(value)}
          onChangeText={(text) => onSet(parseCountEntry(text))}
          selectTextOnFocus
        />
        <TouchableOpacity
          testID={`${testIDPrefix}-increment`}
          onPress={() => onStep(1)}
          hitSlop={8}
        >
          <Ionicons name="add-circle-outline" size={20} color={GREEN} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { width: 104, alignItems: "center", gap: 3 },
  expected: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  value: {
    minWidth: 22,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  valueOff: { color: "#B45309" },
});
