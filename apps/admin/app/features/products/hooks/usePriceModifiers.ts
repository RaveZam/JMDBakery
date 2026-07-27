import { useEffect, useState } from "react";

import type { PriceModifier, PriceModifierInput } from "../types/product-types";
import {
  addPriceModifier,
  deletePriceModifier,
  getPriceModifiers,
  updatePriceModifier,
} from "../services/priceModifiersService";

type UsePriceModifiersResult = {
  modifiers: {
    rows: PriceModifier[];
    loading: boolean;
    error: string | null;
  };
  editing: {
    editingModifierId: string | null;
    setEditingModifierId: (id: string | null) => void;
  };
  actions: {
    handleAdd: (input: PriceModifierInput) => Promise<void>;
    handleUpdate: (id: string, input: PriceModifierInput) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
  };
};

/**
 * Loads and manages the price modifiers for one product, including which row
 * (if any) is currently being edited.
 *
 * @param productId - The product whose modifiers to load. Re-fetches whenever
 *                     this changes (e.g. the form modal is reused for a
 *                     different product).
 * @returns A grouped object:
 *          - `modifiers`: `{ rows, loading, error }` — the current list, whether
 *            the initial load is in flight, and the last action's error message.
 *          - `editing`: `{ editingModifierId, setEditingModifierId }` — which
 *            row id is in edit mode, or null.
 *          - `actions`: `{ handleAdd, handleUpdate, handleDelete }` — persist a
 *            change to Supabase and update local state to match on success.
 * @sideEffects `handleAdd`/`handleUpdate`/`handleDelete` write to Supabase via
 *              `priceModifiersService`. None of them throw — failures are
 *              surfaced through `modifiers.error` instead.
 */
export function usePriceModifiers(productId: string): UsePriceModifiersResult {
  const [rows, setRows] = useState<PriceModifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingModifierId, setEditingModifierId] = useState<string | null>(null);

  // Initial load: runs once per productId, flips loading off whether it succeeds or fails.
  useEffect(() => {
    getPriceModifiers(productId)
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load price modifiers."))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleAdd(input: PriceModifierInput): Promise<void> {
    setError(null);
    try {
      const created = await addPriceModifier(productId, input);
      //appends the row Supabase returned (has the generated id) rather than a locally-guessed one
      setRows((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add price modifier.");
    }
  }

  async function handleUpdate(id: string, input: PriceModifierInput): Promise<void> {
    setError(null);
    try {
      await updatePriceModifier(id, input);
      //patches just the matching row in place; everything else in the list is untouched
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...input } : row)));
      setEditingModifierId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update price modifier.");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setError(null);
    try {
      await deletePriceModifier(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete price modifier.");
    }
  }

  return {
    modifiers: { rows, loading, error },
    editing: { editingModifierId, setEditingModifierId },
    actions: { handleAdd, handleUpdate, handleDelete },
  };
}
