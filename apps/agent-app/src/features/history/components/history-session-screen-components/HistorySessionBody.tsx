import { StyleSheet, ScrollView } from "react-native";
import { MorningInventorySection } from "./MorningInventorySection";
import { StoresSection } from "./StoresSection";

export function HistorySessionBody() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <MorningInventorySection />
      <StoresSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 100 },
});
