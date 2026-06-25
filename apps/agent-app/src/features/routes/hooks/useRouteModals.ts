import { useState } from "react";
import { ProvinceRow, StoreRow } from "../types/db-rows";

// Only one modal is ever open at a time — model it as a single state machine
// instead of six independent nullable flags, so two-open-at-once is unrepresentable.
export type ActiveModal =
  | { type: "addProvince" }
  | { type: "addStore"; province: ProvinceRow }
  | { type: "editStore"; store: StoreRow; province: ProvinceRow }
  | { type: "viewStore"; store: StoreRow }
  | { type: "deleteStore"; store: StoreRow }
  | { type: "deleteProvince"; province: ProvinceRow };

export function useRouteModals() {
  const [modal, setModal] = useState<ActiveModal | null>(null);
  return {
    modal,
    open: (next: ActiveModal) => setModal(next),
    close: () => setModal(null),
  };
}
