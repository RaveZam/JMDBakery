import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { AdderModal } from "../components/AdderModal";
import { OrdersSection } from "../components/OrdersSection";
import { useGetSessionStoreSales } from "../hooks/useGetSessionStoreSales";
import { removeSale } from "../services/sales-services";
import { useProductQuantity } from "../context/useProductQuantity";

import { StoreHeader } from "../components/StoreHeader";

const HEADER_BG = "#0b4c29";
const BODY_BG = "#F0F0EB";

export default function StorePage() {
  const { sessionStoreId } = useLocalSearchParams<{
    sessionStoreId?: string;
  }>();
  const { soldItems, reload } = useGetSessionStoreSales(sessionStoreId ?? "");
  const { adderModal } = useProductQuantity();
  const [, setEditIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StoreHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OrdersSection
          items={soldItems.map((item, idx) => ({ item, idx }))}
          onAddPress={() => {
            setEditIndex(null);
            adderModal.inventory.open();
          }}
          onItemPress={(idx) => {
            setEditIndex(idx);
            adderModal.inventory.open();
          }}
          onDeleteItem={(idx) => {
            const item = soldItems[idx];
            if (!item) return;
            removeSale(item.saleId);
            reload();
          }}
        />
        <AdderModal />
      </ScrollView>
      {/* <VisitFooter netTotal={netTotal} onConfirm={confirmVisit} /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: HEADER_BG },
  scroll: { flex: 1, backgroundColor: BODY_BG },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 16 },
});
