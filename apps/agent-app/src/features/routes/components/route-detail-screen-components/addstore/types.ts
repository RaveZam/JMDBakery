import type { useStoreSearch } from "../../../hooks/useStoreSearch";
import type { ExistingStore } from "../../../services/store-search-service";

/** The search state the modal and its rows share, straight from the hook. */
export type StoreSearch = ReturnType<typeof useStoreSearch>;

export type AddStoreChoiceModalProps = {
  provinceName: string;
  visible: boolean;
  onRegisterNew: () => void;
  onAddExisting: () => void;
  onClose: () => void;
};

export type AddExistingStoreModalProps = {
  provinceId: string;
  provinceName: string;
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
};

export type AddStoreHandler = (store: ExistingStore) => void;
