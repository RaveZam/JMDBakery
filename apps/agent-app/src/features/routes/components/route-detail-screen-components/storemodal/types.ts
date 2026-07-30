import { Store } from "../../../types/db-rows";

export type ViewStoreModalProps = {
  store: Store | null;
  /** The province the store is being viewed under — the link a removal cuts. */
  provinceId: string;
  onClose: () => void;
  /** Called after a successful save, delete, or removal so the parent can refresh. */
  onChanged?: () => void;
};
