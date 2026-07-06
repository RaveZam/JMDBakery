import { ScrollView, StyleSheet } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AdderModal } from "./components/AdderModal";
import { StoreHeader } from "./components/StoreHeader";
import { OrdersSection } from "./components/OrdersSection";
import { VisitFooter } from "./components/VisitFooter";
import type { LoggedItem, Product } from "./types/store-types";

const HEADER_BG = "#0b4c29";
const BODY_BG = "#F0F0EB";

// UI-only placeholder data — no DB, services, or business logic.
const STORE_NAME = "Aling Nena's Store";
const STORE_LOCATION = "Poblacion, San Pablo, Laguna";

const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Pandesal", price: 5 },
  { id: "2", name: "Ensaymada", price: 25 },
  { id: "3", name: "Spanish Bread", price: 12 },
  { id: "4", name: "Monay", price: 8 },
  { id: "5", name: "Cheese Roll", price: 20 },
];

const MOCK_ORDERS: LoggedItem[] = [
  {
    saleId: "s1",
    productId: "1",
    productName: "Pandesal",
    price: 5,
    qty: 40,
    boQty: 2,
    boReason: "Damaged",
  },
  {
    saleId: "s2",
    productId: "2",
    productName: "Ensaymada",
    price: 25,
    qty: 12,
    boQty: 0,
  },
  {
    saleId: "s3",
    productId: "3",
    productName: "Spanish Bread",
    price: 12,
    qty: 20,
    boQty: 1,
    boReason: "Rotten",
  },
];

export default function StorePage() {
  const storeName = STORE_NAME;
  const location = STORE_LOCATION;
  const products = MOCK_PRODUCTS;
  const remainingByProduct = {};

  const [loggedItems, setLoggedItems] = useState<LoggedItem[]>(MOCK_ORDERS);
  const [showSoldAdder, setShowSoldAdder] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const soldItems = loggedItems.map((item, idx) => ({ item, idx }));
  const netTotal = loggedItems.reduce((sum, i) => sum + i.qty * i.price, 0);

  const logItem = (
    productId: string,
    qty: number,
    boQty: number,
    boReason?: string,
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setLoggedItems((prev) => [
      ...prev,
      {
        saleId: `local-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        price: product.price,
        qty,
        boQty,
        boReason,
      },
    ]);
  };

  const removeItem = (index: number) =>
    setLoggedItems((prev) => prev.filter((_, i) => i !== index));

  const editItem = (
    index: number,
    productId: string,
    qty: number,
    boQty: number,
    boReason?: string,
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setLoggedItems((prev) =>
      prev.map((it, i) =>
        i !== index
          ? it
          : {
              ...it,
              productId: product.id,
              productName: product.name,
              price: product.price,
              qty,
              boQty,
              boReason,
            },
      ),
    );
  };

  const confirmVisit = () => router.back();

  const modalVisible = showSoldAdder || editIndex !== null;

  const editData =
    editIndex !== null
      ? {
          productId: loggedItems[editIndex].productId,
          qty: loggedItems[editIndex].qty,
          boQty: loggedItems[editIndex].boQty,
          boReason: loggedItems[editIndex].boReason,
        }
      : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StoreHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* <OrdersSection
          items={soldItems}
          onAddPress={() => setShowSoldAdder(true)}
          onItemPress={setEditIndex}
          onDeleteItem={removeItem}
        /> */}
      </ScrollView>

      <AdderModal
        key={editIndex !== null ? `edit-${editIndex}` : "add"}
        visible={modalVisible}
        title={editIndex !== null ? "Edit Order" : "Add Order"}
        products={products}
        showPrice
        editData={editData}
        remainingByProduct={remainingByProduct}
        onAdd={(productId, qty, boQty, boReason) => {
          if (editIndex !== null) {
            editItem(editIndex, productId, qty, boQty, boReason);
            setEditIndex(null);
          } else {
            logItem(productId, qty, boQty, boReason);
            setShowSoldAdder(false);
          }
        }}
        onClose={() => {
          setShowSoldAdder(false);
          setEditIndex(null);
        }}
      />

      {/* <VisitFooter netTotal={netTotal} onConfirm={confirmVisit} /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: HEADER_BG },
  scroll: { flex: 1, backgroundColor: BODY_BG },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 16 },
});
