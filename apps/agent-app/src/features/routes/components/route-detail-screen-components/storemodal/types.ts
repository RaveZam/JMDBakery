import { StoreRow } from "../../../types/db-rows";

export type ViewStoreModalProps = {
  store: StoreRow | null;
  onClose: () => void;
  /** Called after a successful save or delete so the parent can refresh. */
  onChanged?: () => void;
};
