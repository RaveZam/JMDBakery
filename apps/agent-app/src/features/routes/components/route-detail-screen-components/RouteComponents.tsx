import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ThemedText } from "@/src/shared/components/ThemedText";
import { StoreCard, TenderedCard } from "../../types/routes-type";

export function StoreCard({
  name,
  areaTag,
  location,
  status,
  contactName,
  contactNumber,
  onPress,
}: StoreCard) {
  const content = (
    <View style={styles.storeCard}>
      <View style={styles.cardHeaderRow}>
        <ThemedText
          type="defaultSemiBold"
          style={styles.cardTitle}
          lightColor="#0F172A"
          darkColor="#0F172A"
        >
          {name}
        </ThemedText>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{areaTag}</Text>
        </View>
      </View>
      <ThemedText
        style={styles.cardAddress}
        lightColor="#475569"
        darkColor="#475569"
      >
        {location}
      </ThemedText>
      <ThemedText
        style={styles.cardMeta}
        lightColor="#7C8DA0"
        darkColor="#7C8DA0"
      >
        {status} {"\u2022"} {contactName} {contactNumber}
      </ThemedText>
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

export function TenderedCard({
  routeName,
  areaTag,
  location,
  contactName,
  contactNumber,
}: TenderedCard) {
  return (
    <View style={styles.tenderedCard}>
      <Text style={styles.tenderedLabel}>Tendered</Text>
      <ThemedText
        type="defaultSemiBold"
        style={styles.tenderedTitle}
        lightColor="#FFFFFF"
        darkColor="#FFFFFF"
      >
        {routeName}
      </ThemedText>
      <View style={styles.tenderedMetaRow}>
        <View style={styles.chipMuted}>
          <Text style={styles.chipMutedText}>{areaTag}</Text>
        </View>
        <ThemedText
          style={styles.tenderedAddress}
          lightColor="#EAF7F3"
          darkColor="#EAF7F3"
        >
          {location}
        </ThemedText>
      </View>
      <ThemedText
        style={styles.tenderedContact}
        lightColor="#EAF7F3"
        darkColor="#EAF7F3"
      >
        {contactName} · {contactNumber}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  storeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#1F6B46",
    backgroundColor: "#FFFFFF",
  },
  chipText: {
    fontSize: 11,
    color: "#1F6B46",
    fontWeight: "600",
  },
  cardAddress: {
    fontSize: 13,
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 12,
  },
  tenderedCard: {
    backgroundColor: "#5A9689",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tenderedLabel: {
    color: "#EAF7F3",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  tenderedTitle: {
    fontSize: 22,
    marginBottom: 6,
  },
  tenderedMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  chipMuted: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  chipMutedText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  tenderedAddress: {
    fontSize: 12,
  },
  tenderedContact: {
    fontSize: 12,
    marginTop: 4,
  },
});
