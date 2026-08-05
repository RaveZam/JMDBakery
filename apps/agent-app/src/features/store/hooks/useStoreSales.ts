import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import { ProvincePriceModifiersDao } from "@/src/lib/dao/province-price-modifiers-dao";
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
import { applyProvincePriceModifier } from "../core/apply-province-price-modifier";
import {
  addSale,
  getSalesByRouteSession,
  getSalesBySessionStore,
  removeSale,
  updateSale,
} from "../services/sales-services";
import { getSessionStoreById } from "../services/store-services";

/**
 * Everything the store screen's order log needs: the product list priced for
 * this store, the add/edit modal's form state, and the orders already logged.
 *
 * Each order carries how it was settled, so one stop can take some goods on
 * credit and be paid cash for the rest. The debt is recorded as the orders are
 * logged rather than at confirm time, so an agent who forgets to confirm the
 * visit still leaves it on record.
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

  //How this one order is being settled. A stop can mix the two, so it's a
  //field on the order like any other, not a setting for the whole visit.
  const [paymentType, setPaymentType] = useState<"cash" | "credit">("cash");

  const [soldItems, setSoldItems] = useState<LoggedItem[]>([]);
  //Which sale row is being edited, null means the modal is in "add new" mode
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  //Snapshot of the sale's qty/boQty before editing, so hasEnoughStock can add it back
  //before checking stock (otherwise editing an order would count its own old qty against itself)
  const [editingOriginal, setEditingOriginal] = useState<{
    quantity: number;
    boQty: number;
  } | null>(null);

  useEffect(() => {
    if (!sessionStoreId || !sessionId) return;

    //Grab the morning inventory for the session — it already carries the name and
    //price snapshotted when the stock was loaded, so nothing here needs the
    //products table. That also means a product deleted mid-session still prices.
    const items = SessionInventoryDao.getBySessionId(sessionId);

    //Province price modifiers (e.g. a keyword like "tuguegarao" knocking a peso
    //off product X) apply on top of that snapshotted price, based on this
    //session store's province.
    const storeProvince =
      getSessionStoreById(sessionStoreId)?.store_province ?? null;
    const modifiers = ProvincePriceModifiersDao.getAllProvincePriceModifiers();

    setProducts(
      items.map((item) => ({
        id: item.productId,
        name: item.productName,
        price: applyProvincePriceModifier(
          item.price,
          item.productId,
          storeProvince,
          modifiers,
        ),
      })),
    );

    //remaining is morning inventory minus what's been sold across the whole route session
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
    //Back to cash every time: an agent who forgets the toggle should log a
    //plain sale, not silently put the store into debt.
    setPaymentType("cash");
    setEditingSaleId(null);
    setEditingOriginal(null);
  };

  const addOrder = () => {
    if (!sessionStoreId || !selectedProduct) return;
    const { valid } = validateSaleInput({ qty: quantity, boQty, boReason });
    if (!valid) return;

    const enough = hasEnoughStock({
      quantity,
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
      paymentType,
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
    setPaymentType(item.paymentType);
    setEditingSaleId(item.saleId);
    setEditingOriginal({ quantity: item.qty, boQty: item.boQty });
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
    //The log itself: what's been ordered at this stop and how to act on a row.
    orders: {
      items: soldItems,
      open: () => setVisible(true),
      onItemPress,
      onDeleteItem,
    },
    //The add/edit modal, in the shape the panel reads it: the modal itself,
    //what's pickable, the form, and how the order settles.
    adder: {
      visible,
      close: () => {
        setVisible(false);
        resetForm();
      },
      submit: addOrder,
      //Whether this is a new order or a correction to one already logged. The
      //sale's id is the hook's business; the panel only changes its wording.
      mode: editingSaleId ? ("edit" as const) : ("add" as const),
      //What can be ordered, priced for this store, with what's left of each.
      catalog: {
        products,
        remaining,
        selected: selectedProduct,
        select: setSelectedProduct,
      },
      form: {
        quantity,
        setQuantity,
        //Damaged or expired stock going back on the truck. Its own group
        //because the reason only exists once there's a quantity to explain.
        badOrder: {
          quantity: boQty,
          setQuantity: setBoQty,
          reason: boReason,
          setReason: setBoReason,
          reasonType: boReasonType,
          selectReason,
          needsReason,
        },
      },
      payment: { type: paymentType, setType: setPaymentType },
    },
  };
}
