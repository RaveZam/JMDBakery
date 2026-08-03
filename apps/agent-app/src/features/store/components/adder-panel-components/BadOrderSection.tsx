import { StyleSheet, View, Text } from "react-native";
import { QtyStepper } from "./QtyStepper";

const BORDER = "#E2E8F0";

type BadOrderSectionProps = {
  value: number;
  onChange: (value: number) => void;
  needsReason: boolean;
};

export function BadOrderSection({
  value,
  onChange,
  needsReason,
}: BadOrderSectionProps) {
  return (
    <>
      <View style={styles.sectionDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>Bad Order</Text>
        <View style={styles.dividerLine} />
      </View>
      <View style={styles.stepperSection}>
        <QtyStepper label="Bad Order Qty" value={value} onChange={onChange} />
        {needsReason && (
          <Text style={styles.reasonWarning}>Reason required</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  stepperSection: {
    alignItems: "center",
    paddingVertical: 4,
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#CBD5E1",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  reasonWarning: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },
});
