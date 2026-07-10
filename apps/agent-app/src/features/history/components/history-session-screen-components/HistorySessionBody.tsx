import { StyleSheet, ScrollView } from "react-native";
import type { SessionTab } from "./SessionTabs";
import { InventoryComparisonSection } from "./InventoryComparisonSection";
import { StoresSection } from "./StoresSection";

type Props = {
  tab: SessionTab;
};

export function HistorySessionBody({ tab }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {tab === "visits" ? <StoresSection /> : <InventoryComparisonSection />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 100 },
});
