import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import { ProductsDao } from "@/src/lib/dao/products-dao";
import {
  PRESET_REASONS,
  type LoggedItem,
  type PresetReason,
  type Product,
} from "../types/store-types";
import { useLocalSearchParams } from "expo-router";
import {
  countSoldByProduct,
  type ProductSalesCount,
} from "../core/count-sold-by-product";
import { computeRemaining } from "../core/compute-remaining";
import { validateSaleInput } from "../core/validate-sale-input";
import { hasEnoughStock } from "../core/has-enough-stock";
import {
  addSale,
  getSalesByRouteSession,
  getSalesBySessionStore,
  removeSale,
  updateSale,
} from "../services/sales-services";

/**
 * Drives the store distribution log screen: the running sales list for a store visit,
 * the add/edit order modal, and the remaining-stock numbers shown next to each product.
 *
 * Used by the store detail screen so it can read `inventory.*` for the list/modal
 * without knowing how sales are counted, persisted, or how remaining stock is derived.
 *
 * @returns `{ inventory }` — everything the screen needs: sold items, modal form state
 *          and setters, remaining stock per product, and the add/edit/delete handlers.
 */
export function useStoreSales() {
  const { sessionId, sessionStoreId } = useLocalSearchParams<{
    sessionId?: string;
    sessionStoreId?: string;
  }>();
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  //Sales Count holds simply the amount of X product sold, Remaining is derived from taking the session inventory - amount sold of the product_id
  const [salesCounts, setSalesCounts] = useState<
    Record<string, ProductSalesCount>
  >({});
  //Grabe Sales Count
  const refetchSalesCounts = useCallback(() => {
    if (!sessionId) return;
    setSalesCounts(countSoldByProduct(getSalesByRouteSession(sessionId)));
  }, [sessionId]);

  useEffect(() => {
    refetchSalesCounts();
  }, [refetchSalesCounts]);

  //Remaining stock per product_id, e.g. { "prod_123": 7 } — recomputed whenever salesCounts changes
  const [remaining, setRemaining] = useState<Record<string, number>>({});
  //All of these mirror the add/edit order modal's form fields
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [boQty, setBoQty] = useState(0);
  const [boReason, setBoReason] = useState("");
  const [boReasonType, setBoReasonType] = useState<PresetReason | null>(null);

  const [soldItems, setSoldItems] = useState<LoggedItem[]>([]);
  //Which sale row is being edited, null means the modal is in "add new" mode
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  //Snapshot of the sale's qty/boQty before editing, so hasEnoughStock can add it back
  //before checking stock (otherwise editing an order would count its own old qty against itself)
  const [editingOriginal, setEditingOriginal] = useState<{
    qty: number;
    boQty: number;
  } | null>(null);

  useEffect(() => {
    if (!sessionStoreId || !sessionId) return;

    //maps out the price for each product since we dont store price in session inventory
    const priceById = new Map(
      ProductsDao.getAllProducts().map((p) => [p.id, p.price]),
    );

    //Grab the morning inventory for the session
    const items = SessionInventoryDao.getBySessionId(sessionId);

    //set it as the current products held with the price (just to display it)
    setProducts(
      items.map((item) => ({
        id: item.productId,
        name: item.productName,
        price: priceById.get(item.productId) ?? 0,
      })),
    );
    //then we just compute the remaining items based on the sales count, morning inventory - sales per product
    setRemaining(computeRemaining(items, salesCounts));
  }, [visible, sessionId, sessionStoreId, salesCounts]);

  const reloadSoldItems = useCallback(() => {
    if (!sessionStoreId) return;
    setSoldItems(getSalesBySessionStore(sessionStoreId));
  }, [sessionStoreId]);

  useEffect(() => {
    reloadSoldItems();
  }, [reloadSoldItems]);

  const selectReason = (reason: PresetReason) => {
    setBoReasonType(reason);
    setBoReason(reason === "Custom" ? "" : reason);
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setQuantity(0);
    setBoQty(0);
    setBoReason("");
    setBoReasonType(null);
    setEditingSaleId(null);
    setEditingOriginal(null);
  };

  //Saves whatever is in the modal form: either a brand new sale, or an update to
  //editingSaleId if we got here from onItemPress. Bails out quietly on bad input,
  //only alerts the user when the stock check specifically fails.
  const addOrder = () => {
    if (!sessionStoreId || !selectedProduct) return;
    const { valid } = validateSaleInput({ qty: quantity, boQty, boReason });
    if (!valid) return;

    const enough = hasEnoughStock({
      qty: quantity,
      boQty,
      remaining: remaining[selectedProduct.id] ?? 0,
      editingOriginal: editingOriginal ?? undefined,
    });
    if (!enough) {
      Alert.alert(
        "Not enough stock",
        `Not enough ${selectedProduct.name} left to log this order.`,
      );
      return;
    }

    const saleInput = {
      sessionStoreId,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      price: selectedProduct.price,
      qty: quantity,
      boQty,
      boReason,
    };

    if (editingSaleId) {
      updateSale({ ...saleInput, saleId: editingSaleId });
    } else {
      addSale(saleInput);
    }

    //refresh both the list and the counts so remaining stock reflects this order right away
    reloadSoldItems();
    refetchSalesCounts();
    resetForm();
    setVisible(false);
  };

  //Opens the modal pre-filled with an existing sold item, so the user can edit it.
  //idx is the row's position in soldItems (comes from the FlatList index).
  const onItemPress = (idx: number) => {
    const item = soldItems[idx];
    if (!item) return;

    setSelectedProduct(
      //prefer today's product list (has the live price), fall back to what was saved on the sale
      //in case the product was removed/renamed since this sale was logged
      products.find((p) => p.id === item.productId) ?? {
        id: item.productId,
        name: item.productName,
        price: item.price,
      },
    );
    setQuantity(item.qty);
    setBoQty(item.boQty);
    setBoReason(item.boReason ?? "");
    setBoReasonType(
      item.boReason && PRESET_REASONS.includes(item.boReason as PresetReason)
        ? (item.boReason as PresetReason)
        : item.boReason
          ? "Custom"
          : null,
    );
    setEditingSaleId(item.saleId);
    setEditingOriginal({ qty: item.qty, boQty: item.boQty });
    setVisible(true);
  };

  const onDeleteItem = (idx: number) => {
    const item = soldItems[idx];
    if (!item) return;

    Alert.alert(
      "Delete order?",
      `Remove ${item.productName} from this order.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeSale(item.saleId);
            reloadSoldItems();
            refetchSalesCounts();
          },
        },
      ],
    );
  };

  const { needsReason } = validateSaleInput({ qty: quantity, boQty, boReason });

  return {
    inventory: {
      soldItems,
      reloadSoldItems,
      selectedProduct,
      setSelectedProduct,
      quantity,
      setQuantity,
      boQty,
      setBoQty,
      boReason,
      setBoReason,
      boReasonType,
      selectReason,
      salesCounts,
      remaining,
      visible,
      products,
      editingSaleId,
      needsReason,
      open: () => setVisible(true),
      close: () => {
        setVisible(false);
        resetForm();
      },
      addOrder,
      onItemPress,
      onDeleteItem,
    },
  };
}
