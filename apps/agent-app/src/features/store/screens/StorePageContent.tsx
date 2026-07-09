import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdderModal } from "../components/AdderModal";
import { OrdersSection } from "../components/OrdersSection";
import { StoreHeader } from "../components/StoreHeader";
import { VisitFooter } from "../components/VisitFooter";

const HEADER_BG = "#0b4c29";
const BODY_BG = "#F0F0EB";

export default function StorePage() {
  let netTotal = 0;
  let confirmVisit = () => {};
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StoreHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OrdersSection />
        <AdderModal />
      </ScrollView>
      <VisitFooter netTotal={netTotal} onConfirm={confirmVisit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: HEADER_BG },
  scroll: { flex: 1, backgroundColor: BODY_BG },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 16 },
});
