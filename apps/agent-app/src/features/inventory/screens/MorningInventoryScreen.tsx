import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { InventoryHeader } from "../components/morning-inventory-screen-components/InventoryHeader";
import { InventoryEmptyState } from "../components/morning-inventory-screen-components/InventoryEmptyState";
import { InventoryTable } from "../components/morning-inventory-screen-components/InventoryTable";
import { InventoryFooter } from "../components/morning-inventory-screen-components/InventoryFooter";
import { InventoryAdderModal } from "../components/morning-inventory-screen-components/InventoryAdderModal";
import { useSessionRouteInventory } from "../hooks/useSessionRouteInventory";

const HEADER_BG = "#0b4c29";

export default function MorningInventoryScreen() {
  const { routeName } = useLocalSearchParams<{ routeName?: string }>();
  const [adderOpen, setAdderOpen] = useState(false);
  const { session } = useSessionRouteInventory();

  function handleContinue() {
    if (!session.finishInventory()) return;
    router.replace({
      pathname: "/main/routes/session",
      params: { sessionId: session.id, routeName },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ThemedView style={styles.container}>
        <InventoryHeader />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => setAdderOpen(true)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#1b6e40" />
            <Text style={styles.addBtnText}>Add Product</Text>
          </TouchableOpacity>

          {session.items.length === 0 ? (
            <InventoryEmptyState />
          ) : (
            <InventoryTable
              items={session.items}
              onSetQty={session.setItemQty}
              onRemove={session.removeItem}
            />
          )}
        </ScrollView>

        <InventoryFooter onContinue={handleContinue} />

        <InventoryAdderModal
          visible={adderOpen}
          onClose={() => setAdderOpen(false)}
          onAdded={session.refresh}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: HEADER_BG },
  container: { flex: 1, backgroundColor: "#F0F0EB" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#1b6e40",
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
  },
  addBtnText: { fontSize: 14, fontWeight: "600", color: "#1b6e40" },
});
