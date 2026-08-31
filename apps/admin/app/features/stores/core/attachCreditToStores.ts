import type {
  GroupedStoreRow,
  StoreCredit,
  StoreCreditByStore,
} from "../types/store-types";

const ZERO_CREDIT: Omit<StoreCredit, "storeId"> = {
  creditTaken: 0,
  paidBack: 0,
  balance: 0,
  lastPaymentAt: null,
};

/**
 * Folds credit totals into each grouped store card, summing across every
 * underlying `memberIds` a card merged (see GroupedStoreRow) so a card that
 * absorbed a duplicate DB row isn't missing half its debt.
 */
export function attachCreditToStores(
  stores: GroupedStoreRow[],
  credits: StoreCredit[],
): StoreCreditByStore[] {
  const creditsByStoreId = new Map(credits.map((c) => [c.storeId, c]));

  return stores.map((store) => {
    const memberCredits = store.memberIds
      .map((id) => creditsByStoreId.get(id))
      .filter((c): c is StoreCredit => c !== undefined);

    if (memberCredits.length === 0) {
      return { ...store, ...ZERO_CREDIT };
    }

    const creditTaken = memberCredits.reduce((sum, c) => sum + c.creditTaken, 0);
    const paidBack = memberCredits.reduce((sum, c) => sum + c.paidBack, 0);
    const lastPaymentAt = memberCredits.reduce<string | null>(
      (latest, c) =>
        !latest || (c.lastPaymentAt && c.lastPaymentAt > latest)
          ? c.lastPaymentAt
          : latest,
      null,
    );

    return {
      ...store,
      creditTaken,
      paidBack,
      balance: creditTaken - paidBack,
      lastPaymentAt,
    };
  });
}
